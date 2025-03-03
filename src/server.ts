import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors({
  origin: "http://localhost:4201",
  methods: "GET,POST,PUT,PATCH,DELETE",
  // allowedHeaders: "Content-Type,Authorization",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/resoconto', (req: Request, res: Response) => {
console.log('req.body: ', req.body);
  res.send(req.body)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});