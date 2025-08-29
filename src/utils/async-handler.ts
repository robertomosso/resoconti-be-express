import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from '../interfaces/custom-request.interface';

/**
 * 
 * @param fn helper function per gestire i middleware async, anche per la gestione degli errori
 * @returns
 */
export function asyncHandler(fn: (req: Request | CustomRequest, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request | CustomRequest, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}