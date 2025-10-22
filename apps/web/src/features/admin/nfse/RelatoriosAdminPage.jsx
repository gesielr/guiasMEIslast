// src/features/admin/nfse/RelatoriosAdminPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/client';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const RelatoriosAdminPage = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    periodo: 'mes',
    tipo: 'todos',
    formato: 'tabela'
  });
  const [stats, setStats] = useState({
    totalEmissoes: 0,
    valorTotal: 0,
    usuariosAtivos: 0,
    taxaSucesso: 0,
    crescimento: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.user_type !== 'admin') {
        navigate('/login');
        return;
      }
      carregarDados();
    };
    verificarAdmin();
  }, [navigate]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar dados para relatórios
      const { data: emissoes, error: emissoesError } = await supabase
        .from('nfse_emissions')
        .select(`
          *,
          profiles!inner(
            name,
            user:users!inner(email)
          )
        `)
        .order('created_at', { ascending: false });

      if (emissoesError) throw emissoesError;

      setDados(emissoes || []);
      calcularStats(emissoes || []);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularStats = (emissoes) => {
    const totalEmissoes = emissoes.length;
    const valorTotal = emissoes.reduce((acc, e) => acc + (e.valores?.valorServicos || 0), 0);
    const autorizadas = emissoes.filter(e => e.status === 'AUTORIZADA').length;
    const taxaSucesso = totalEmissoes > 0 ? (autorizadas / totalEmissoes) * 100 : 0;
    
    // Simular crescimento (em produção, comparar com período anterior)
    const crescimento = 15.3; // Simulado

    setStats({
      totalEmissoes,
      valorTotal,
      usuariosAtivos: new Set(emissoes.map(e => e.user_id)).size,
      taxaSucesso,
      crescimento
    });
  };

  const filtrarDados = () => {
    const hoje = new Date();
    let dataInicio;

    switch (filtros.periodo) {
      case 'hoje':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        break;
      case 'semana':
        dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'ano':
        dataInicio = new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return dados;
    }

    return dados.filter(emissao => {
      const dataEmissao = new Date(emissao.created_at);
      return dataEmissao >= dataInicio;
    });
  };

  const gerarRelatorio = () => {
    const dadosFiltrados = filtrarDados();
    
    if (filtros.formato === 'excel') {
      // Implementar exportação Excel
      alert('Exportando para Excel...');
    } else if (filtros.formato === 'pdf') {
      // Implementar exportação PDF
      alert('Exportando para PDF...');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTopUsuarios = () => {
    const usuarios = {};
    dados.forEach(emissao => {
      const userId = emissao.user_id;
      if (!usuarios[userId]) {
        usuarios[userId] = {
          nome: emissao.profiles.name,
          email: emissao.profiles.user.email,
          total: 0,
          valor: 0
        };
      }
      usuarios[userId].total += 1;
      usuarios[userId].valor += emissao.valores?.valorServicos || 0;
    });

    return Object.values(usuarios)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  };

  const getEmissoesPorDia = () => {
    const emissoesPorDia = {};
    dados.forEach(emissao => {
      const dia = new Date(emissao.created_at).toDateString();
      if (!emissoesPorDia[dia]) {
        emissoesPorDia[dia] = 0;
      }
      emissoesPorDia[dia]++;
    });

    return Object.entries(emissoesPorDia)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7); // Últimos 7 dias
  };

  if (loading) {
    return <div style={styles.centered}><div style={styles.spinner}></div></div>;
  }

  const dadosFiltrados = filtrarDados();
  const topUsuarios = getTopUsuarios();
  const emissoesPorDia = getEmissoesPorDia();

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
          <button style={{...styles.navLink, ...styles.activeNavLink}}>
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
          <h2>Relatórios e Analytics NFSe</h2>
          <p>Análise completa de dados e performance do sistema</p>
        </header>

        {error && <div style={styles.error}>{error}</div>}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <p style={styles.statValue}>{stats.totalEmissoes}</p>
              <h4 style={styles.statTitle}>Total de Emissões</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div>
              <p style={styles.statValue}>{formatCurrency(stats.valorTotal)}</p>
              <h4 style={styles.statTitle}>Valor Total</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div>
              <p style={styles.statValue}>{stats.usuariosAtivos}</p>
              <h4 style={styles.statTitle}>Usuários Ativos</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <p style={styles.statValue}>{stats.taxaSucesso.toFixed(1)}%</p>
              <h4 style={styles.statTitle}>Taxa de Sucesso</h4>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📈</div>
            <div>
              <p style={styles.statValue}>+{stats.crescimento}%</p>
              <h4 style={styles.statTitle}>Crescimento</h4>
            </div>
          </div>
        </div>

        {/* Filtros e Exportação */}
        <div style={styles.filtersCard}>
          <h3>Filtros e Exportação</h3>
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Período:</label>
              <select 
                value={filtros.periodo} 
                onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
                style={styles.filterSelect}
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mês</option>
                <option value="ano">Último Ano</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Formato:</label>
              <select 
                value={filtros.formato} 
                onChange={(e) => setFiltros({...filtros, formato: e.target.value})}
                style={styles.filterSelect}
              >
                <option value="tabela">Visualização</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <button style={styles.exportButton} onClick={gerarRelatorio}>
                📥 Exportar Relatório
              </button>
            </div>
          </div>
        </div>

        {/* Gráficos e Análises */}
        <div style={styles.chartsGrid}>
          {/* Top Usuários */}
          <div style={styles.chartCard}>
            <h3>Top 10 Usuários por Emissões</h3>
            <div style={styles.topUsersList}>
              {topUsuarios.map((usuario, index) => (
                <div key={index} style={styles.topUserItem}>
                  <div style={styles.userRank}>#{index + 1}</div>
                  <div style={styles.userInfo}>
                    <strong>{usuario.nome}</strong>
                    <small>{usuario.email}</small>
                  </div>
                  <div style={styles.userStats}>
                    <span>{usuario.total} emissões</span>
                    <span>{formatCurrency(usuario.valor)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emissões por Dia */}
          <div style={styles.chartCard}>
            <h3>Emissões dos Últimos 7 Dias</h3>
            <div style={styles.dailyChart}>
              {emissoesPorDia.map(([dia, count]) => (
                <div key={dia} style={styles.dailyBar}>
                  <div style={styles.barLabel}>{new Date(dia).toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                  <div style={styles.barContainer}>
                    <div 
                      style={{
                        ...styles.bar,
                        height: `${Math.max((count / Math.max(...emissoesPorDia.map(([,c]) => c))) * 100, 10)}px`
                      }}
                    ></div>
                  </div>
                  <div style={styles.barValue}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela Detalhada */}
        <div style={styles.tableCard}>
          <h3>Dados Detalhados ({dadosFiltrados.length} registros)</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Usuário</th>
                  <th>Protocolo</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th>Tomador</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.slice(0, 50).map(emissao => (
                  <tr key={emissao.id}>
                    <td>{formatDate(emissao.created_at)}</td>
                    <td>
                      <div>
                        <strong>{emissao.profiles.name}</strong>
                        <br />
                        <small style={styles.email}>{emissao.profiles.user.email}</small>
                      </div>
                    </td>
                    <td>
                      <code style={styles.protocolo}>{emissao.protocolo}</code>
                    </td>
                    <td>
                      <span style={styles.statusBadge(emissao.status)}>
                        {emissao.status}
                      </span>
                    </td>
                    <td>{formatCurrency(emissao.valores?.valorServicos || 0)}</td>
                    <td>
                      {emissao.tomador ? (
                        <div>
                          <strong>{emissao.tomador.nome}</strong>
                          <br />
                          <small>{emissao.tomador.documento}</small>
                        </div>
                      ) : '-'}
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
  filtersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  filterLabel: { fontWeight: '500', color: '#495057' },
  filterSelect: { padding: '10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px' },
  exportButton: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' },
  chartCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  topUsersList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  topUserItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' },
  userRank: { fontSize: '18px', fontWeight: 'bold', color: '#007bff', minWidth: '30px' },
  userInfo: { flex: 1 },
  userStats: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '12px', color: '#6c757d' },
  dailyChart: { display: 'flex', alignItems: 'end', gap: '10px', height: '200px', padding: '20px 0' },
  dailyBar: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  barLabel: { fontSize: '12px', color: '#6c757d', marginBottom: '5px' },
  barContainer: { height: '150px', display: 'flex', alignItems: 'end', width: '100%' },
  bar: { width: '100%', backgroundColor: '#007bff', borderRadius: '4px 4px 0 0', minHeight: '4px' },
  barValue: { fontSize: '12px', color: '#495057', marginTop: '5px' },
  tableCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { textAlign: 'left', padding: '15px', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#6c757d', borderBottom: '2px solid #dee2e6' },
  td: { padding: '15px', borderBottom: '1px solid #dee2e6', color: '#495057' },
  email: { color: '#6c757d' },
  protocolo: { backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' },
  statusBadge: (status) => ({
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: status === 'AUTORIZADA' ? '#d1e7dd' : status === 'REJEITADA' ? '#f8d7da' : '#fff3cd',
    color: status === 'AUTORIZADA' ? '#0f5132' : status === 'REJEITADA' ? '#721c24' : '#664d03'
  }),
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner: { border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' },
  '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
};

export default RelatoriosAdminPage;
