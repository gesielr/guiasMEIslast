// src/features/admin/nfse/LogsAdminPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/client';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const LogsAdminPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    nivel: 'todos',
    operacao: 'todos',
    periodo: 'hoje',
    busca: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    info: 0,
    warn: 0,
    error: 0,
    debug: 0
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.user_type !== 'admin') {
        navigate('/login');
        return;
      }
      carregarLogs();
    };
    verificarAdmin();
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(carregarLogs, 5000); // Atualizar a cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const carregarLogs = async () => {
    try {
      setLoading(true);
      
      // Simular logs (em produção, buscar de uma tabela de logs)
      const logsSimulados = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          nivel: 'info',
          operacao: 'EMISSAO_DPS',
          protocolo: 'PROTO-123456',
          usuario: 'Maria Silva',
          mensagem: 'DPS emitido com sucesso',
          detalhes: { valor: 150.00, tomador: 'João Santos' },
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          nivel: 'warn',
          operacao: 'CERTIFICADO',
          protocolo: null,
          usuario: 'João Silva',
          mensagem: 'Certificado próximo ao vencimento',
          detalhes: { diasRestantes: 15 },
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          nivel: 'error',
          operacao: 'ADN_CONNECTION',
          protocolo: 'PROTO-123457',
          usuario: 'Sistema',
          mensagem: 'Falha na conexão com ADN',
          detalhes: { erro: 'Timeout', tentativa: 2 },
          ip: '192.168.1.1',
          userAgent: 'Sistema'
        },
        {
          id: 4,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          nivel: 'debug',
          operacao: 'XML_SIGN',
          protocolo: 'PROTO-123458',
          usuario: 'Sistema',
          mensagem: 'XML assinado com sucesso',
          detalhes: { algoritmo: 'RSA-SHA256' },
          ip: '192.168.1.1',
          userAgent: 'Sistema'
        },
        {
          id: 5,
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          nivel: 'info',
          operacao: 'DOWNLOAD_PDF',
          protocolo: 'PROTO-123459',
          usuario: 'Ana Costa',
          mensagem: 'PDF baixado com sucesso',
          detalhes: { tamanho: '245KB' },
          ip: '192.168.1.102',
          userAgent: 'Mozilla/5.0...'
        }
      ];

      setLogs(logsSimulados);
      calcularStats(logsSimulados);
    } catch (err) {
      setError('Erro ao carregar logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularStats = (logsData) => {
    const stats = {
      total: logsData.length,
      info: logsData.filter(l => l.nivel === 'info').length,
      warn: logsData.filter(l => l.nivel === 'warn').length,
      error: logsData.filter(l => l.nivel === 'error').length,
      debug: logsData.filter(l => l.nivel === 'debug').length
    };
    setStats(stats);
  };

  const filtrarLogs = () => {
    return logs.filter(log => {
      const matchNivel = filtros.nivel === 'todos' || log.nivel === filtros.nivel;
      const matchOperacao = filtros.operacao === 'todos' || log.operacao === filtros.operacao;
      const matchPeriodo = filtrarPorPeriodo(log.timestamp);
      const matchBusca = filtros.busca === '' || 
        log.mensagem.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        log.protocolo?.includes(filtros.busca) ||
        log.usuario.toLowerCase().includes(filtros.busca.toLowerCase());
      
      return matchNivel && matchOperacao && matchPeriodo && matchBusca;
    });
  };

  const filtrarPorPeriodo = (timestamp) => {
    const hoje = new Date();
    const dataLog = new Date(timestamp);
    
    switch (filtros.periodo) {
      case 'hoje':
        return dataLog.toDateString() === hoje.toDateString();
      case 'semana':
        const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        return dataLog >= umaSemanaAtras;
      case 'mes':
        const umMesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        return dataLog >= umMesAtras;
      default:
        return true;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getNivelBadge = (nivel) => {
    const styles = {
      info: { backgroundColor: '#d1ecf1', color: '#0c5460' },
      warn: { backgroundColor: '#fff3cd', color: '#856404' },
      error: { backgroundColor: '#f8d7da', color: '#721c24' },
      debug: { backgroundColor: '#e2e3e5', color: '#383d41' }
    };
    
    return (
      <span style={{...styles[nivel], padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}>
        {nivel.toUpperCase()}
      </span>
    );
  };

  const getOperacaoIcon = (operacao) => {
    const icons = {
      'EMISSAO_DPS': '📄',
      'CERTIFICADO': '🔐',
      'ADN_CONNECTION': '🌐',
      'XML_SIGN': '✍️',
      'DOWNLOAD_PDF': '📥',
      'CANCELAMENTO': '❌',
      'RETRY': '🔄'
    };
    return icons[operacao] || '📋';
  };

  const exportarLogs = () => {
    const dadosFiltrados = filtrarLogs();
    const csv = [
      ['Timestamp', 'Nível', 'Operação', 'Protocolo', 'Usuário', 'Mensagem', 'IP'],
      ...dadosFiltrados.map(log => [
        log.timestamp,
        log.nivel,
        log.operacao,
        log.protocolo || '',
        log.usuario,
        log.mensagem,
        log.ip
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-nfse-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div style={styles.centered}><div style={styles.spinner}></div></div>;
  }

  const logsFiltrados = filtrarLogs();

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
          <button style={styles.navLink} onClick={() => navigate('/admin/nfse/emissoes')}>
            <span>📊</span> Emissões
          </button>
          <button style={styles.navLink} onClick={() => navigate('/admin/nfse/relatorios')}>
            <span>📈</span> Relatórios
          </button>
          <button style={styles.navLink} onClick={() => navigate('/admin/nfse/configuracoes')}>
            <span>⚙️</span> Configurações
          </button>
          <button style={{...styles.navLink, ...styles.activeNavLink}}>
            <span>🔍</span> Logs
          </button>
        </nav>
        <div style={styles.logoutButton} onClick={() => supabase.auth.signOut().then(() => navigate('/'))}>
          <span>🚪</span> Sair
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h2>Logs e Auditoria NFSe</h2>
          <p>Monitoramento de operações e debug do sistema</p>
        </header>

        {error && <div style={styles.error}>{error}</div>}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <p style={styles.statValue}>{stats.total}</p>
              <h4 style={styles.statTitle}>Total de Logs</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>ℹ️</div>
            <div>
              <p style={styles.statValue}>{stats.info}</p>
              <h4 style={styles.statTitle}>Info</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚠️</div>
            <div>
              <p style={styles.statValue}>{stats.warn}</p>
              <h4 style={styles.statTitle}>Warning</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>❌</div>
            <div>
              <p style={styles.statValue}>{stats.error}</p>
              <h4 style={styles.statTitle}>Error</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🐛</div>
            <div>
              <p style={styles.statValue}>{stats.debug}</p>
              <h4 style={styles.statTitle}>Debug</h4>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div style={styles.controlsCard}>
          <div style={styles.controlsLeft}>
            <h3>Filtros</h3>
            <div style={styles.filtersGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Nível:</label>
                <select 
                  value={filtros.nivel} 
                  onChange={(e) => setFiltros({...filtros, nivel: e.target.value})}
                  style={styles.filterSelect}
                >
                  <option value="todos">Todos</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Operação:</label>
                <select 
                  value={filtros.operacao} 
                  onChange={(e) => setFiltros({...filtros, operacao: e.target.value})}
                  style={styles.filterSelect}
                >
                  <option value="todos">Todas</option>
                  <option value="EMISSAO_DPS">Emissão DPS</option>
                  <option value="CERTIFICADO">Certificado</option>
                  <option value="ADN_CONNECTION">Conexão ADN</option>
                  <option value="XML_SIGN">Assinatura XML</option>
                  <option value="DOWNLOAD_PDF">Download PDF</option>
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
                  placeholder="Mensagem, protocolo ou usuário..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                  style={styles.filterInput}
                />
              </div>
            </div>
          </div>
          <div style={styles.controlsRight}>
            <div style={styles.autoRefresh}>
              <label style={styles.autoRefreshLabel}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  style={styles.checkbox}
                />
                Auto-refresh (5s)
              </label>
            </div>
            <button style={styles.refreshButton} onClick={carregarLogs}>
              🔄 Atualizar
            </button>
            <button style={styles.exportButton} onClick={exportarLogs}>
              📥 Exportar CSV
            </button>
          </div>
        </div>

        {/* Tabela de Logs */}
        <div style={styles.tableCard}>
          <h3>Logs do Sistema ({logsFiltrados.length} registros)</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Nível</th>
                  <th>Operação</th>
                  <th>Protocolo</th>
                  <th>Usuário</th>
                  <th>Mensagem</th>
                  <th>IP</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.map(log => (
                  <tr key={log.id}>
                    <td>
                      <code style={styles.timestamp}>{formatTimestamp(log.timestamp)}</code>
                    </td>
                    <td>{getNivelBadge(log.nivel)}</td>
                    <td>
                      <div style={styles.operacao}>
                        <span style={styles.operacaoIcon}>{getOperacaoIcon(log.operacao)}</span>
                        <span>{log.operacao}</span>
                      </div>
                    </td>
                    <td>
                      {log.protocolo ? (
                        <code style={styles.protocolo}>{log.protocolo}</code>
                      ) : '-'}
                    </td>
                    <td>
                      <div>
                        <strong>{log.usuario}</strong>
                        <br />
                        <small style={styles.userAgent}>{log.userAgent}</small>
                      </div>
                    </td>
                    <td>
                      <div style={styles.mensagem}>
                        {log.mensagem}
                        {log.detalhes && (
                          <details style={styles.detalhes}>
                            <summary>Detalhes</summary>
                            <pre style={styles.detalhesContent}>
                              {JSON.stringify(log.detalhes, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </td>
                    <td>
                      <code style={styles.ip}>{log.ip}</code>
                    </td>
                    <td>
                      <button 
                        style={styles.actionButton} 
                        title="Visualizar detalhes"
                        onClick={() => alert(`Detalhes do log ${log.id}:\n${JSON.stringify(log, null, 2)}`)}
                      >
                        👁️
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
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  statIcon: { fontSize: '1.5rem' },
  statValue: { fontSize: '20px', fontWeight: 'bold', margin: 0 },
  statTitle: { fontSize: '12px', color: '#6c757d', margin: 0 },
  controlsCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  controlsLeft: { flex: 1 },
  controlsRight: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' },
  filtersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  filterLabel: { fontWeight: '500', color: '#495057', fontSize: '12px' },
  filterSelect: { padding: '8px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '12px' },
  filterInput: { padding: '8px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '12px' },
  autoRefresh: { display: 'flex', alignItems: 'center', gap: '5px' },
  autoRefreshLabel: { fontSize: '12px', color: '#495057', display: 'flex', alignItems: 'center', gap: '5px' },
  checkbox: { margin: 0 },
  refreshButton: { padding: '8px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  exportButton: { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  tableCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', padding: '10px', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#6c757d', borderBottom: '2px solid #dee2e6' },
  td: { padding: '10px', borderBottom: '1px solid #dee2e6', color: '#495057' },
  timestamp: { backgroundColor: '#f8f9fa', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '10px' },
  operacao: { display: 'flex', alignItems: 'center', gap: '5px' },
  operacaoIcon: { fontSize: '14px' },
  protocolo: { backgroundColor: '#f8f9fa', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '10px' },
  userAgent: { color: '#6c757d', fontSize: '10px' },
  mensagem: { maxWidth: '200px' },
  detalhes: { marginTop: '5px' },
  detalhesContent: { fontSize: '10px', backgroundColor: '#f8f9fa', padding: '5px', borderRadius: '3px', margin: '5px 0' },
  ip: { backgroundColor: '#f8f9fa', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '10px' },
  actionButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '3px', margin: '0 2px', borderRadius: '3px', fontSize: '12px' },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner: { border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' },
  '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
};

export default LogsAdminPage;
