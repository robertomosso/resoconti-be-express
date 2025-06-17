import path from 'path';
import exceljs from 'exceljs';
import { promises } from 'fs';

import { downloadExcel, uploadExcel } from './google-drive-service';
import { CustomRequest } from '../interfaces/custom-request';

export async function modificaExcel(req: CustomRequest) {
    if (req.fileId) {
        const fileId = req.fileId;
        const tempPath = path.join(__dirname, '..', '..', 'temp.xlsx');
    
		// il file excel viene scaricato in un file temporaneo, 
		// modificato (aggiunta una riga nell'ultimo foglio),
		// ricaricato su drive,
		// in ultimo il file temporaneo generato localmente viene cancellato 
        try {
            await downloadExcel(fileId, tempPath);
            await appendRowToExcel(tempPath, req.body);
            await uploadExcel(fileId, tempPath);
            await promises.unlink(tempPath);
        } catch (error) {
            throw error;
        }
    } else {
        throw new Error("fileId non presente");
    }
}

export async function appendRowToExcel(filePath: string, values: any) {
	const workbook = new exceljs.Workbook();

	try {
		await workbook.xlsx.readFile(filePath);

		// viene recuperato l'ultimo foglio del file excel
		const lastSheet = workbook.worksheets[workbook.worksheets.length - 1];

		// viene valutata l'ultima riga utilizzata
		const lastUsedRowNumber = getLastUsedRow(lastSheet);
		const newRowNumber = lastUsedRowNumber + 1;
		const newRow = lastSheet.getRow(newRowNumber);

		const dataInizio = new Date(values.dataInizio);
		const dataFine = new Date(values.dataFine);
		newRow.values = [
			dataInizio,
			dataFine,
			values.tipoAttivita,
			values.attivita,
			values.descrizione,
			values.personaRiferimento,
			values.cliente,
			values.colleghiSI,
			values.note,
		];

		// per ogni cella viene applicato lo stile e il formato
		newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			};
			cell.font = { name: 'Arial', size: 11 };

			// imposta il formato data solo per le colonne 1 e 2 (date)
			if (colNumber === 1 || colNumber === 2) {
				cell.numFmt = 'dd/mm/yyyy';
			}
		});

		await workbook.xlsx.writeFile(filePath);
	} catch (error) {
		throw error;
	}
}

function getLastUsedRow(sheet: exceljs.Worksheet) {
	// viene ricercata la prima riga valorizzata partendo dall'ultima riga del file
	for (let i = sheet.rowCount; i >= 1; i--) {
		const row = sheet.getRow(i);
		if (rowHasValues(row)) return i;
	}
	// nel caso non ci sia nessuna riga valorizzata si ritorna 0
	return 0;
}

function rowHasValues(row: exceljs.Row) {
	const values = Array.isArray(row.values) ? row.values : [];
	return values.some(cell => cell !== null && cell !== undefined && cell !== '');
}