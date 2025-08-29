import express, { Response } from "express";

import prisma from "../prisma-client"
import { modificaExcel } from "../services/excel-service";
import { CustomRequest } from "../interfaces/custom-request.interface";
import { validateBody } from "../middleware/zod.middleware";
import { resocontoSchema } from "../schemas/zod-schema";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../errors/http-error";

const router = express.Router();

router.get(
	'/ultimo-resoconto',
	asyncHandler(async (req: CustomRequest, res: Response) => {
		if (req.userId) {
			try {
				const ultimoResoconto = await prisma.resoconto.findFirst({
					where: {
						userId: req.userId
					},
					orderBy: {
						createdAt: 'desc'
					}
				});

				if (ultimoResoconto) {
					res.status(200).json(ultimoResoconto);
				} else {
					res.status(404).json({ message: 'Resoconto non trovato' });
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Errore del server'
				throw new HttpError(message, 500);
			}
		} else {
			throw new HttpError('User id non presente', 500);
		}
	})
)

router.post(
	'/inserisciResoconto',
	validateBody(resocontoSchema),
	asyncHandler(async (req: CustomRequest, res: Response) => {
		// si controlla se è presente lo userId nella request, 
		// inserito in fase di login nel token e letto e inserito nella request dall'auth-middleware
		if (req.userId) {
			try {
				// TODO da verificare se continuerà a servire in futuro
				// viene avviato il processo di modifica del file excel presente su drive
				await modificaExcel(req);

				// viene salvato a db il resoconto, solo nel caso la modifica dell'excel sia andata a buon fine
				await prisma.resoconto.create({
					data: { ...req.body, userId: req.userId }
				});

				res.status(201).json({ message: 'Inserimento avvenuto con successo' });
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Errore del server'
				throw new HttpError(message, 500);
			}
		} else {
			throw new HttpError('User id non presente', 500);
		}
	})
)

router.get(
	'/resoconti-utente/:userId',
	asyncHandler(async (req: CustomRequest, res: Response) => {
		const userId = req.params['userId'];

		if (!userId) {
			throw new HttpError('User id non presente', 500);
		}

		try {
			const result = await prisma.resoconto.findMany({
				where: {
					userId
				}
			});

			res.status(200).json({ resoconti: result });
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Errore del server'
			throw new HttpError(message, 500);
		}
	})
)

export default router;