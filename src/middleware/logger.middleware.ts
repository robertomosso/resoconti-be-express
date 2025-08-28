import { NextFunction, Request, Response } from "express"

export const loggerMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - start;
            const date = new Date().toLocaleString();
            const milliseconds = new Date().getMilliseconds().toString().padStart(3, '0');
            console.log(`${req.method} ${res.statusCode} ${req.hostname} ${req.originalUrl} ${duration}ms ${date}.${milliseconds}`);
        })

        next();
    }
}