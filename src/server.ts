import 'dotenv/config';
import express from "express";

import { authMiddleware } from "./middleware/auth.middleware";
import { securityMiddleware } from './middleware/security.middleware';
import { authRateLimiter, globalRateLimiter } from './middleware/rate-limiter.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorLoggerMiddleware } from './middleware/error-logger.middleware';
import authRoutes from './routes/auth-routes'
import resocontoRoutes from './routes/resoconto-routes'
import usersRoutes from './routes/users-routes'

const app = express();

// settaggio necessario se il server è dietro un reverse proxy (e uno solo, come su Render.com)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

// middlewares
app.use(securityMiddleware);
app.use(express.json());
app.use(globalRateLimiter);
app.use(loggerMiddleware());

app.use('/auth', authRateLimiter, authRoutes);
app.use('/users', usersRoutes);
app.use('/resoconto', authMiddleware, resocontoRoutes);

app.use(errorLoggerMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});