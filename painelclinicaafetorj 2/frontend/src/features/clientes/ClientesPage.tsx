import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../api/client';
import { ImportarPlanilha } from '../../components/ImportarPlanilha';

interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  whatsapp: string | null;
  endereco: string | null;
  cidade: string | null;
}

export function ClientesPage() {
  const [lista, setLista] = useState<Cliente[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nome: '', cpfCnpj: '', email: '', whatsapp: '', endereco: '', cidade: '' });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    const { data } = await api.get('/clientes');
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
      await api.post('/clientes', form);
      setMostrarForm(false);
      setForm({ nome: '', cpfCnpj: '', email: '', whatsapp: '', endereco: '', cidade: '' });
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
        <h1>Clientes</h1>
        <div className="pagina-acoes">
          <ImportarPlanilha
            endpoint="/clientes/importar"
            onConcluido={carregar}
            urlModelo="/modelos/modelo-clientes.xlsx"
          />
          <button onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Novo cliente'}
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
            placeholder="CPF/CNPJ"
            value={form.cpfCnpj}
            onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="WhatsApp"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />
          <input
            placeholder="Endereço"
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          />
          <input
            placeholder="Cidade"
            value={form.cidade}
            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
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
            <th>CPF/CNPJ</th>
            <th>Email</th>
            <th>WhatsApp</th>
            <th>Cidade</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((c) => (
            <tr key={c.id}>
              <td>{c.nome}</td>
              <td>{c.cpf_cnpj ?? '-'}</td>
              <td>{c.email ?? '-'}</td>
              <td>{c.whatsapp ?? '-'}</td>
              <td>{c.cidade ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
