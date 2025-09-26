// src/pages/DashboardPartner.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';
import { decryptData } from '../utils/encryption';
import logo from '../assets/logo.png';

const DashboardPartner = () => {
  const [partner, setPartner] = useState(null);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({ total_nfse: 0, total_gps: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newClient, setNewClient] = useState({ document: '', name: '' });
  const navigate = useNavigate();

  const calculateStats = useCallback(async (clientList) => {
    if (!clientList?.length) return;
    const clientIds = clientList.map(c => c.client_id);

    const { data: nfseData, error: nfseError } = await supabase.from('nfse_emissions').select('id').in('user_id', clientIds).eq('status', 'issued');
    if (nfseError) throw nfseError;

    const { data: gpsData, error: gpsError } = await supabase.from('gps_emissions').select('value').in('user_id', clientIds).eq('status', 'issued');
    if (gpsError) throw gpsError;

    const nfseCount = nfseData?.length || 0;
    const gpsTotalValue = gpsData?.reduce((sum, gps) => sum + gps.value, 0) || 0;
    const totalRevenue = (nfseCount * 3.0) + (gpsTotalValue * 0.06);

    setStats({ total_nfse: nfseCount, total_gps: gpsData?.length || 0, total_revenue: totalRevenue });
  }, []);

  const fetchPartnerData = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser || authUser.user_metadata?.user_type !== 'partner') {
        navigate('/login');
        return;
      }

      const { data: partnerData, error: partnerError } = await supabase.from('partners').select('*').eq('id', authUser.id).single();
      if (partnerError) throw partnerError;
      setPartner(partnerData);

      const { data: clientData, error: clientError } = await supabase
        .from('partner_clients')
        .select('client_id, created_at, profile:profiles!inner(*)')
        .eq('partner_id', authUser.id);
      if (clientError) throw clientError;

      const decryptedClients = await Promise.all(
        clientData.map(async (client) => {
          const decryptedDocument = client.profile.document ? await decryptData(client.profile.document) : '';
          return { ...client, profile: { ...client.profile, document: decryptedDocument } };
        })
      );
      setClients(decryptedClients);
      await calculateStats(decryptedClients);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
      setLoading(false);
    }
  }, [navigate, calculateStats]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

  const handleAddClient = async (e) => {
    e.preventDefault();
    // Add client logic here
  };
  
  const formatDocument = (doc) => {
    const cleanDoc = doc.replace(/\D/g, '');
    if (cleanDoc.length === 11) return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (cleanDoc.length === 14) return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return doc;
  };

  if (loading) return <div style={styles.centered}><div style={styles.spinner}></div></div>;
  if (error) return <div style={styles.centered}><p>{error}</p></div>;

  return (
    <div style={styles.dashboardContainer}>
      <aside style={styles.sidebar}>
        <img src={logo} alt="Rebelo App Logo" style={styles.logo} />
        <nav style={styles.nav}>
          <button style={{...styles.navLink, ...styles.activeNavLink}}><span>📊</span> Dashboard Parceiro</button>
          <button style={styles.navLink}><span>👥</span> Meus Clientes</button>
          <button style={styles.navLink}><span>💰</span> Minhas Comissões</button>
        </nav>
        <div style={styles.logoutButton} onClick={() => supabase.auth.signOut().then(() => navigate('/'))}>
          <span>🚪</span> Sair
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h2>Olá, {partner?.company_name}!</h2>
          <p>Gerencie seus clientes e acompanhe suas comissões.</p>
        </header>

        <section style={styles.statsGrid}>
            <StatCard title="Receita Total" value={`R$ ${stats.total_revenue.toFixed(2)}`} icon="💵" />
            <StatCard title="Notas Fiscais Emitidas" value={stats.total_nfse} icon="📄" />
            <StatCard title="Guias GPS Emitidas" value={stats.total_gps} icon="💰" />
            <StatCard title="Total de Clientes" value={clients.length} icon="👥" />
        </section>

        <section style={styles.grid2Cols}>
            <div style={styles.card}>
                <h3>Adicionar Novo Cliente</h3>
                <form onSubmit={handleAddClient} style={styles.form}>
                    <input type="text" placeholder="Nome do Cliente" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} style={styles.input} required />
                    <input type="text" placeholder="CPF ou CNPJ" value={newClient.document} onChange={(e) => setNewClient({ ...newClient, document: e.target.value.replace(/\D/g, '') })} style={styles.input} required />
                    <button type="submit" disabled={loading} style={styles.button}>Adicionar Cliente</button>
                </form>
            </div>
            <div style={styles.card}>
                <h3>Ações Rápidas</h3>
                {/* Add quick actions here */}
            </div>
        </section>

        <section style={styles.card}>
          <h3>Meus Clientes</h3>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Nome</th><th style={styles.th}>Documento</th><th style={styles.th}>Status</th><th style={styles.th}>Desde</th></tr></thead>
            <tbody>
              {clients.map(item => (
                <tr key={item.client_id}>
                  <td style={styles.td}>{item.profile.name}</td>
                  <td style={styles.td}>{formatDocument(item.profile.document)}</td>
                  <td style={styles.td}><span style={styles.statusBadge(item.profile.onboarding_completed)}>{item.profile.onboarding_completed ? 'Ativo' : 'Pendente'}</span></td>
                  <td style={styles.td}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
    <div style={styles.statCard}>
        <div style={styles.statIcon}>{icon}</div>
        <div>
            <p style={styles.statValue}>{value}</p>
            <h4 style={styles.statTitle}>{title}</h4>
        </div>
    </div>
);

const styles = {
  dashboardContainer: { display: 'flex', minHeight: '100vh', fontFamily: '"Inter", sans-serif', backgroundColor: '#f8f9fa' },
  sidebar: { width: '250px', backgroundColor: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #dee2e6' },
  logo: { height: '50px', marginBottom: '40px', alignSelf: 'center' },
  nav: { display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 },
  navLink: { textDecoration: 'none', color: '#495057', padding: '12px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, transition: 'all 0.2s', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
  activeNavLink: { backgroundColor: '#e9ecef', color: '#007bff' },
  logoutButton: { padding: '12px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, color: '#dc3545', cursor: 'pointer' },
  mainContent: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { marginBottom: '40px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  statIcon: { fontSize: '2rem', },
  statValue: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  statTitle: { fontSize: '14px', color: '#6c757d', margin: 0 },
  grid2Cols: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px 15px', fontSize: '16px', border: '1px solid #ced4da', borderRadius: '8px' },
  button: { padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#6c757d' },
  td: { padding: '15px', borderBottom: '1px solid #dee2e6', color: '#495057' },
  statusBadge: (isCompleted) => ({ padding: '5px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: isCompleted ? '#d1e7dd' : '#fff3cd', color: isCompleted ? '#0f5132' : '#664d03' }),
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner: { border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' },
  '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
};

export default DashboardPartner;
