import { Request, Response, NextFunction } from "express";

export const errorLoggerMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const date = new Date().toLocaleString();
    const milliseconds = new Date().getMilliseconds().toString().padStart(3, '0');
    console.error(`ERROR: ${req.method} ${req.hostname} ${req.originalUrl} ${date}.${milliseconds} - ${err.message}`);
    next(err);
};