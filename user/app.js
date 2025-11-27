// carrega variáveis de ambiente
import dotenv from 'dotenv';
dotenv.config();

// imports
import express, { json } from 'express';
import cors from 'cors';

// importar rotas
import UserRoute from './routes/UserRoute.js';

// express
const app = express();
app.use(cors());
app.use(json());

// porta
const PORT = process.env.PORT

// definir rotas
app.use(UserRoute);

// inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});