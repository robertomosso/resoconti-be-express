import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken'

import prisma from "../prisma-client";
import { CustomRequest } from "../interfaces/custom-request.interface";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../errors/http-error";

export const canRegisterUserMiddleware = (requiredRole?: 'register-admin') => {
	return asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
		try {
			// in caso di registrazione admin viene verificata la presenza di utenti sulla user table.
			// se vuota si può registrare il primo utente come admin, senza ulteriori controlli sul token
			if (requiredRole === 'register-admin') {
				const count = await prisma.user.count();
				if (count === 0) {
					next();
				}
			}

			const token = req.headers['authorization'];

			if (!token) {
				throw new HttpError('Nessun token presente', 401);
			}

			const jwtSecret = process.env.JWT_SECRET;
			if (!jwtSecret) {
				throw new HttpError('Errore nella lettura della chiave jwt', 500);
			}

			const decoded = jwt.verify(token, jwtSecret) as { id: string };

			const user = await prisma.user.findUnique({ where: { id: decoded.id } });
			if (!user || user.role !== 'admin') {
				throw new HttpError('Non autorizzato', 403);
			}

			next();
		} catch (error) {
			throw new HttpError('Token non valido', 401);
		}
	})
}