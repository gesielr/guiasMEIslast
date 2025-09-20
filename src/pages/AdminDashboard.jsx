// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';
import { decryptData } from '../utils/encryption'; // ✅ ADICIONADO

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_partners: 0,
    total_nfse: 0,
    total_gps: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate('/login');
        return;
      }

      // Verificar se é admin
      if (authUser.user_metadata?.user_type !== 'admin') {
        alert('Acesso restrito a administradores.');
        navigate('/dashboard');
        return;
      }

      setUser(authUser);

      // Buscar todos os usuários com perfis
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          user:users!inner(*)
        `)
        .neq('user_type', 'admin');

      if (usersError) throw usersError;

      // ✅ DESCRIPTOGRAFAR DADOS DOS USUÁRIOS
      const decryptedUsers = await Promise.all(
        usersData.map(async (profile) => {
          const decryptedDocument = profile.document 
            ? await decryptData(profile.document) 
            : '';
          const decryptedPis = profile.pis 
            ? await decryptData(profile.pis) 
            : '';

          return {
            ...profile,
            document: decryptedDocument,
            pis: decryptedPis,
          };
        })
      );

      setUsers(decryptedUsers);

      // Buscar parceiros
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select('*');

      if (partnersError) throw partnersError;
      setPartners(partnersData);

      // Calcular estatísticas
      await calculateAdminStats();
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
      setLoading(false);
    }
  };

  const calculateAdminStats = async () => {
    try {
      // Contar usuários
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('user_type', 'admin');

      // Contar parceiros
      const { count: partnersCount } = await supabase
        .from('partners')
        .select('*', { count: 'exact', head: true });

      // Contar NFS-e
      const { count: nfseCount } = await supabase
        .from('nfse_emissions')
        .select('*', { count: 'exact', head: true });

      // Contar GPS
      const { count: gpsCount } = await supabase
        .from('gps_emissions')
        .select('*', { count: 'exact', head: true });

      // Calcular receita total (simulada)
      const totalRevenue = (nfseCount * 3.0) + (gpsCount * 15.0); // Valores médios

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
  };

  // ✅ FUNÇÃO PARA FORMATAR DOCUMENTO
  const formatDocument = (doc) => {
    if (!doc) return '';
    const cleanDoc = doc.replace(/\D/g, '');
    
    if (cleanDoc.length === 11) {
      // CPF: 000.000.000-00
      return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleanDoc.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  };

  // ✅ FUNÇÃO PARA FORMATAR PIS
  const formatPis = (pis) => {
    if (!pis) return '';
    const cleanPis = pis.replace(/\D/g, '');
    if (cleanPis.length === 11) {
      return cleanPis.replace(/(\d{3})(\d{5})(\d{2})(\d{1})/, '$1.$2.$3-$4');
    }
    return pis;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Carregando dashboard administrativo...</h2>
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
        <h1>🛡️ Painel Administrativo</h1>
        <p>Gestão completa da plataforma Rebelo</p>
      </header>

      {/* Estatísticas Gerais */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>Total de Usuários</h3>
          <p style={styles.statNumber}>{stats.total_users}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Parceiros Ativos</h3>
          <p style={styles.statNumber}>{stats.total_partners}</p>
        </div>
        <div style={styles.statCard}>
          <h3>NFS-e Emitidas</h3>
          <p style={styles.statNumber}>{stats.total_nfse}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Guias GPS</h3>
          <p style={styles.statNumber}>{stats.total_gps}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Receita Estimada</h3>
          <p style={{ ...styles.statNumber, color: '#28a745' }}>
            R$ {stats.total_revenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('overview')}
          style={activeTab === 'overview' ? styles.activeTab : styles.tab}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={activeTab === 'users' ? styles.activeTab : styles.tab}
        >
          Usuários ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          style={activeTab === 'partners' ? styles.activeTab : styles.tab}
        >
          Parceiros ({partners.length})
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'users' && (
        <div style={styles.section}>
          <h2>👥 Usuários Cadastrados</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Documento</th>
                  <th>PIS</th>
                  <th>Email</th>
                  <th>Tipo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((profile) => (
                  <tr key={profile.id}>
                    <td>{profile.name}</td>
                    <td>{formatDocument(profile.document)}</td>
                    <td>{formatPis(profile.pis) || '-'}</td>
                    <td>{profile.user?.email}</td>
                    <td>
                      <span style={styles.badge}>
                        {profile.user_type === 'mei' ? 'MEI' : 'Autônomo'}
                      </span>
                    </td>
                    <td>
                      {profile.onboarding_completed ? (
                        <span style={{ ...styles.badge, backgroundColor: '#28a745' }}>
                          ✅ Ativo
                        </span>
                      ) : (
                        <span style={{ ...styles.badge, backgroundColor: '#ffc107' }}>
                          ⏳ Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'partners' && (
        <div style={styles.section}>
          <h2>🤝 Parceiros</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>CNPJ</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id}>
                    <td>{partner.company_name}</td>
                    <td>{formatDocument(partner.cnpj)}</td>
                    <td>{partner.email}</td>
                    <td>{partner.phone}</td>
                    <td>
                      <span style={{ ...styles.badge, backgroundColor: '#28a745' }}>
                        ✅ Ativo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div style={styles.section}>
          <h2>📊 Visão Geral do Sistema</h2>
          <div style={styles.overviewGrid}>
            <div style={styles.overviewCard}>
              <h4>Usuários por Tipo</h4>
              <p>MEI: {users.filter(u => u.user_type === 'mei').length}</p>
              <p>Autônomos: {users.filter(u => u.user_type === 'autonomo').length}</p>
            </div>
            <div style={styles.overviewCard}>
              <h4>Status de Onboarding</h4>
              <p>Completos: {users.filter(u => u.onboarding_completed).length}</p>
              <p>Pendentes: {users.filter(u => !u.onboarding_completed).length}</p>
            </div>
            <div style={styles.overviewCard}>
              <h4>Contratos</h4>
              <p>Aceitos: {users.filter(u => u.contract_accepted).length}</p>
              <p>Pendentes: {users.filter(u => !u.contract_accepted).length}</p>
            </div>
          </div>
        </div>
      )}

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
    maxWidth: '1400px',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '10px 0',
    color: '#007bff',
  },
  tabs: {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '1px solid #ddd',
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    borderBottom: '2px solid #007bff',
    color: '#007bff',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginBottom: '40px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    backgroundColor: '#6c757d',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  overviewCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
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

// Adicionar estilos para a tabela
const tableStyles = `
  table th, table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  table th {
    background-color: #f8f9fa;
    font-weight: bold;
  }
  table tr:hover {
    background-color: #f5f5f5;
  }
`;

// Injetar estilos CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = tableStyles;
  document.head.appendChild(style);
}

export default AdminDashboard;