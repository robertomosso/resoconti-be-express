import { google } from "googleapis";
import { createWriteStream, createReadStream } from 'fs';
import { HttpError } from "../errors/http-error";

// ----------- AUTH GOOGLE -------------------
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS) : '';
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

export async function downloadExcel(fileId: string, destPath: string) {
    try {
        const dest = createWriteStream(destPath);

        const res = await drive.files.get(
            { fileId, alt: "media" },
            { responseType: "stream" }
        );

        await new Promise<void>((resolve, reject) => {
            res.data
                .on("end", () => resolve())
                .on("error", (err) => reject(err))
                .pipe(dest);

            dest.on("error", (err) => reject(err)); // importante anche lato file system
        });
    } catch (error) {
        console.error(`Errore durante il download del file ${fileId}:`, error);
        const message = error instanceof Error ? error.message : 'Errore del server'
        throw new HttpError(message, 500);
    }
}

export async function uploadExcel(fileId: string, filePath: string) {
    try {
        const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const media = {
            mimeType,
            body: createReadStream(filePath),
        };
        
        await drive.files.update({
            fileId,
            media,
            requestBody: {}, // non serve modificare i metdadati del foglio excel
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Errore del server'
        throw new HttpError(message, 500);
    }
}