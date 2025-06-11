import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from './routes/auth-routes'
import prisma from "./prisma-client"
import authMiddleware from "./middleware/auth-middleware";

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: `${process.env.BASE_URL}:${PORT}`,
  methods: "GET,POST,PUT,PATCH,DELETE",
  // allowedHeaders: "Content-Type,Authorization",
}));

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// endpoint di auth (register, login, logout, change-password)
app.use('/auth', authRoutes)

// endpoint di salvataggio resoconto settimanale
app.post('/resoconto', authMiddleware, (req: Request, res: Response) => {

  prisma.resoconto.create({
    data: {
      dataInizio: req.body.dataInizio,
      dataFine: req.body.dataFine,
      tipoAttivita: req.body.tipoAttivita,
      attivita: req.body.attivita,
      descrizione: req.body.descrizione,
      personaRiferimento: req.body.personaRiferimento,
      cliente: req.body.cliente,
      colleghiSI: req.body.colleghiSI,
      userId: ''
    }
  })

  console.log('req.body: ', req.body);
  res.send(req.body)
})

app.listen(PORT, () => {
  console.log(`Server running on ${process.env.BASE_URL}:${PORT}`);
});