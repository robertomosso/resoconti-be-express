import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken'

import prisma from "../prisma-client";
import { CustomRequest } from "../interfaces/custom-request";
import { asyncHandler } from "../utils/async-handler";

export const checkUserRoleMiddleware = (requiredRole: 'register-admin' | 'register-user') => {
	return asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
		try {
			const token = req.headers['authorization'];

			if (!token) {
				res.status(401).json({ message: 'No token provided' });
				return
			}

			const jwtSecret = process.env.JWT_SECRET;
			if (!jwtSecret) {
				res.status(500).json({ message: 'Errore generico' });
				return
			}

			const decoded = jwt.verify(token, jwtSecret) as { id: string };

			const user = await prisma.user.findUnique({ where: { id: decoded.id } });
			if (
				!user || 
				(requiredRole === 'register-admin' && user.role !== 'superuser') ||
				(requiredRole === 'register-user' && user.role !== 'superuser' && user.role !== 'admin')
			) {
				return res.status(403).json({ message: 'Non autorizzato' });
			}

			next();
		} catch (error) {
			return res.status(401).json({ message: 'Token non valido' });
		}
	})
}