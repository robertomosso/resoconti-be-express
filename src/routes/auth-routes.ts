import express, { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from "../prisma-client"

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
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
            res.status(401).json({ message: 'La password non è corretta' })
            return
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            res.status(500).json({ message: 'Errore generico' });
            return
        }

        const token = jwt.sign({ id: user.id }, jwtSecret, {
            expiresIn: '15m'
        })
        if (!token) {
            res.status(500).json({ message: 'Errore generico' });
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
            res.status(404).json({ message: 'User not found' });
            return
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            res.status(401).json({ message: 'Invalid current password' });
            return
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { 
                password: hashedNewPassword,
                mustChangePassword: false 
            },
        });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error });
    }
});

export default router;