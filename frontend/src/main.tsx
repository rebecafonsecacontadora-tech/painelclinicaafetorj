import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Cabecalho } from './components/Cabecalho';
import { ClientesPage } from './features/clientes/ClientesPage';
import { ServicosPage } from './features/servicos/ServicosPage';
import './styles.css';

function App() {
  return (
    <BrowserRouter>
      <Cabecalho />
      <nav className="menu-principal">
        <Link to="/clientes">Clientes</Link>
        <Link to="/servicos">Serviços</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/servicos" element={<ServicosPage />} />
          <Route path="/" element={<ClientesPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
