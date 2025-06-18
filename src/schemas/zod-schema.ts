import { z } from "zod";

const dominio = process.env.DOMINIO || '';

export const registerSchema = z.object({
    name: z.string(),
    email: z
        .string()
        .email()
        .refine(email => email.endsWith(dominio), {
            message: 'Email non valida',
        }),
    password: z
        .string()
        .min(8)
        .max(16),
    fileId: z.string(),
});

export const loginSchema = z.object({
    email: z
        .string()
        .email()
        .refine(email => email.endsWith(dominio), {
            message: 'Email non valida',
        }),
    password: z
        .string()
        .min(8)
        .max(16),
});

export const changePasswordSchema = z.object({
    email: z
        .string()
        .email()
        .refine(email => email.endsWith(dominio), {
            message: 'Email non valida',
        }),
    currentPassword: z
        .string()
        .min(8)
        .max(16),
    newPassword: z.
        string()
        .min(8)
        .max(16),
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
        .max(100),
    descrizione: z
        .string()
        .max(500),
    personaRiferimento: z
        .string()
        .max(50),
    cliente: z
        .string()
        .max(100),
    colleghiSI: z
        .string()
        .max(100).optional(),
    note: z
        .string()
        .max(500).optional(),
    userId: z
        .string()
        .uuid(),
})