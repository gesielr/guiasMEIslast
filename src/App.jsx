// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CadastroPage from './pages/CadastroPage';
import PaymentPage from './pages/PaymentPage';
import DashboardUser from './pages/DashboardUser';
import EmitirNotaPage from './pages/EmitirNotaPage';
import EmitirGpsPage from './pages/EmitirGpsPage';
import AdminDashboard from './pages/AdminDashboard';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import LoginPage from './pages/LoginPage';

import ProfileSelect from './pages/Onboarding/ProfileSelect';
import RegisterMEI from './pages/Auth/RegisterMEI';
import RegisterAutonomo from './pages/Auth/RegisterAutonomo';
import RegisterParceiro from './pages/Auth/RegisterParceiro';
import TwoFactor from './pages/Auth/TwoFactor';
import NFSeWizard from './pages/NFSe/NFSeWizard';
import GPSGenerator from './pages/GPS/GPSGenerator';
import ClientesPage from './pages/Clientes/ClientesPage';
import Historico from './pages/Historico/Historico';
import PixCheckout from './pages/Payments/PixCheckout';
import MeiDashboard from './pages/Dashboard/Mei';
import AutonomoDashboard from './pages/Dashboard/Autonomo';
import ParceiroDashboard from './pages/DashboardPartner';

import { AuthProvider } from './auth/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/onboarding/profile-select" element={<ProfileSelect/>} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/cadastro/mei" element={<RegisterMEI />} />
            <Route path="/cadastro/autonomo" element={<RegisterAutonomo />} />
            <Route path="/cadastro/parceiro" element={<RegisterParceiro />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/2fa" element={<TwoFactor />} />
            <Route path="/pagar" element={<PaymentPage />} />
            <Route path="/checkout/pix" element={<PixCheckout />} />
            <Route path="/dashboard" element={<DashboardUser />} />
            <Route path="/dashboard/mei" element={<MeiDashboard />} />
            <Route path="/dashboard/autonomo" element={<AutonomoDashboard />} />
            <Route path="/dashboard-parceiro" element={<ParceiroDashboard />} />
            <Route path="/emitir-nota" element={<EmitirNotaPage />} />
            <Route path="/nfs-e/new" element={<NFSeWizard />} />
            <Route path="/emitir-gps" element={<EmitirGpsPage />} />
            <Route path="/gps/new" element={<GPSGenerator />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
