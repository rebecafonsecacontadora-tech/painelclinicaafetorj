-- Módulo Cliente
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  cpf_cnpj VARCHAR(20),
  email VARCHAR(200),
  whatsapp VARCHAR(20),
  endereco VARCHAR(300),
  cidade VARCHAR(100),
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Módulo Serviço
CREATE TABLE IF NOT EXISTS servicos (
  codigo_tabelado SERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configuração da conta (logo do cliente, etc.)
CREATE TABLE IF NOT EXISTS configuracao_conta (
  id SERIAL PRIMARY KEY,
  nome_empresa VARCHAR(200),
  logo_url VARCHAR(500),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Log de importações (para auditoria e histórico de uploads de planilha)
CREATE TABLE IF NOT EXISTS importacoes (
  id SERIAL PRIMARY KEY,
  entidade VARCHAR(30) NOT NULL, -- 'clientes' | 'servicos'
  nome_arquivo VARCHAR(300),
  total_linhas INT,
  total_importados INT,
  total_erros INT,
  detalhes_erros JSONB,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
