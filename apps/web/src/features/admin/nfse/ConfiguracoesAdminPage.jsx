// src/features/admin/nfse/ConfiguracoesAdminPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/client';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const ConfiguracoesAdminPage = () => {
  const [configuracoes, setConfiguracoes] = useState({
    adn: {
      contribuintesUrl: '',
      parametrosUrl: '',
      danfseUrl: '',
      ambiente: 'pr'
    },
    mTLS: {
      certificadoPath: '',
      senha: '',
      tipo: 'PFX'
    },
    retry: {
      maxTentativas: 3,
      intervalo: 5000,
      backoff: true
    },
    monitoramento: {
      alertasEmail: true,
      alertasWhatsapp: false,
      logLevel: 'info'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testResults, setTestResults] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.user_type !== 'admin') {
        navigate('/login');
        return;
      }
      carregarConfiguracoes();
    };
    verificarAdmin();
  }, [navigate]);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento de configurações (em produção, buscar do banco)
      const configsSimuladas = {
        adn: {
          contribuintesUrl: 'https://preprod.nfse.gov.br/contribuintes',
          parametrosUrl: 'https://preprod.nfse.gov.br/parametros',
          danfseUrl: 'https://preprod.nfse.gov.br/danfse',
          ambiente: 'pr'
        },
        mTLS: {
          certificadoPath: '/certs/sistema.pfx',
          senha: '••••••••',
          tipo: 'PFX'
        },
        retry: {
          maxTentativas: 3,
          intervalo: 5000,
          backoff: true
        },
        monitoramento: {
          alertasEmail: true,
          alertasWhatsapp: false,
          logLevel: 'info'
        }
      };

      setConfiguracoes(configsSimuladas);
    } catch (err) {
      setError('Erro ao carregar configurações: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Simular salvamento (em produção, salvar no banco)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Configurações salvas com sucesso!');
    } catch (err) {
      setError('Erro ao salvar configurações: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const testarConexao = async (tipo) => {
    try {
      setTestResults({...testResults, [tipo]: 'testando'});
      
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sucesso = Math.random() > 0.3; // 70% de chance de sucesso
      setTestResults({...testResults, [tipo]: sucesso ? 'sucesso' : 'erro'});
    } catch (err) {
      setTestResults({...testResults, [tipo]: 'erro'});
    }
  };

  const handleChange = (secao, campo, valor) => {
    setConfiguracoes(prev => ({
      ...prev,
      [secao]: {
        ...prev[secao],
        [campo]: valor
      }
    }));
  };

  const getTestStatus = (tipo) => {
    const status = testResults[tipo];
    if (!status) return null;
    
    if (status === 'testando') {
      return <span style={styles.testing}>🔄 Testando...</span>;
    }
    if (status === 'sucesso') {
      return <span style={styles.success}>✅ Conectado</span>;
    }
    if (status === 'erro') {
      return <span style={styles.error}>❌ Erro na conexão</span>;
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
          <button style={styles.navLink} onClick={() => navigate('/admin/nfse/emissoes')}>
            <span>📊</span> Emissões
          </button>
          <button style={styles.navLink} onClick={() => navigate('/admin/nfse/relatorios')}>
            <span>📈</span> Relatórios
          </button>
          <button style={{...styles.navLink, ...styles.activeNavLink}}>
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
          <h2>Configurações do Sistema NFSe</h2>
          <p>Gerenciamento de integrações e configurações do sistema</p>
        </header>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {/* Configurações ADN */}
        <div style={styles.configCard}>
          <h3>🌐 Configurações ADN</h3>
          <div style={styles.configGrid}>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>Ambiente:</label>
              <select 
                value={configuracoes.adn.ambiente}
                onChange={(e) => handleChange('adn', 'ambiente', e.target.value)}
                style={styles.configInput}
              >
                <option value="pr">Pré-produção</option>
                <option value="prod">Produção</option>
              </select>
            </div>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>URL Contribuintes:</label>
              <input
                type="url"
                value={configuracoes.adn.contribuintesUrl}
                onChange={(e) => handleChange('adn', 'contribuintesUrl', e.target.value)}
                style={styles.configInput}
                placeholder="https://preprod.nfse.gov.br/contribuintes"
              />
              <button 
                style={styles.testButton}
                onClick={() => testarConexao('contribuintes')}
              >
                Testar
              </button>
              {getTestStatus('contribuintes')}
            </div>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>URL Parâmetros:</label>
              <input
                type="url"
                value={configuracoes.adn.parametrosUrl}
                onChange={(e) => handleChange('adn', 'parametrosUrl', e.target.value)}
                style={styles.configInput}
                placeholder="https://preprod.nfse.gov.br/parametros"
              />
              <button 
                style={styles.testButton}
                onClick={() => testarConexao('parametros')}
              >
                Testar
              </button>
              {getTestStatus('parametros')}
            </div>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>URL DANFSe:</label>
              <input
                type="url"
                value={configuracoes.adn.danfseUrl}
                onChange={(e) => handleChange('adn', 'danfseUrl', e.target.value)}
                style={styles.configInput}
                placeholder="https://preprod.nfse.gov.br/danfse"
              />
              <button 
                style={styles.testButton}
                onClick={() => testarConexao('danfse')}
              >
                Testar
              </button>
              {getTestStatus('danfse')}
            </div>
          </div>
        </div>

        {/* Configurações mTLS */}
        <div style={styles.configCard}>
          <h3>🔐 Certificado mTLS do Sistema</h3>
          <div style={styles.configGrid}>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>Tipo de Certificado:</label>
              <select 
                value={configuracoes.mTLS.tipo}
                onChange={(e) => handleChange('mTLS', 'tipo', e.target.value)}
                style={styles.configInput}
              >
                <option value="PFX">PFX/P12</option>
                <option value="PKCS11">PKCS#11</option>
              </select>
            </div>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>Caminho do Certificado:</label>
              <input
                type="text"
                value={configuracoes.mTLS.certificadoPath}
                onChange={(e) => handleChange('mTLS', 'certificadoPath', e.target.value)}
                style={styles.configInput}
                placeholder="/certs/sistema.pfx"
              />
            </div>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>Senha:</label>
              <input
                type="password"
                value={configuracoes.mTLS.senha}
                onChange={(e) => handleChange('mTLS', 'senha', e.target.value)}
                style={styles.configInput}
                placeholder="••••••••"
              />
            </div>
            <div style={styles.configGroup}>
              <button 
                style={styles.testButton}
                onClick={() => testarConexao('mTLS')}
              >
                Testar Certificado
              </button>
              {getTestStatus('mTLS')}
            </div>
          </div>
        </div>

        {/* Configurações de Retry */}
        <div style={styles.configCard}>
          <h3>🔄 Políticas de Retry</h3>
          <div style={styles.configGrid}>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>Máximo de Tentativas:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={configuracoes.retry.maxTentativas}
                onChange={(e) => handleChange('retry', 'maxTentativas', parseInt(e.target.value))}
                style={styles.configInput}
              />
            </div>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>Intervalo (ms):</label>
              <input
                type="number"
                min="1000"
                value={configuracoes.retry.intervalo}
                onChange={(e) => handleChange('retry', 'intervalo', parseInt(e.target.value))}
                style={styles.configInput}
              />
            </div>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>
                <input
                  type="checkbox"
                  checked={configuracoes.retry.backoff}
                  onChange={(e) => handleChange('retry', 'backoff', e.target.checked)}
                  style={styles.checkbox}
                />
                Backoff Exponencial
              </label>
            </div>
          </div>
        </div>

        {/* Configurações de Monitoramento */}
        <div style={styles.configCard}>
          <h3>📊 Monitoramento e Alertas</h3>
          <div style={styles.configGrid}>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>
                <input
                  type="checkbox"
                  checked={configuracoes.monitoramento.alertasEmail}
                  onChange={(e) => handleChange('monitoramento', 'alertasEmail', e.target.checked)}
                  style={styles.checkbox}
                />
                Alertas por Email
              </label>
            </div>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>
                <input
                  type="checkbox"
                  checked={configuracoes.monitoramento.alertasWhatsapp}
                  onChange={(e) => handleChange('monitoramento', 'alertasWhatsapp', e.target.checked)}
                  style={styles.checkbox}
                />
                Alertas por WhatsApp
              </label>
            </div>
            <div style={styles.configGroup}>
              <label style={styles.configLabel}>Nível de Log:</label>
              <select 
                value={configuracoes.monitoramento.logLevel}
                onChange={(e) => handleChange('monitoramento', 'logLevel', e.target.value)}
                style={styles.configInput}
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status do Sistema */}
        <div style={styles.statusCard}>
          <h3>🏥 Status do Sistema</h3>
          <div style={styles.statusGrid}>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>ADN Contribuintes:</span>
              <span style={styles.statusValue}>🟢 Online</span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>ADN Parâmetros:</span>
              <span style={styles.statusValue}>🟢 Online</span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>ADN DANFSe:</span>
              <span style={styles.statusValue}>🟢 Online</span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Certificado mTLS:</span>
              <span style={styles.statusValue}>🟢 Válido</span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Workers:</span>
              <span style={styles.statusValue}>🟢 Ativo</span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Storage:</span>
              <span style={styles.statusValue}>🟢 Conectado</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div style={styles.actionsCard}>
          <button 
            style={styles.saveButton}
            onClick={salvarConfiguracoes}
            disabled={saving}
          >
            {saving ? '💾 Salvando...' : '💾 Salvar Configurações'}
          </button>
          <button 
            style={styles.testAllButton}
            onClick={() => {
              testarConexao('contribuintes');
              testarConexao('parametros');
              testarConexao('danfse');
              testarConexao('mTLS');
            }}
          >
            🔄 Testar Todas as Conexões
          </button>
          <button 
            style={styles.backupButton}
            onClick={() => alert('Backup das configurações realizado!')}
          >
            📦 Fazer Backup
          </button>
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
  success: { color: '#0f5132', backgroundColor: '#d1e7dd', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
  configCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '20px' },
  configGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  configGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  configLabel: { fontWeight: '500', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' },
  configInput: { padding: '10px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px' },
  checkbox: { marginRight: '8px' },
  testButton: { padding: '8px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginTop: '5px' },
  testing: { color: '#17a2b8', fontSize: '12px' },
  success: { color: '#28a745', fontSize: '12px' },
  error: { color: '#dc3545', fontSize: '12px' },
  statusCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '20px' },
  statusGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  statusItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' },
  statusLabel: { fontWeight: '500', color: '#495057' },
  statusValue: { fontSize: '14px', fontWeight: 'bold' },
  actionsCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '15px', flexWrap: 'wrap' },
  saveButton: { padding: '12px 24px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  testAllButton: { padding: '12px 24px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  backupButton: { padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner: { border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' },
  '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
};

export default ConfiguracoesAdminPage;
