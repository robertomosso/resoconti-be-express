import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken'

import { CustomRequest } from "../interfaces/custom-request";

function authMiddleware(req: CustomRequest, res: Response, next: NextFunction): void {
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

	jwt.verify(token, jwtSecret, (err, decoded) => {
		if (err) {
			res.status(401).json({ message: 'Token non valido' });
			return
		}

		// nel token inserisco sia l'id che il fileId dello user
		// lo userId servirà nella creazione di un nuovo resoconto (in resoconto-routes)
		// il fileId nel download del file excel corretto (in excel-service)
		req.userId = (decoded as jwt.JwtPayload)?.id;
		req.fileId = (decoded as jwt.JwtPayload)?.fileId;
		next();
	})
}

export default authMiddleware;