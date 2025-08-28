import express, { Response } from "express";

import prisma from "../prisma-client"
import { CustomRequest } from "../interfaces/custom-request";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get('/has-user', async (req: CustomRequest, res: Response) => {
	try {
		const count = await prisma.user.count();
		res.json({ hasUser: count > 0 })
	} catch (error) {
		res.status(500).json({ error })
	}
})

router.get('/get-users', authMiddleware, async (req: CustomRequest, res: Response) => {
	try {
		// TODO filtrare per utenti con solo role user?
		const users = await prisma.user.findMany({
			select: {
                id: true,
                name: true,
                // email: true,
                // mustChangePassword: true,
                // fileId: true,
                // role: true
            }
		});
		res.json({ users })
	} catch (error) {
		res.status(500).json({ error })
	}
})

export default router;
