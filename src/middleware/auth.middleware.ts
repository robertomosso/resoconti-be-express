import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken'

import { CustomRequest } from "../interfaces/custom-request.interface";
import { HttpError } from "../errors/http-error";

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
	const token = req.headers['authorization'];

	if (!token) {
		throw new HttpError('Nessun token presente', 401);
	}
	
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		throw new HttpError('Errore nella lettura della chiave jwt', 500);
	}
	
	jwt.verify(token, jwtSecret, (err, decoded) => {
		if (err) {
			throw new HttpError('Token non valido', 401);
		}

		// nel token inserisco sia l'id che il fileId dello user
		// lo userId servirà nella creazione di un nuovo resoconto (in resoconto-routes)
		// il fileId nel download del file excel corretto (in excel-service)
		req.userId = (decoded as jwt.JwtPayload)?.id;
		req.fileId = (decoded as jwt.JwtPayload)?.fileId;
		next();
	})
}