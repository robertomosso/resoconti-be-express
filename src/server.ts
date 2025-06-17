import 'dotenv/config';
import express from "express";

import { authMiddleware } from "./middleware/auth-middleware";
import { securityMiddleware } from './middleware/security-middleware';
import { authRateLimiter, globalRateLimiter } from './middleware/rate-limiter-middleware';
import authRoutes from './routes/auth-routes'
import resocontoRoutes from './routes/resoconto-routes'

const app = express();

const PORT = process.env.PORT || 3000;

// middlewares
app.use(securityMiddleware);
app.use(express.json());
app.use(globalRateLimiter);

// endpoint di auth (register, login, logout, change-password)
app.use('/auth', authRateLimiter, authRoutes);

// endpoint di salvataggio resoconto settimanale
app.use('/resoconto', authMiddleware, resocontoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});