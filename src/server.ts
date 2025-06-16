import 'dotenv/config';
import express from "express";
import cors from "cors";

import authMiddleware from "./middleware/auth-middleware";
import authRoutes from './routes/auth-routes'
import resocontoRoutes from './routes/resoconto-routes'

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:4201',             // per sviluppo locale
  'https://tuo-frontend.onrender.com', // dominio del frontend su Render
];

app.use(cors({
  origin: allowedOrigins,
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
}));

app.use(express.json());

// endpoint di auth (register, login, logout, change-password)
app.use('/auth', authRoutes);

// endpoint di salvataggio resoconto settimanale
app.use('/resoconto', authMiddleware, resocontoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});