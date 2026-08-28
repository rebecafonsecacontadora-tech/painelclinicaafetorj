import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import clientesRouter from './routes/clientes.js';
import servicosRouter from './routes/servicos.js';
import configuracaoRouter from './routes/configuracao.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/clientes', clientesRouter);
app.use('/servicos', servicosRouter);
app.use('/configuracao', configuracaoRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: { message: err.message || 'Erro interno.' } });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
