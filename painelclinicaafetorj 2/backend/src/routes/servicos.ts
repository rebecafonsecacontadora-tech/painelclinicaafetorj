import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { lerEValidarPlanilha } from '../services/importarPlanilha.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

// Colunas esperadas: Nome, Valor, Descricao
const linhaServicoSchema = z.object({
  Nome: z.string().min(1, 'nome é obrigatório'),
  Valor: z.union([z.string(), z.number()]).transform((v) => Number(String(v).replace(',', '.'))).refine((v) => !isNaN(v) && v >= 0, 'valor inválido'),
  Descricao: z.string().optional().transform((v) => v || null),
});

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM servicos ORDER BY nome ASC');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { nome, valor, descricao } = req.body;
  if (!nome || valor === undefined) {
    return res.status(400).json({ error: { message: 'Nome e valor são obrigatórios.' } });
  }
  const { rows } = await pool.query(
    'INSERT INTO servicos (nome, valor, descricao) VALUES ($1,$2,$3) RETURNING *',
    [nome, valor, descricao ?? null],
  );
  res.status(201).json(rows[0]);
});

router.put('/:codigo', async (req, res) => {
  const { nome, valor, descricao } = req.body;
  const { rows } = await pool.query(
    `UPDATE servicos SET nome=$1, valor=$2, descricao=$3, atualizado_em=now()
     WHERE codigo_tabelado=$4 RETURNING *`,
    [nome, valor, descricao ?? null, req.params.codigo],
  );
  if (!rows[0]) return res.status(404).json({ error: { message: 'Serviço não encontrado.' } });
  res.json(rows[0]);
});

router.delete('/:codigo', async (req, res) => {
  await pool.query('DELETE FROM servicos WHERE codigo_tabelado=$1', [req.params.codigo]);
  res.status(204).send();
});

// Importação em massa via planilha (.xlsx ou .csv)
router.post('/importar', upload.single('arquivo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'Nenhum arquivo enviado.' } });

  const { totalLinhas, validos, erros } = lerEValidarPlanilha(req.file.buffer, linhaServicoSchema);

  const client = await pool.connect();
  let importados = 0;
  try {
    await client.query('BEGIN');
    for (const linha of validos) {
      await client.query(
        'INSERT INTO servicos (nome, valor, descricao) VALUES ($1,$2,$3)',
        [linha.Nome, linha.Valor, linha.Descricao],
      );
      importados++;
    }
    await client.query(
      `INSERT INTO importacoes (entidade, nome_arquivo, total_linhas, total_importados, total_erros, detalhes_erros)
       VALUES ('servicos', $1, $2, $3, $4, $5)`,
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
