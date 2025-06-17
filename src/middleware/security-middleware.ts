import helmet from 'helmet';
import cors from "cors";

const ORIGIN = process.env.ORIGIN || 'http://localhost:4201';

export const securityMiddleware = [
    cors({
      origin: ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
    helmet(),
];