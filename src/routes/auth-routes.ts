import express, { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import prisma from "../prisma-client"
import { validateBody } from "../middleware/zod.middleware";
import { checkUserRoleMiddleware } from "../middleware/check-user-role.middleware";
import {
	changePasswordSchema,
	loginSchema,
	registerUserSchema,
	registerSuperuserSchema,
	registerAdminSchema
} from "../schemas/zod-schema";

const router = express.Router();

const dominio = process.env.DOMINIO || '';

router.post('/register-superuser', validateBody(registerSuperuserSchema), async (req: Request, res: Response) => {
	try {
		const count = await prisma.user.count();

		// se ci sono già utenti bloccare le operazioni successive
		if (count > 0) {
			res.status(401).json({ message: 'Operazione non autorizzata' })
		}

		const { name, email, password, fileId } = req.body;

		if (name && email?.includes(dominio) && password) {
			const hashedPassword = await bcrypt.hash(password, 10);

			await prisma.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
					role: 'superuser',
					mustChangePassword: false,
					fileId,
				}
			});

			res.status(200).json({ message: 'Registrazione effettuata con successo' });
		} else {
			res.status(500).json({ message: 'Dati inseriti non validi' })
		}
	} catch (error) {
		res.status(500).json({ error })
	}
})

// questa rotta può chiamarla solo user con role "superuser"
router.post(
	'/register-admin',
	checkUserRoleMiddleware('register-admin'),
	validateBody(registerAdminSchema),
	async (req: Request, res: Response) => {
		const { name, email, password, fileId } = req.body;

		if (name && email?.includes(dominio) && password && fileId) {
			try {
				const hashedPassword = await bcrypt.hash(password, 10);

				await prisma.user.create({
					data: {
						name,
						email,
						password: hashedPassword,
						role: 'admin'
					}
				});

				res.status(200).json({ message: 'Registrazione effettuata con successo' });
			} catch (error) {
				// TODO da migliorare messaggio di errore nel caso di email già utilizzata (code P2002)
				res.status(500).json({ error })
			}
		} else {
			res.status(500).json({ message: 'Dati inseriti non validi' })
		}
	})

// questa rotta può chiamarla user con role "superuser" o "admin"
router.post(
	'/register-user',
	checkUserRoleMiddleware('register-user'),
	validateBody(registerUserSchema),
	async (req: Request, res: Response) => {
		const { name, email, password, fileId } = req.body;

		if (name && email?.includes(dominio) && password && fileId) {
			try {
				const hashedPassword = await bcrypt.hash(password, 10);

				await prisma.user.create({
					data: {
						name,
						email,
						password: hashedPassword,
						fileId,
						role: 'user'
					}
				});

				res.status(200).json({ message: 'Registrazione effettuata con successo' });
			} catch (error) {
				res.status(500).json({ error })
			}
		} else {
			res.status(500).json({ message: 'Dati inseriti non validi' })
		}
	})

router.post('/login', validateBody(loginSchema), async (req: Request, res: Response): Promise<void> => {
	const { email, password } = req.body;

	if (email?.includes(dominio) && password) {
		try {
			const user = await prisma.user.findUnique({
				where: { email }
			})
			if (!user) {
				res.status(404).json({ message: 'Utente non trovato' })
				return
			}

			const passwordIsValid = await bcrypt.compare(password, user.password);
			if (!passwordIsValid) {
				res.status(401).json({ message: 'Email/password non corretta' })
				return
			}

			const jwtSecret = process.env.JWT_SECRET;
			if (!jwtSecret) {
				console.log('Errore nella lettura della chiave jwt');
				res.status(500).json({ message: 'Errore del server' });
				return
			}

			// nel token inserisco sia l'id che il fileId dello user
			// lo userId servirà nella creazione di un nuovo resoconto (in resoconto-routes)
			// il fileId nel download del file excel corretto (in excel-service)
			const token = jwt.sign(
				{ id: user.id, fileId: user.fileId },
				jwtSecret,
				{ expiresIn: '15m' }
			);
			if (!token) {
				console.log('Errore nella generazione del token');
				res.status(500).json({ message: 'Errore del server' });
				return
			}

			const { password: userPassword, ...userWithoutPass } = user;

			res.status(200).json({
				message: 'Login effettuato con successo',
				user: userWithoutPass,
				token,
			});
		} catch (error) {
			res.status(500).json({ error });
		}
	} else {
		res.status(500).json({ message: 'Dati inseriti non validi' });
	}
})


router.post('/change-password', validateBody(changePasswordSchema), async (req: Request, res: Response): Promise<void> => {
	const { email, currentPassword, newPassword } = req.body;

	if (email?.includes(dominio) && currentPassword && newPassword) {
		try {
			const user = await prisma.user.findUnique({ where: { email } });
			if (!user) {
				res.status(404).json({ message: 'Utente non trovato' });
				return
			}

			const isValid = await bcrypt.compare(currentPassword, user.password);
			if (!isValid) {
				res.status(401).json({ message: 'Password attuale non corretta' });
				return
			}

			const hashedNewPassword = await bcrypt.hash(newPassword, 10);

			const updatedUser = await prisma.user.update({
				where: { email },
				data: {
					password: hashedNewPassword,
					mustChangePassword: false,
				},
			});

			const { password: userPassword, ...userWithoutPass } = updatedUser;

			res.status(200).json({
				message: 'Password aggiornata correttamente',
				user: userWithoutPass
			});
		} catch (error) {
			res.status(500).json({ error });
		}
	} else {
		res.status(500).json({ message: 'Dati inseriti non validi' });
	}
});

export default router;