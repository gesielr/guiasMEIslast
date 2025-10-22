// src/features/admin/nfse/CertificadosAdminPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/client';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const CertificadosAdminPage = () => {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    status: 'todos',
    tipo: 'todos',
    busca: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    expirados: 0,
    proximosVencer: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.user_type !== 'admin') {
        navigate('/login');
        return;
      }
      carregarCertificados();
    };
    verificarAdmin();
  }, [navigate]);

  const carregarCertificados = async () => {
    try {
      setLoading(true);
      
      // Buscar certificados com dados do usuário
      const { data, error } = await supabase
        .from('nfse_credentials')
        .select(`
          *,
          profiles!inner(
            name,
            document,
            user:users!inner(email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const certificadosProcessados = data.map(cert => ({
        ...cert,
        status: getStatusCertificado(cert.not_after),
        diasParaVencer: getDiasParaVencer(cert.not_after)
      }));

      setCertificados(certificadosProcessados);
      calcularStats(certificadosProcessados);
    } catch (err) {
      setError('Erro ao carregar certificados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCertificado = (notAfter) => {
    const hoje = new Date();
    const vencimento = new Date(notAfter);
    const diasParaVencer = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
    
    if (diasParaVencer < 0) return 'expirado';
    if (diasParaVencer <= 30) return 'proximo_vencer';
    return 'ativo';
  };

  const getDiasParaVencer = (notAfter) => {
    const hoje = new Date();
    const vencimento = new Date(notAfter);
    return Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
  };

  const calcularStats = (certs) => {
    const stats = {
      total: certs.length,
      ativos: certs.filter(c => c.status === 'ativo').length,
      expirados: certs.filter(c => c.status === 'expirado').length,
      proximosVencer: certs.filter(c => c.status === 'proximo_vencer').length
    };
    setStats(stats);
  };

  const filtrarCertificados = () => {
    return certificados.filter(cert => {
      const matchStatus = filtros.status === 'todos' || cert.status === filtros.status;
      const matchTipo = filtros.tipo === 'todos' || cert.type === filtros.tipo;
      const matchBusca = filtros.busca === '' || 
        cert.profiles.name.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        cert.document.includes(filtros.busca);
      
      return matchStatus && matchTipo && matchBusca;
    });
  };

  const formatDocument = (doc) => {
    const cleanDoc = doc.replace(/\D/g, '');
    if (cleanDoc.length === 14) {
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const styles = {
      ativo: { backgroundColor: '#d1e7dd', color: '#0f5132' },
      proximo_vencer: { backgroundColor: '#fff3cd', color: '#664d03' },
      expirado: { backgroundColor: '#f8d7da', color: '#721c24' }
    };
    
    const labels = {
      ativo: 'Ativo',
      proximo_vencer: 'Próximo a Vencer',
      expirado: 'Expirado'
    };

    return (
      <span style={{...styles[status], padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return <div style={styles.centered}><div style={styles.spinner}></div></div>;
  }

  return (
    <div style={styles.dashboardContainer}>
      <aside style={styles.sidebar}>
        <img src={logo} alt="GuiasMEI Logo" style={styles.logo} />
        <nav style={styles.nav}>
          <button style={styles.navLink} onClick={() => navigate('/dashboard/admin')}>
            <span>🏠</span> Dashboard
          </button>
          <button style={{...styles.navLink, ...styles.activeNavLink}}>
            <span>🔐</span> Certificados NFSe
          </button>
          <button style={styles.navLink} onClick={() => navigate('/admin/nfse/emissoes')}>
            <span>📊</span> Emissões
          </button>
          <button style={styles.navLink} onClick={() => navigate('/admin/nfse/relatorios')}>
            <span>📈</span> Relatórios
          </button>
          <button style={styles.navLink} onClick={() => navigate('/admin/nfse/configuracoes')}>
            <span>⚙️</span> Configurações
          </button>
          <button style={styles.navLink} onClick={() => navigate('/admin/nfse/logs')}>
            <span>🔍</span> Logs
          </button>
        </nav>
        <div style={styles.logoutButton} onClick={() => supabase.auth.signOut().then(() => navigate('/'))}>
          <span>🚪</span> Sair
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h2>Gestão de Certificados Digitais</h2>
          <p>Monitoramento e controle de certificados de todos os usuários</p>
        </header>

        {error && <div style={styles.error}>{error}</div>}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <p style={styles.statValue}>{stats.total}</p>
              <h4 style={styles.statTitle}>Total de Certificados</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <p style={styles.statValue}>{stats.ativos}</p>
              <h4 style={styles.statTitle}>Ativos</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚠️</div>
            <div>
              <p style={styles.statValue}>{stats.proximosVencer}</p>
              <h4 style={styles.statTitle}>Próximos a Vencer</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>❌</div>
            <div>
              <p style={styles.statValue}>{stats.expirados}</p>
              <h4 style={styles.statTitle}>Expirados</h4>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={styles.filtersCard}>
          <h3>Filtros</h3>
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status:</label>
              <select 
                value={filtros.status} 
                onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                style={styles.filterSelect}
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="proximo_vencer">Próximos a Vencer</option>
                <option value="expirado">Expirados</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Tipo:</label>
              <select 
                value={filtros.tipo} 
                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                style={styles.filterSelect}
              >
                <option value="todos">Todos</option>
                <option value="A1">A1</option>
                <option value="A3">A3</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Buscar:</label>
              <input
                type="text"
                placeholder="Nome ou CNPJ..."
                value={filtros.busca}
                onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                style={styles.filterInput}
              />
            </div>
          </div>
        </div>

        {/* Tabela de Certificados */}
        <div style={styles.tableCard}>
          <h3>Certificados Cadastrados ({filtrarCertificados().length})</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>CNPJ</th>
                  <th>Tipo</th>
                  <th>Razão Social</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th>Dias Restantes</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrarCertificados().map(cert => (
                  <tr key={cert.id}>
                    <td>
                      <div>
                        <strong>{cert.profiles.name}</strong>
                        <br />
                        <small style={styles.email}>{cert.profiles.user.email}</small>
                      </div>
                    </td>
                    <td>{formatDocument(cert.document)}</td>
                    <td>
                      <span style={styles.typeBadge}>{cert.type}</span>
                    </td>
                    <td>{cert.subject}</td>
                    <td>{formatDate(cert.not_after)}</td>
                    <td>{getStatusBadge(cert.status)}</td>
                    <td>
                      <span style={cert.diasParaVencer < 0 ? styles.expired : styles.valid}>
                        {cert.diasParaVencer < 0 ? 'Expirado' : `${cert.diasParaVencer} dias`}
                      </span>
                    </td>
                    <td>
                      <button style={styles.actionButton} title="Visualizar">
                        👁️
                      </button>
                      <button style={styles.actionButton} title="Remover">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  dashboardContainer: { display: 'flex', minHeight: '100vh', fontFamily: '"Inter", sans-serif', backgroundColor: '#f8f9fa' },
  sidebar: { width: '250px', backgroundColor: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #dee2e6' },
  logo: { height: '50px', marginBottom: '40px', alignSelf: 'center' },
  nav: { display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 },
  navLink: { textDecoration: 'none', color: '#495057', padding: '12px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, transition: 'all 0.2s', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
  activeNavLink: { backgroundColor: '#e9ecef', color: '#007bff' },
  logoutButton: { padding: '12px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, color: '#dc3545', cursor: 'pointer' },
  mainContent: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { marginBottom: '30px' },
  error: { color: '#dc3545', backgroundColor: '#f8d7da', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  statIcon: { fontSize: '2rem' },
  statValue: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  statTitle: { fontSize: '14px', color: '#6c757d', margin: 0 },
  filtersCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '20px' },
  filtersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  filterLabel: { fontWeight: '500', color: '#495057' },
  filterSelect: { padding: '10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px' },
  filterInput: { padding: '10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px' },
  tableCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { textAlign: 'left', padding: '15px', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#6c757d', borderBottom: '2px solid #dee2e6' },
  td: { padding: '15px', borderBottom: '1px solid #dee2e6', color: '#495057' },
  email: { color: '#6c757d' },
  typeBadge: { backgroundColor: '#e7f3ff', color: '#0066cc', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  valid: { color: '#28a745', fontWeight: 'bold' },
  expired: { color: '#dc3545', fontWeight: 'bold' },
  actionButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', margin: '0 2px', borderRadius: '4px', fontSize: '16px' },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner: { border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' },
  '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
};

export default CertificadosAdminPage;
