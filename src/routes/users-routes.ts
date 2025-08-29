import express, { Response } from "express";

import prisma from "../prisma-client"
import { CustomRequest } from "../interfaces/custom-request.interface";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../errors/http-error";

const router = express.Router();

router.get(
	'/has-user',
	asyncHandler(async (req: CustomRequest, res: Response) => {
		try {
			const count = await prisma.user.count();
			res.json({ hasUser: count > 0 })
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Errore del server'
			throw new HttpError(message, 500);
		}
	})
)

router.get(
	'/get-users',
	authMiddleware,
	asyncHandler(async (req: CustomRequest, res: Response) => {
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
			const message = error instanceof Error ? error.message : 'Errore del server'
			throw new HttpError(message, 500);
		}
	})
)

export default router;
