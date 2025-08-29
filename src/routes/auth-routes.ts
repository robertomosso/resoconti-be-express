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
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../errors/http-error"

const router = express.Router();
const dominio = process.env.DOMINIO || '';

router.post(
	'/register-superuser',
	validateBody(registerSuperuserSchema),
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const count = await prisma.user.count();

			// se ci sono già utenti bloccare le operazioni successive
			if (count > 0) {
				throw new HttpError('Operazione non autorizzata', 401);
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
				throw new HttpError('Dati inseriti non validi', 400);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Errore del server'
			throw new HttpError(message, 500);
		}
	})
)

// questa rotta può chiamarla solo user con role "superuser"
router.post(
	'/register-admin',
	checkUserRoleMiddleware('register-admin'),
	validateBody(registerAdminSchema),
	asyncHandler(async (req: Request, res: Response) => {
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

				const message = error instanceof Error ? error.message : 'Errore del server'
				throw new HttpError(message, 500);
			}
		} else {
			throw new HttpError('Dati inseriti non validi', 400);
		}
	})
)

// questa rotta può chiamarla user con role "superuser" o "admin"
router.post(
	'/register-user',
	checkUserRoleMiddleware('register-user'),
	validateBody(registerUserSchema),
	asyncHandler(async (req: Request, res: Response) => {
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
				const message = error instanceof Error ? error.message : 'Errore del server'
				throw new HttpError(message, 500);
			}
		} else {
			throw new HttpError('Dati inseriti non validi', 400);
		}
	})
)

router.post(
	'/login',
	validateBody(loginSchema),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		const { email, password } = req.body;

		if (email?.includes(dominio) && password) {
			try {
				const user = await prisma.user.findUnique({
					where: { email }
				})
				if (!user) {
					throw new HttpError('Utente non trovato', 404);
				}

				const passwordIsValid = await bcrypt.compare(password, user.password);
				if (!passwordIsValid) {
					throw new HttpError('Email/password non corretta', 401);
				}

				const jwtSecret = process.env.JWT_SECRET;
				if (!jwtSecret) {
					throw new HttpError('Errore nella lettura della chiave jwt', 500);
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
					throw new HttpError('Errore nella generazione del token', 500);
				}

				const { password: userPassword, ...userWithoutPass } = user;

				res.status(200).json({
					message: 'Login effettuato con successo',
					user: userWithoutPass,
					token,
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Errore del server'
				throw new HttpError(message, 500);
			}
		} else {
			throw new HttpError('Dati inseriti non validi', 400);
		}
	})
)


router.post(
	'/change-password',
	validateBody(changePasswordSchema),
	asyncHandler(async (req: Request, res: Response): Promise<void> => {
		const { email, currentPassword, newPassword } = req.body;

		if (email?.includes(dominio) && currentPassword && newPassword) {
			try {
				const user = await prisma.user.findUnique({ where: { email } });
				if (!user) {
					throw new HttpError('Utente non trovato', 404);
				}

				const isValid = await bcrypt.compare(currentPassword, user.password);
				if (!isValid) {
					throw new HttpError('Password attuale non corretta', 401);
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
				const message = error instanceof Error ? error.message : 'Errore del server'
				throw new HttpError(message, 500);
			}
		} else {
			throw new HttpError('Dati inseriti non validi', 400);
		}
	})
);

export default router;