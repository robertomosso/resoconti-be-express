import { z } from "zod";

const dominio = process.env.DOMINIO || '';

export const registerSchema = z.object({
    name: z.string(),
    email: z
        .string()
        .email('Inserire un\'email valida')
        .refine(email => email.endsWith(dominio), {
            message: 'Email non valida',
        }),
    password: z
        .string()
        .min(8, 'Inserire minimo 8 caratteri')
        .max(16, 'Inserire massimo 16 caratteri'),
    fileId: z.string(),
});

export const loginSchema = z.object({
    email: z
        .string()
        .email('Inserire un\'email valida')
        .refine(email => email.endsWith(dominio), {
            message: 'Email non valida',
        }),
    password: z
        .string()
        .min(8, 'Inserire minimo 8 caratteri')
        .max(16, 'Inserire massimo 16 caratteri'),
});

export const changePasswordSchema = z.object({
    email: z
        .string()
        .email('Inserire un\'email valida')
        .refine(email => email.endsWith(dominio), {
            message: 'Email non valida',
        }),
    currentPassword: z
        .string()
        .min(8, 'Inserire minimo 8 caratteri')
        .max(16, 'Inserire massimo 16 caratteri'),
    newPassword: z.
        string()
        .min(8, 'Inserire minimo 8 caratteri')
        .max(16, 'Inserire massimo 16 caratteri'),
});

export const resocontoSchema = z.object({
    dataInizio: z
        .string(),
    dataFine: z
        .string(),
    tipoAttivita: z
        .string(),
    attivita: z
        .string()
        .max(100, 'Il testo può avere massimo 100 caratteri'),
    descrizione: z
        .string()
        .max(500, 'Il testo può avere massimo 500 caratteri'),
    personaRiferimento: z
        .string()
        .max(50, 'Il testo può avere massimo 50 caratteri'),
    cliente: z
        .string()
        .max(100, 'Il testo può avere massimo 100 caratteri'),
    colleghiSI: z
        .string()
        .max(100, 'Il testo può avere massimo 100 caratteri').optional(),
    note: z
        .string()
        .max(500, 'Il testo può avere massimo 500 caratteri').optional(),
    userId: z
        .string()
        .uuid(),
})