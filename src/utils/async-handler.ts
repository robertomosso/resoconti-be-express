import { Request, Response, NextFunction } from 'express';

/**
 * 
 * @param fn helper function per gestire i middleware async, anche per la gestione degli errori
 * @returns
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}