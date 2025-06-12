import express, { Response } from "express";
import prisma from "../prisma-client"

import { modificaExcel } from "../services/excel-service";
import { CustomRequest } from "../interfaces/custom-request";

const router = express.Router();

router.post('/', async (req: CustomRequest, res: Response) => {
	if (req.userId) {
		try {
			await prisma.resoconto.create({
				data: { ...req.body, userId: req.userId}
			});

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