import rateLimit from 'express-rate-limit';

const message = 'Troppe richieste. Riprova più tardi.';

export const authRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // max 5 richieste per IP
  message
});

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // max 100 richieste per IP
  message
});
