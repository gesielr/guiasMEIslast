// src/pages/DashboardUser.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';
import { decryptData } from '../utils/encryption';

const DashboardUser = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // 1. Pegar usuário autenticado
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate('/cadastro');
        return;
      }
      setUser(authUser);

      // 2. Buscar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (user.user_metadata?.user_type === 'partner') {
        navigate('/dashboard-parceiro');
        return;
        }

        const decryptedDocument = profile.document ? await decryptData(profile.document) : '';
        const decryptedPis = profile.pis ? await decryptData(profile.pis) : '';

        setProfile({
          ...profile,
          document: decryptedDocument,
          pis: decryptedPis,
        });

      // 3. Buscar pagamentos
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData);

      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
      setLoading(false);
    }
  };

    // Dentro de DashboardUser.jsx, após o useEffect de fetchUserData

    useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
        // Limpar URL para não mostrar parâmetros
        window.history.replaceState({}, document.title, "/dashboard");

        // Mostrar mensagem de sucesso
        alert('🎉 Pagamento confirmado! Seu acesso está liberado.');
    }
    }, []);

  const handleEmitNFS = () => {
    if (!profile.onboarding_completed) {
      alert('Complete o onboarding primeiro!');
      return;
    }
    navigate('/emitir-nota');
  };

  const handleEmitGPS = () => {
    if (!profile.onboarding_completed) {
      alert('Complete o onboarding primeiro!');
      return;
    }
    navigate('/emitir-gps');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Carregando seu dashboard...</h2>
        <div style={styles.spinner}>🔄</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2>❌ Erro</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} style={styles.button}>
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Olá, {profile.name}!</h1>
        <p>Seu documento: {profile.document}</p>
      </header>

      {/* Status do Onboarding */}
      <div style={styles.statusCard}>
        <h3>Status do Cadastro</h3>
        <p>
          <strong>Contrato aceito:</strong>{' '}
          {profile.contract_accepted ? '✅ Sim' : '❌ Não'}
        </p>
        <p>
          <strong>Onboarding completo:</strong>{' '}
          {profile.onboarding_completed ? '✅ Sim' : '❌ Não'}
        </p>
        {profile.user_type === 'mei' && (
          <p>
            <strong>Certificado Digital:</strong>{' '}
            {profile.digital_certificate_status === 'issued'
              ? '✅ Emitido'
              : profile.digital_certificate_status === 'scheduled'
              ? '📅 Agendado'
              : '⏳ Pendente'}
          </p>
        )}
      </div>

      {/* Ações Rápidas */}
      <div style={styles.actions}>
        <button onClick={handleEmitNFS} style={styles.actionButton} disabled={!profile.onboarding_completed}>
          📄 Emitir Nota Fiscal de Serviço
        </button>
        <button onClick={handleEmitGPS} style={styles.actionButton} disabled={!profile.onboarding_completed}>
          💰 Emitir Guia de INSS (GPS)
        </button>
      </div>

      {/* Histórico de Pagamentos */}
      <div style={styles.section}>
        <h3>Histórico de Pagamentos</h3>
        {payments.length === 0 ? (
          <p>Você ainda não realizou pagamentos.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.type === 'onboarding' ? 'Adesão' : payment.type.toUpperCase()}</td>
                  <td>R$ {payment.amount.toFixed(2)}</td>
                  <td>
                    {payment.status === 'paid' ? '✅ Pago' : payment.status === 'failed' ? '❌ Falhou' : '⏳ Pendente'}
                  </td>
                  <td>{new Date(payment.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          navigate('/');
        }}
        style={styles.logoutButton}
      >
        Sair
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  actions: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: '15px 30px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    minWidth: '250px',
  },
  section: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    padding: '10px',
    border: '1px solid #dee2e6',
    textAlign: 'center',
  },
  logoutButton: {
    display: 'block',
    margin: '40px auto 0',
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  spinner: {
    textAlign: 'center',
    fontSize: '24px',
    margin: '40px 0',
  },
};

export default DashboardUser;