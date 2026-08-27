import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../api/client';
import { ImportarPlanilha } from '../../components/ImportarPlanilha';

interface Servico {
  codigo_tabelado: number;
  nome: string;
  valor: string;
  descricao: string | null;
}

export function ServicosPage() {
  const [lista, setLista] = useState<Servico[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nome: '', valor: '', descricao: '' });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    const { data } = await api.get('/servicos');
    setLista(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await api.post('/servicos', { nome: form.nome, valor: Number(form.valor), descricao: form.descricao || undefined });
      setMostrarForm(false);
      setForm({ nome: '', valor: '', descricao: '' });
      carregar();
    } catch (err: any) {
      setErro(err.response?.data?.error?.message ?? 'Não foi possível salvar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <h1>Serviços</h1>
        <div className="pagina-acoes">
          <ImportarPlanilha
            endpoint="/servicos/importar"
            onConcluido={carregar}
            urlModelo="/modelos/modelo-servicos.xlsx"
          />
          <button onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Novo serviço'}
          </button>
        </div>
      </div>

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="formulario">
          {erro && <p className="erro">{erro}</p>}
          <input
            placeholder="Nome *"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
          <input
            placeholder="Valor *"
            type="number"
            step="0.01"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            required
          />
          <input
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
          <button type="submit" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Valor</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((s) => (
            <tr key={s.codigo_tabelado}>
              <td>{s.nome}</td>
              <td>{Number(s.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td>{s.descricao ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
