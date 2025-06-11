import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];

    if (!token) {
        res.status(401).json({ message: 'No token provided' })
        return
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({ message: 'Errore generico' });
        return
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token non valido' })
        }

        req.userId = (decoded as jwt.JwtPayload)?.id;
        next();
    })

}

export default authMiddleware;
