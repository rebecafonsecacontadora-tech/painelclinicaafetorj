import { Router } from 'express';
import multer from 'multer';
import { pool } from '../db/pool.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Formato de imagem não suportado (use PNG, JPG, SVG ou WEBP).'), ok);
  },
});
const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM configuracao_conta ORDER BY id DESC LIMIT 1');
  res.json(rows[0] ?? { nomeEmpresa: null, logoUrl: null });
});

// Upload da logo do cliente. Em produção, o ideal é enviar para um storage (Cloudinary/S3)
// e salvar apenas a URL pública aqui — este endpoint já está preparado para isso,
// bastando trocar a função `salvarArquivoNoStorage` pela integração real.
router.post('/logo', upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'Nenhuma imagem enviada.' } });

  const logoUrl = await salvarArquivoNoStorage(req.file);

  const { rows: existentes } = await pool.query('SELECT id FROM configuracao_conta ORDER BY id DESC LIMIT 1');
  let resultado;
  if (existentes[0]) {
    ({ rows: [resultado] } = await pool.query(
      'UPDATE configuracao_conta SET logo_url=$1, atualizado_em=now() WHERE id=$2 RETURNING *',
      [logoUrl, existentes[0].id],
    ));
  } else {
    ({ rows: [resultado] } = await pool.query(
      'INSERT INTO configuracao_conta (logo_url) VALUES ($1) RETURNING *',
      [logoUrl],
    ));
  }
  res.json(resultado);
});

// Placeholder: troque por upload real (ex.: Cloudinary) quando configurar as credenciais.
async function salvarArquivoNoStorage(file: Express.Multer.File): Promise<string> {
  throw new Error(
    'Storage de imagens ainda não configurado. Configure Cloudinary/S3 e implemente salvarArquivoNoStorage().',
  );
}

export default router;
