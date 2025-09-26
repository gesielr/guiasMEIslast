// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CadastroPage from './pages/CadastroPage';
import CadastroPageMei from './pages/CadastroPageMei';
import CadastroPageGps from './pages/CadastroPageGps';
import PaymentPage from './pages/PaymentPage';
import DashboardUser from './pages/DashboardUser';
import EmitirNotaPage from './pages/EmitirNotaPage';
import EmitirGpsPage from './pages/EmitirGpsPage';
import DashboardPartner from './pages/DashboardPartner';
import AdminDashboard from './pages/AdminDashboard';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/cadastro/mei" element={<CadastroPageMei />} />
          <Route path="/cadastro/autonomo" element={<CadastroPageGps />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pagar" element={<PaymentPage />} />
          <Route path="/dashboard" element={<DashboardUser />} />
          <Route path="/emitir-nota" element={<EmitirNotaPage />} />
          <Route path="/emitir-gps" element={<EmitirGpsPage />} />
          <Route path="/dashboard-parceiro" element={<DashboardPartner />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
