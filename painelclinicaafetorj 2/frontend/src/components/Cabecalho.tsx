import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function Cabecalho() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState<string | null>(null);

  useEffect(() => {
    api.get('/configuracao').then(({ data }) => {
      setLogoUrl(data.logo_url ?? data.logoUrl ?? null);
      setNomeEmpresa(data.nome_empresa ?? data.nomeEmpresa ?? null);
    });
  }, []);

  return (
    <header className="cabecalho-app">
      {logoUrl ? (
        <img src={logoUrl} alt={nomeEmpresa ?? 'Logo'} className="logo-cliente" />
      ) : (
        <div className="logo-cliente logo-cliente--vazia">{nomeEmpresa ?? 'Painel Clínica'}</div>
      )}
      {nomeEmpresa && <span className="nome-empresa">{nomeEmpresa}</span>}
    </header>
  );
}
