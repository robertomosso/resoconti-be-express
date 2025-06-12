import express, { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import prisma from "../prisma-client"

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
	const { name, email, password, fileId } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				fileId
			}
		});

		res.status(200).json({ message: 'Registrazione effettuata con successo' });
	} catch (error) {
		res.status(500).json({ error })
	}
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
	const { email, password } = req.body;

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
			res.status(500).json({ message: 'Errore nella lettura della chiave' });
			return
		}

		// nel token inserisco sia l'id che il fileId dello user
		// lo userId servirà nella creazione di un nuovo resoconto (in resoconto-routes)
		// il fileId nel download del file excel corretto (in excel-service)
		const token = jwt.sign(
			{
				id: user.id,
				fileId: user.fileId
			},
			jwtSecret,
			{
				expiresIn: '15m'
			}
		);
		if (!token) {
			res.status(500).json({ message: 'Errore nella generazione del token' });
			return
		}

		res.status(200).json({ message: 'Login effettuato con successo', token });
	} catch (error) {
		res.status(500).json({ error });
	}
})


router.post('/change-password', async (req: Request, res: Response): Promise<void> => {
	const { email, currentPassword, newPassword } = req.body;

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

		await prisma.user.update({
			where: { email },
			data: {
				password: hashedNewPassword,
				mustChangePassword: false,
			},
		});

		res.status(200).json({ message: 'Password aggiornata correttamente' });
	} catch (error) {
		res.status(500).json({ error });
	}
});

export default router;