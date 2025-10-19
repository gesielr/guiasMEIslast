// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { decryptData } from '../../utils/encryption';
import logo from '../../assets/logo.png';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_partners: 0, total_nfse: 0, total_gps: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const calculateAdminStats = useCallback(async () => {
    try {
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('user_type', 'admin');
      const { count: partnersCount } = await supabase.from('partners').select('*', { count: 'exact', head: true });
      const { count: nfseCount } = await supabase.from('nfse_emissions').select('*', { count: 'exact', head: true });
      const { count: gpsCount } = await supabase.from('gps_emissions').select('*', { count: 'exact', head: true });
      const totalRevenue = (nfseCount * 3.0) + (gpsCount * 15.0);

      setStats({
        total_users: usersCount || 0,
        total_partners: partnersCount || 0,
        total_nfse: nfseCount || 0,
        total_gps: gpsCount || 0,
        total_revenue: totalRevenue,
      });
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err);
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser || authUser.user_metadata?.user_type !== 'admin') {
        navigate('/login');
        return;
      }

      const { data: usersData, error: usersError } = await supabase.from('profiles').select('*, user:users!inner(*)').neq('user_type', 'admin');
      if (usersError) throw usersError;

      const decryptedUsers = await Promise.all(
        usersData.map(async (profile) => {
          const decryptedDocument = profile.document ? await decryptData(profile.document) : '';
          const decryptedPis = profile.pis ? await decryptData(profile.pis) : '';
          return { ...profile, document: decryptedDocument, pis: decryptedPis };
        })
      );
      setUsers(decryptedUsers);

      const { data: partnersData, error: partnersError } = await supabase.from('partners').select('*');
      if (partnersError) throw partnersError;
      setPartners(partnersData);

      await calculateAdminStats();
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
      setLoading(false);
    }
  }, [navigate, calculateAdminStats]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const formatDocument = (doc) => {
    const cleanDoc = doc.replace(/\D/g, '');
    if (cleanDoc.length === 11) return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (cleanDoc.length === 14) return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return doc;
  };

  if (loading) return <div style={styles.centered}><div style={styles.spinner}></div></div>;
  if (error) return <div style={styles.centered}><p>{error}</p></div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTable users={users} formatDocument={formatDocument} />;
      case 'partners':
        return <PartnersTable partners={partners} formatDocument={formatDocument} />;
      case 'overview':
      default:
        return <Overview stats={stats} users={users} />;
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <aside style={styles.sidebar}>
        <img src={logo} alt="Rebelo App Logo" style={styles.logo} />
        <nav style={styles.nav}>
          <TabButton title="Visão Geral" name="overview" activeTab={activeTab} setActiveTab={setActiveTab} icon="📊" />
          <TabButton title="Usuários" name="users" activeTab={activeTab} setActiveTab={setActiveTab} icon="👥" />
          <TabButton title="Parceiros" name="partners" activeTab={activeTab} setActiveTab={setActiveTab} icon="🤝" />
        </nav>
        <div style={styles.logoutButton} onClick={() => supabase.auth.signOut().then(() => navigate('/'))}>
          <span>🚪</span> Sair
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h2>Painel Administrativo</h2>
          <p>Gestão completa da plataforma Rebelo.</p>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

const TabButton = ({ title, name, activeTab, setActiveTab, icon }) => (
    <button style={activeTab === name ? {...styles.navLink, ...styles.activeNavLink} : styles.navLink} onClick={() => setActiveTab(name)}><span>{icon}</span> {title}</button>
);

const Overview = ({ stats, users }) => (
    <section>
        <div style={styles.statsGrid}>
            <StatCard title="Receita Total" value={`R$ ${stats.total_revenue.toFixed(2)}`} icon="💵" />
            <StatCard title="Total de Usuários" value={stats.total_users} icon="👥" />
            <StatCard title="Parceiros Ativos" value={stats.total_partners} icon="🤝" />
            <StatCard title="NFS-e Emitidas" value={stats.total_nfse} icon="📄" />
            <StatCard title="Guias GPS Emitidas" value={stats.total_gps} icon="💰" />
        </div>
        {/* Further overview components can be added here */}
    </section>
);

const UsersTable = ({ users, formatDocument }) => (
    <div style={styles.card}>
        <h3>Usuários Cadastrados</h3>
        <table style={styles.table}><thead><tr><th>Nome</th><th>Documento</th><th>Email</th><th>Status</th></tr></thead>
            <tbody>
                {users.map(profile => (
                    <tr key={profile.id}><td>{profile.name}</td><td>{formatDocument(profile.document)}</td><td>{profile.user?.email}</td><td><span style={styles.statusBadge(profile.onboarding_completed)}>{profile.onboarding_completed ? 'Ativo' : 'Pendente'}</span></td></tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PartnersTable = ({ partners, formatDocument }) => (
    <div style={styles.card}>
        <h3>Parceiros</h3>
        <table style={styles.table}><thead><tr><th>Empresa</th><th>CNPJ</th><th>Email</th><th>Status</th></tr></thead>
            <tbody>
                {partners.map(partner => (
                    <tr key={partner.id}><td>{partner.company_name}</td><td>{formatDocument(partner.cnpj)}</td><td>{partner.email}</td><td><span style={styles.statusBadge(true)}>'Ativo'</span></td></tr>
                ))}
            </tbody>
        </table>
    </div>
);

const StatCard = ({ title, value, icon }) => (
    <div style={styles.statCard}><div style={styles.statIcon}>{icon}</div><div><p style={styles.statValue}>{value}</p><h4 style={styles.statTitle}>{title}</h4></div></div>
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
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
    statIcon: { fontSize: '2rem', },
    statValue: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
    statTitle: { fontSize: '14px', color: '#6c757d', margin: 0 },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '15px', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#6c757d' },
    td: { padding: '15px', borderBottom: '1px solid #dee2e6', color: '#495057' },
    statusBadge: (isCompleted) => ({ padding: '5px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: isCompleted ? '#d1e7dd' : '#fff3cd', color: isCompleted ? '#0f5132' : '#664d03' }),
    centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
    spinner: { border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' },
    '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
};

export default AdminDashboard;
