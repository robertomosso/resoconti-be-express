import { Request, Response, NextFunction } from "express";

export const errorLoggerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    const date = new Date().toLocaleString();
    const milliseconds = new Date().getMilliseconds().toString().padStart(3, '0');
    const status = err.status || 500;
    console.error(`ERROR: ${status} - ${req.method} ${req.hostname} ${req.originalUrl} - ${date}.${milliseconds} - ${err.message} - ${err.stack}`);
    res.status(status).json({ message: err.message });
};