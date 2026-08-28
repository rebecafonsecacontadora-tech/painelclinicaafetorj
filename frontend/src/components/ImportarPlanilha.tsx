import { ChangeEvent, useRef, useState } from 'react';
import { api } from '../api/client';

interface Props {
  endpoint: string;
  onConcluido: () => void;
  urlModelo?: string;
}

export function ImportarPlanilha({ endpoint, onConcluido, urlModelo }: Props) {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erros, setErros] = useState<{ linha: number; erros: string[] }[]>([]);
  const [carregando, setCarregando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

async function handleArquivo(e: ChangeEvent<HTMLInputElement>) {
  const arquivo = e.target.files?.[0];
  if (!arquivo) return;

  setCarregando(true);
  setMensagem(null);
  setErros([]);

  const formData = new FormData();
  formData.append('arquivo', arquivo);

  try {
    const { data } = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setMensagem(
      `${data.importados} de ${data.totalLinhas} linha(s) importada(s) com sucesso.` +
      (data.erros.length ? ` ${data.erros.length} linha(s) com erro.` : ''),
      );
    setErros(data.erros ?? []);
    onConcluido();
  } catch (err: any) {
    setMensagem(err.response?.data?.error?.message ?? 'Erro ao importar a planilha.');
  } finally {
    setCarregando(false);
    if (inputRef.current) inputRef.current.value = '';
  }
}

return (
  <div className="importar-planilha">
  <input
    ref={inputRef}
    type="file"
    accept=".xlsx,.xls,.csv"
    onChange={handleArquivo}
    disabled={carregando}
    id="input-importar-planilha"
    style={{ display: 'none' }}
    />
  <label htmlFor="input-importar-planilha" className="botao-secundario">{carregando ? 'Importando...' : 'Importar planilha'}</label>
    {urlModelo && (
    <a href={urlModelo} download className="link-modelo">Baixar modelo</a>
    )}
    {mensagem && <p className="mensagem-importacao">{mensagem}</p>}
    {erros.length > 0 && (
    <ul className="lista-erros-importacao">
      {erros.map((e) => (
      <li key={e.linha}>Linha {e.linha}: {e.erros.join(', ')}</li>
      ))}
    </ul>
  )}
  </div>
    );
    }
    
