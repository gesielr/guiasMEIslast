// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CadastroPage from './pages/CadastroPage';
import PaymentPage from './pages/PaymentPage';
import DashboardUser from './pages/DashboardUser';
import EmitirNotaPage from './pages/EmitirNotaPage';
import EmitirGpsPage from './pages/EmitirGpsPage'; // ← ADICIONE ESTA LINHA
import DashboardPartner from './pages/DashboardPartner';
import AdminDashboard from './pages/AdminDashboard';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/pagar" element={<PaymentPage />} />
          <Route path="/dashboard" element={<DashboardUser />} />
          <Route path="/emitir-nota" element={<EmitirNotaPage />} />
          <Route path="/emitir-gps" element={<EmitirGpsPage />} /> {/* ← ADICIONE ESTA LINHA */}
          <Route path="/dashboard-parceiro" element={<DashboardPartner />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
