import express, { Response } from "express";
import prisma from "../prisma-client"

import { modificaExcel } from "../services/excel-service";
import { CustomRequest } from "../interfaces/custom-request";

const router = express.Router();

router.get('/', async (req: CustomRequest, res: Response) => {
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
			res.status(500).json({ error });
		}
	} else {
		res.status(500).json({ message: 'User id non presente' });
	}
})

router.post('/', async (req: CustomRequest, res: Response) => {
	// si controlla se è presente lo userId nella request, 
	// inserito in fase di login nel token e letto e inserito nella request dall'auth-middleware
	if (req.userId) {
		try {
			await prisma.resoconto.create({
				data: { ...req.body, userId: req.userId}
			});

			// viene avviato il processo di modifica del file excel presente su drive
			await modificaExcel(req);

			res.status(201).json({ message: 'Inserimento avvenuto con successo' });
		} catch (error) {
			res.status(500).json({ error });
		}
	} else {
		res.status(500).json({ message: 'User id non presente' });
	}
})

export default router;