import { google } from "googleapis";
import { createWriteStream, createReadStream } from 'fs';

// ----------- AUTH GOOGLE -------------------
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS) : '';
const auth = new google.auth.GoogleAuth({
	credentials,
	scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

export async function downloadExcel(fileId: string, destPath: string) {
    const dest = createWriteStream(destPath);
    const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );
    await new Promise<void>((resolve, reject) => {
        res.data
            .on('end', () => resolve())
            .on('error', reject)
            .pipe(dest);
    });
}

export async function uploadExcel(fileId: string, filePath: string) {
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const media = {
        mimeType,
        body: createReadStream(filePath),
    };

    try {
        await drive.files.update({
            fileId,
            media,
            requestBody: {}, // non serve modificare i metdadati del foglio excel
        });
    } catch (error) {
        throw error;
    }
}