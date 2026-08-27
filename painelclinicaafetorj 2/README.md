# Painel Clínica AFE-TO/RJ

## Estrutura
- `backend/` — API Node.js + Express + PostgreSQL
- `frontend/` — React + Vite

## Rodando localmente

**Backend**
```
cd backend
cp .env.example .env   # preencha DATABASE_URL
npm install
psql $DATABASE_URL -f src/db/schema.sql   # cria as tabelas
npm run dev
```

**Frontend**
```
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Importação de planilha

### Clientes (`/clientes/importar`)
Cabeçalho esperado na 1ª linha da planilha (.xlsx ou .csv):

| Nome | CPF_CNPJ | Email | WhatsApp | Endereco | Cidade | Observacoes |
|---|---|---|---|---|---|---|

Apenas **Nome** é obrigatório.

### Serviços (`/servicos/importar`)
| Nome | Valor | Descricao |
|---|---|---|

**Nome** e **Valor** são obrigatórios (Valor aceita vírgula ou ponto decimal).

Linhas com erro são reportadas individualmente (número da linha + motivo) e não interrompem a importação das linhas válidas.

## Logo do cliente
`POST /configuracao/logo` (campo `logo`, PNG/JPG/SVG/WEBP até 2MB) — atualmente lança erro proposital até um storage (Cloudinary/S3) ser configurado em `backend/src/routes/configuracao.ts`, função `salvarArquivoNoStorage`.

## Próximos módulos (roadmap)
- Profissionais, Agendamento, Financeiro, Prontuário + RBAC (ver especificação técnica original)
- Emissão de NFS-e via certificado digital (e-CNPJ A1) — depende de definir o provedor intermediário (Focus NFe / PlugNotas) e o município de referência
