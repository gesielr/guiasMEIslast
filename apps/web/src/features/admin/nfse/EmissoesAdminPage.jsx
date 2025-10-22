// src/features/admin/nfse/EmissoesAdminPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/client';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const EmissoesAdminPage = () => {
  const [emissoes, setEmissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    status: 'todos',
    periodo: 'hoje',
    busca: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    emFila: 0,
    processando: 0,
    autorizadas: 0,
    rejeitadas: 0,
    valorTotal: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.user_type !== 'admin') {
        navigate('/login');
        return;
      }
      carregarEmissoes();
    };
    verificarAdmin();
  }, [navigate]);

  const carregarEmissoes = async () => {
    try {
      setLoading(true);
      
      // Buscar emissões com dados do usuário
      const { data, error } = await supabase
        .from('nfse_emissions')
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

      setEmissoes(data || []);
      calcularStats(data || []);
    } catch (err) {
      setError('Erro ao carregar emissões: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularStats = (emissoes) => {
    const stats = {
      total: emissoes.length,
      emFila: emissoes.filter(e => e.status === 'EM_FILA').length,
      processando: emissoes.filter(e => e.status === 'PROCESSANDO').length,
      autorizadas: emissoes.filter(e => e.status === 'AUTORIZADA').length,
      rejeitadas: emissoes.filter(e => e.status === 'REJEITADA').length,
      valorTotal: emissoes.reduce((acc, e) => acc + (e.valores?.valorServicos || 0), 0)
    };
    setStats(stats);
  };

  const filtrarEmissoes = () => {
    return emissoes.filter(emissao => {
      const matchStatus = filtros.status === 'todos' || emissao.status === filtros.status;
      const matchPeriodo = filtrarPorPeriodo(emissao.created_at);
      const matchBusca = filtros.busca === '' || 
        emissao.profiles.name.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        emissao.protocolo.includes(filtros.busca);
      
      return matchStatus && matchPeriodo && matchBusca;
    });
  };

  const filtrarPorPeriodo = (data) => {
    const hoje = new Date();
    const dataEmissao = new Date(data);
    
    switch (filtros.periodo) {
      case 'hoje':
        return dataEmissao.toDateString() === hoje.toDateString();
      case 'semana':
        const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        return dataEmissao >= umaSemanaAtras;
      case 'mes':
        const umMesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        return dataEmissao >= umMesAtras;
      default:
        return true;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const styles = {
      'EM_FILA': { backgroundColor: '#fff3cd', color: '#664d03' },
      'PROCESSANDO': { backgroundColor: '#cce5ff', color: '#004085' },
      'AUTORIZADA': { backgroundColor: '#d1e7dd', color: '#0f5132' },
      'REJEITADA': { backgroundColor: '#f8d7da', color: '#721c24' },
      'CANCELADA': { backgroundColor: '#f8d7da', color: '#721c24' }
    };
    
    const labels = {
      'EM_FILA': 'Em Fila',
      'PROCESSANDO': 'Processando',
      'AUTORIZADA': 'Autorizada',
      'REJEITADA': 'Rejeitada',
      'CANCELADA': 'Cancelada'
    };

    return (
      <span style={{...styles[status], padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}>
        {labels[status] || status}
      </span>
    );
  };

  const reenviarEmissao = async (protocolo) => {
    try {
      // Implementar lógica de reenvio
      alert(`Reenviando emissão ${protocolo}...`);
    } catch (err) {
      alert('Erro ao reenviar: ' + err.message);
    }
  };

  const cancelarEmissao = async (protocolo) => {
    try {
      // Implementar lógica de cancelamento
      alert(`Cancelando emissão ${protocolo}...`);
    } catch (err) {
      alert('Erro ao cancelar: ' + err.message);
    }
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
          <button style={styles.navLink} onClick={() => navigate('/admin/nfse/certificados')}>
            <span>🔐</span> Certificados
          </button>
          <button style={{...styles.navLink, ...styles.activeNavLink}}>
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
          <h2>Monitoramento de Emissões NFSe</h2>
          <p>Acompanhamento em tempo real de todas as emissões do sistema</p>
        </header>

        {error && <div style={styles.error}>{error}</div>}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <p style={styles.statValue}>{stats.total}</p>
              <h4 style={styles.statTitle}>Total de Emissões</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏳</div>
            <div>
              <p style={styles.statValue}>{stats.emFila + stats.processando}</p>
              <h4 style={styles.statTitle}>Em Processamento</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <p style={styles.statValue}>{stats.autorizadas}</p>
              <h4 style={styles.statTitle}>Autorizadas</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>❌</div>
            <div>
              <p style={styles.statValue}>{stats.rejeitadas}</p>
              <h4 style={styles.statTitle}>Rejeitadas</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div>
              <p style={styles.statValue}>{formatCurrency(stats.valorTotal)}</p>
              <h4 style={styles.statTitle}>Valor Total</h4>
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
                <option value="EM_FILA">Em Fila</option>
                <option value="PROCESSANDO">Processando</option>
                <option value="AUTORIZADA">Autorizada</option>
                <option value="REJEITADA">Rejeitada</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Período:</label>
              <select 
                value={filtros.periodo} 
                onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
                style={styles.filterSelect}
              >
                <option value="todos">Todos</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mês</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Buscar:</label>
              <input
                type="text"
                placeholder="Protocolo ou usuário..."
                value={filtros.busca}
                onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                style={styles.filterInput}
              />
            </div>
          </div>
        </div>

        {/* Tabela de Emissões */}
        <div style={styles.tableCard}>
          <h3>Emissões NFSe ({filtrarEmissoes().length})</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Usuário</th>
                  <th>Tomador</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data/Hora</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrarEmissoes().map(emissao => (
                  <tr key={emissao.id}>
                    <td>
                      <code style={styles.protocolo}>{emissao.protocolo}</code>
                    </td>
                    <td>
                      <div>
                        <strong>{emissao.profiles.name}</strong>
                        <br />
                        <small style={styles.email}>{emissao.profiles.user.email}</small>
                      </div>
                    </td>
                    <td>
                      {emissao.tomador ? (
                        <div>
                          <strong>{emissao.tomador.nome}</strong>
                          <br />
                          <small>{emissao.tomador.documento}</small>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {emissao.valores ? formatCurrency(emissao.valores.valorServicos) : '-'}
                    </td>
                    <td>{getStatusBadge(emissao.status)}</td>
                    <td>{formatDate(emissao.created_at)}</td>
                    <td>
                      <button 
                        style={styles.actionButton} 
                        title="Visualizar"
                        onClick={() => alert(`Visualizando emissão ${emissao.protocolo}`)}
                      >
                        👁️
                      </button>
                      {emissao.status === 'REJEITADA' && (
                        <button 
                          style={styles.actionButton} 
                          title="Reenviar"
                          onClick={() => reenviarEmissao(emissao.protocolo)}
                        >
                          🔄
                        </button>
                      )}
                      {(emissao.status === 'EM_FILA' || emissao.status === 'PROCESSANDO') && (
                        <button 
                          style={styles.actionButton} 
                          title="Cancelar"
                          onClick={() => cancelarEmissao(emissao.protocolo)}
                        >
                          ❌
                        </button>
                      )}
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
  protocolo: { backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' },
  actionButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', margin: '0 2px', borderRadius: '4px', fontSize: '16px' },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner: { border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' },
  '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
};

export default EmissoesAdminPage;
