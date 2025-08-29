import { Request, Response, NextFunction } from 'express';

/**
 * 
 * @param fn helper function per gestire i middleware async, anche per la gestione degli errori. 
 * Con tipizzazione esplicita tramite generics può accettare tutti i tipi che estendono Request (come CustomRequest)
 * @returns
 */
export function asyncHandler<
  Req extends Request = Request,
  Res extends Response = Response
>(
    fn: (req: Req, res: Res, next: NextFunction) => Promise<any>
) {
    return (req: Req, res: Res, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}