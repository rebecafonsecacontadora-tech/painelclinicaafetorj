import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { lerEValidarPlanilha } from '../services/importarPlanilha.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

// Schema de uma linha da planilha de clientes.
// Colunas esperadas (cabeçalho na 1ª linha): Nome, CPF_CNPJ, Email, WhatsApp, Endereco, Cidade, Observacoes
const linhaClienteSchema = z.object({
  Nome: z.string().min(1, 'nome é obrigatório'),
  CPF_CNPJ: z.union([z.string(), z.number()]).optional().transform((v) => (v === undefined ? null : String(v))),
  Email: z.string().email('email inválido').optional().or(z.literal('')).transform((v) => v || null),
  WhatsApp: z.union([z.string(), z.number()]).optional().transform((v) => (v === undefined || v === '' ? null : String(v))),
  Endereco: z.string().optional().transform((v) => v || null),
  Cidade: z.string().optional().transform((v) => v || null),
  Observacoes: z.string().optional().transform((v) => v || null),
});

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM clientes ORDER BY nome ASC');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { nome, cpfCnpj, email, whatsapp, endereco, cidade, observacoes } = req.body;
  if (!nome) return res.status(400).json({ error: { message: 'Nome é obrigatório.' } });
  const { rows } = await pool.query(
    `INSERT INTO clientes (nome, cpf_cnpj, email, whatsapp, endereco, cidade, observacoes)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [nome, cpfCnpj ?? null, email ?? null, whatsapp ?? null, endereco ?? null, cidade ?? null, observacoes ?? null],
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { nome, cpfCnpj, email, whatsapp, endereco, cidade, observacoes } = req.body;
  const { rows } = await pool.query(
    `UPDATE clientes SET nome=$1, cpf_cnpj=$2, email=$3, whatsapp=$4, endereco=$5, cidade=$6,
     observacoes=$7, atualizado_em=now() WHERE id=$8 RETURNING *`,
    [nome, cpfCnpj ?? null, email ?? null, whatsapp ?? null, endereco ?? null, cidade ?? null, observacoes ?? null, req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: { message: 'Cliente não encontrado.' } });
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM clientes WHERE id=$1', [req.params.id]);
  res.status(204).send();
});

// Importação em massa via planilha (.xlsx ou .csv)
router.post('/importar', upload.single('arquivo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'Nenhum arquivo enviado.' } });

  const { totalLinhas, validos, erros } = lerEValidarPlanilha(req.file.buffer, linhaClienteSchema);

  const client = await pool.connect();
  let importados = 0;
  try {
    await client.query('BEGIN');
    for (const linha of validos) {
      await client.query(
        `INSERT INTO clientes (nome, cpf_cnpj, email, whatsapp, endereco, cidade, observacoes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [linha.Nome, linha.CPF_CNPJ, linha.Email, linha.WhatsApp, linha.Endereco, linha.Cidade, linha.Observacoes],
      );
      importados++;
    }
    await client.query(
      `INSERT INTO importacoes (entidade, nome_arquivo, total_linhas, total_importados, total_erros, detalhes_erros)
       VALUES ('clientes', $1, $2, $3, $4, $5)`,
      [req.file.originalname, totalLinhas, importados, erros.length, JSON.stringify(erros)],
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  res.json({ totalLinhas, importados, erros });
});

export default router;
