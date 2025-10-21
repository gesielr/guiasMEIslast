// src/features/dashboards/DashboardPartner.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';
import { decryptData } from '../../utils/encryption';
import logo from '../../assets/logo.png';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const DashboardPartner = () => {
  const [partner, setPartner] = useState(null);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({ total_nfse: 0, total_gps: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newClient, setNewClient] = useState({ document: '', name: '', documentType: 'cpf' });
  const [activeSection, setActiveSection] = useState('overview');
  const [inviteLink, setInviteLink] = useState('');
  const [clientFeedback, setClientFeedback] = useState('');
  const navigate = useNavigate();

  const averageCommission = useMemo(() => {
    if (!clients.length) return 0;
    return stats.total_revenue / clients.length;
  }, [clients.length, stats.total_revenue]);

  const commissionHistory = useMemo(() => {
    if (!clients.length) return [];
    return clients.map((client, index) => ({
      id: client.client_id ?? `client-${index}`,
      name: client.profile?.name ?? 'Cliente sem nome',
      amount: Number.isFinite(averageCommission) ? averageCommission : 0,
      date: client.created_at ? new Date(client.created_at).toLocaleDateString('pt-BR') : 'N/D',
      status: client.profile?.onboarding_completed ? 'Pago' : 'Pendente'
    }));
  }, [clients, averageCommission]);

  const totalCommission = useMemo(() => {
    if (Number.isFinite(stats.total_revenue)) return stats.total_revenue;
    return 0;
  }, [stats.total_revenue]);

  const sectionMeta = useMemo(() => ({
    overview: {
      title: `Olá, ${partner?.company_name ?? 'Contabilidade'}!`,
      description: 'Gerencie seus clientes e acompanhe suas comissões.'
    },
    clients: {
      title: 'Meus Clientes',
      description: 'Visualize e gerencie toda a base de clientes atendidos pela sua contabilidade.'
    },
    commissions: {
      title: 'Minhas Comissões',
      description: 'Acompanhe o histórico de comissões geradas pelos serviços prestados aos clientes.'
    }
  }), [partner?.company_name]);

  const calculateStats = useCallback(async (clientList) => {
    if (!clientList?.length || !supabaseConfigured) {
      setStats({ total_nfse: clientList?.length ?? 0, total_gps: 0, total_revenue: clientList?.length ? clientList.length * 120 : 0 });
      return;
    }

    const clientIds = clientList.map((c) => c.client_id);
    const { data: nfseData } = await supabase.from('nfse_emissions').select('id').in('user_id', clientIds).eq('status', 'issued');
    const { data: gpsData } = await supabase.from('gps_emissions').select('value').in('user_id', clientIds).eq('status', 'issued');

    const nfseCount = nfseData?.length || 0;
    const gpsTotalValue = gpsData?.reduce((sum, gps) => sum + gps.value, 0) || 0;
    const totalRevenue = (nfseCount * 3.0) + (gpsTotalValue * 0.06);

    setStats({
      total_nfse: nfseCount,
      total_gps: gpsData?.length || 0,
      total_revenue: totalRevenue
    });
  }, []);

  const fetchPartnerData = useCallback(async () => {
    try {
      if (!supabaseConfigured) {
        const mockClients = [
          {
            client_id: 'mock-client-1',
            created_at: new Date().toISOString(),
            profile: {
              name: 'Cliente Exemplo 1',
              document: '12345678901',
              document_type: 'cpf',
              onboarding_completed: true
            }
          },
          {
            client_id: 'mock-client-2',
            created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
            profile: {
              name: 'Cliente Exemplo 2',
              document: '12345678000199',
              document_type: 'cnpj',
              onboarding_completed: false
            }
          }
        ];

        setPartner({ company_name: 'Contabilidade Demo', email: 'contato@demo.com' });
        setClients(mockClients);
        await calculateStats(mockClients);
        setLoading(false);
        return;
      }

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
          const cleanDocument = decryptedDocument.replace(/\D/g, '');
          const documentType = client.profile.document_type ?? detectDocumentType(cleanDocument);
          return {
            ...client,
            profile: {
              ...client.profile,
              document: cleanDocument,
              document_type: documentType
            }
          };
        })
      );

      setClients(decryptedClients);
      await calculateStats(decryptedClients);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
      setLoading(false);
    }
  }, [calculateStats, navigate]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

  const handleAddClient = async (event) => {
    event.preventDefault();
    setClientFeedback('');
    setInviteLink('');

    if (!newClient.name.trim() || !newClient.document.trim()) {
      setClientFeedback('Preencha o nome e o documento do cliente.');
      return;
    }

    const cleanDocument = newClient.document.replace(/\D/g, '');
    const inferredType =
      newClient.documentType ??
      (cleanDocument.length > DOCUMENT_LENGTH.cpf ? 'cnpj' : 'cpf');
    const expectedLength = DOCUMENT_LENGTH[inferredType];
    const docType = detectDocumentType(cleanDocument);

    if (!docType || cleanDocument.length !== expectedLength) {
      const label = inferredType === 'cnpj' ? 'CNPJ' : 'CPF';
      setClientFeedback(`Informe um ${label} valido com ${expectedLength} digitos.`);
      return;
    }

    if (!supabaseConfigured) {
      const id = `mock-client-${Date.now()}`;
      const created_at = new Date().toISOString();
      const newEntry = {
        client_id: id,
        created_at,
        profile: {
          name: newClient.name,
          document: cleanDocument,
          document_type: docType,
          onboarding_completed: false
        }
      };

      setClients((previous) => {
        const updated = [...previous, newEntry];
        void calculateStats(updated);
        return updated;
      });

      const baseUrl = window.location?.origin ?? 'https://guiasmei.local';
      const generatedLink = `${baseUrl}${buildInviteRoute(docType)}?ref=${encodeURIComponent(id)}`;
      setInviteLink(generatedLink);
      const targetLabel = docType === 'cnpj' ? 'MEI' : 'Autonomo';
      setClientFeedback(`Link de convite gerado para o cadastro ${targetLabel}. Copie e envie para o cliente concluir o processo.`);
      setNewClient({ name: '', document: '', documentType: 'cpf' });
      setActiveSection('clients');
      return;
    }

    // TODO: integrar com API real quando disponivel
    const docLabel = docType === 'cnpj' ? 'CNPJ' : 'CPF';
    setClientFeedback(`Integracao com API ainda nao implementada neste ambiente para documentos do tipo ${docLabel}.`);
  };

  const DOCUMENT_LENGTH = { cpf: 11, cnpj: 14 };

  const detectDocumentType = (value) => {
    const cleanValue = value?.replace?.(/\D/g, '') ?? '';
    if (cleanValue.length === DOCUMENT_LENGTH.cnpj) return 'cnpj';
    if (cleanValue.length === DOCUMENT_LENGTH.cpf) return 'cpf';
    return null;
  };

  const maskDocument = (value, typeHint) => {
    const cleanValue = value?.replace?.(/\D/g, '') ?? '';
    const type = typeHint ?? detectDocumentType(cleanValue);
    if (type === 'cpf' && cleanValue.length === DOCUMENT_LENGTH.cpf) {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (type === 'cnpj' && cleanValue.length === DOCUMENT_LENGTH.cnpj) {
      return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cleanValue;
  };

  const buildInviteRoute = (docType) =>
    docType === 'cpf' ? '/cadastro/autonomo' : '/cadastro/mei';

  const formatDocumentWithLabel = (value, typeHint) => {
    const type = typeHint ?? detectDocumentType(value);
    const masked = maskDocument(value, type);
    if (!masked) return 'N/D';
    if (type === 'cnpj') return `${masked} (CNPJ)`;
    if (type === 'cpf') return `${masked} (CPF)`;
    return masked;
  };

  const currentMeta = sectionMeta[activeSection] ?? sectionMeta.overview;

  const renderAddClientCard = () => (
    <div style={styles.card}>
      <h3>Adicionar Novo Cliente</h3>
      <form onSubmit={handleAddClient} style={styles.form}>
        <input
          type="text"
          placeholder="Nome do Cliente"
          value={newClient.name}
          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="CPF (11 digitos) ou CNPJ (14 digitos)"
          value={newClient.document}
          inputMode="numeric"
          maxLength={DOCUMENT_LENGTH.cnpj}
          onChange={(event) => {
            const digitsOnly = event.target.value.replace(/\D/g, '');
            const provisionalType = digitsOnly.length > DOCUMENT_LENGTH.cpf ? 'cnpj' : 'cpf';
            const limit = DOCUMENT_LENGTH[provisionalType];
            const limited = digitsOnly.slice(0, limit);
            const resolvedType = limited.length > DOCUMENT_LENGTH.cpf ? 'cnpj' : 'cpf';
            setNewClient((previous) => ({
              ...previous,
              document: limited,
              documentType: resolvedType
            }));
          }}
          style={styles.input}
          required
        />
        <span style={styles.helperText}>
          {newClient.documentType === 'cnpj'
            ? `Documento identificado como CNPJ. Restam ${Math.max(DOCUMENT_LENGTH.cnpj - newClient.document.length, 0)} digitos.`
            : `Documento identificado como CPF. Restam ${Math.max(DOCUMENT_LENGTH.cpf - newClient.document.length, 0)} digitos.`}
        </span>
        <button type="submit" disabled={loading} style={styles.button}>
          Adicionar Cliente
        </button>
      </form>
      {(clientFeedback || inviteLink) && (
        <div style={styles.feedbackBox}>
          {clientFeedback && <p style={styles.feedbackText}>{clientFeedback}</p>}
          {inviteLink && (
            <div style={styles.inviteWrapper}>
              <input
                type="text"
                readOnly
                value={inviteLink}
                style={styles.inviteInput}
                onFocus={(event) => event.target.select()}
              />
              <button
                type="button"
                style={styles.copyButton}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(inviteLink);
                    setClientFeedback('Link copiado para a area de transferencia!');
                  } catch (_error) {
                    setClientFeedback('Nao foi possivel copiar automaticamente. Copie manualmente o link abaixo.');
                  }
                }}
              >
                Copiar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderQuickActionsCard = () => (
    <div style={styles.card}>
      <h3>Ações Rápidas</h3>
      <ul style={styles.quickActionsList}>
        <li style={styles.quickActionItem}>
          <button type="button" style={styles.quickActionButton}>
            Gerar link de convite
          </button>
        </li>
        <li style={styles.quickActionItem}>
          <button type="button" style={styles.quickActionButton}>
            Enviar lembrete de pagamento
          </button>
        </li>
        <li style={styles.quickActionItem}>
          <button type="button" style={styles.quickActionButton}>
            Exportar relatórios
          </button>
        </li>
      </ul>
    </div>
  );

  const renderClientsTable = () => (
    <section style={styles.card}>
      <h3>Meus Clientes</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nome</th>
            <th style={styles.th}>Documento</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Desde</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((item) => (
            <tr key={item.client_id}>
              <td style={styles.td}>{item.profile.name}</td>
              <td style={styles.td}>{formatDocumentWithLabel(item.profile.document, item.profile.document_type)}</td>
              <td style={styles.td}>
                <span style={styles.statusBadge(item.profile.onboarding_completed)}>
                  {item.profile.onboarding_completed ? 'Ativo' : 'Pendente'}
                </span>
              </td>
              <td style={styles.td}>
                {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : 'N/D'}
              </td>
            </tr>
          ))}
          {!clients.length && (
            <tr>
              <td style={styles.emptyState} colSpan={4}>
                Nenhum cliente cadastrado ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <aside style={styles.sidebar}>
        <img src={logo} alt="Logo GuiasMEI" style={styles.logo} />
        <nav style={styles.nav}>
          <button
            style={{ ...styles.navLink, ...(activeSection === 'overview' ? styles.activeNavLink : {}) }}
            onClick={() => setActiveSection('overview')}
          >
            <span>[D]</span> Dashboard Parceiro
          </button>
          <button
            style={{ ...styles.navLink, ...(activeSection === 'clients' ? styles.activeNavLink : {}) }}
            onClick={() => setActiveSection('clients')}
          >
            <span>[C]</span> Meus Clientes
          </button>
          <button
            style={{ ...styles.navLink, ...(activeSection === 'commissions' ? styles.activeNavLink : {}) }}
            onClick={() => setActiveSection('commissions')}
          >
            <span>[$]</span> Minhas Comissões
          </button>
        </nav>
        <div
          style={styles.logoutButton}
          onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
        >
          <span>[Sair]</span> Sair
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h2>{currentMeta.title}</h2>
          <p>{currentMeta.description}</p>
        </header>

        {activeSection === 'overview' && (
          <>
            <section style={styles.statsGrid}>
              <StatCard title="Receita Total" value={`R$ ${stats.total_revenue.toFixed(2)}`} icon="R$" />
              <StatCard title="Notas Fiscais Emitidas" value={stats.total_nfse} icon="NF" />
              <StatCard title="Guias GPS Emitidas" value={stats.total_gps} icon="GPS" />
              <StatCard title="Total de Clientes" value={clients.length} icon="CL" />
            </section>

            <section style={styles.grid2Cols}>
              {renderAddClientCard()}
              {renderQuickActionsCard()}
            </section>

            {renderClientsTable()}
          </>
        )}

        {activeSection === 'clients' && (
          <>
            <section style={styles.gridSingle}>
              {renderAddClientCard()}
            </section>
            {renderClientsTable()}
          </>
        )}

        {activeSection === 'commissions' && (
          <>
            <section style={styles.statsGrid}>
              <StatCard title="Receita Total" value={`R$ ${totalCommission.toFixed(2)}`} icon="R$" />
              <StatCard title="Clientes Ativos" value={clients.length} icon="CL" />
              <StatCard title="Notas Emitidas" value={stats.total_nfse} icon="NF" />
            </section>

            <section style={styles.card}>
              <h3>Histórico de Comissões</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Valor</th>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionHistory.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.name}</td>
                      <td style={styles.td}>R$ {item.amount.toFixed(2)}</td>
                      <td style={styles.td}>{item.date}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge(item.status === 'Pago')}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                  {!commissionHistory.length && (
                    <tr>
                      <td style={styles.emptyState} colSpan={4}>
                        Nenhuma comissão registrada até o momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
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
  navLink: { textDecoration: 'none', color: '#495057', padding: '12px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, transition: 'all 0.2s', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' },
  activeNavLink: { backgroundColor: '#e9ecef', color: '#007bff' },
  logoutButton: { padding: '12px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, color: '#dc3545', cursor: 'pointer' },
  mainContent: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { marginBottom: '40px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  statIcon: { fontSize: '2rem' },
  statValue: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  statTitle: { fontSize: '14px', color: '#6c757d', margin: 0 },
  grid2Cols: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' },
  gridSingle: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px 15px', fontSize: '16px', border: '1px solid #ced4da', borderRadius: '8px' },
  helperText: { fontSize: '12px', color: '#6c757d', marginTop: '-6px' },
  button: { padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  quickActionsList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' },
  quickActionItem: { display: 'flex' },
  quickActionButton: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f8f9fa', cursor: 'pointer', fontWeight: 500, color: '#1f2937' },
  feedbackBox: { marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: '#f8f9ff', border: '1px solid #dbe4ff', display: 'flex', flexDirection: 'column', gap: '8px' },
  feedbackText: { margin: 0, fontSize: '14px', color: '#1f2937' },
  inviteWrapper: { display: 'flex', gap: '8px', alignItems: 'center' },
  inviteInput: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '14px' },
  copyButton: { padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#0d6efd', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#6c757d' },
  td: { padding: '15px', borderBottom: '1px solid #dee2e6', color: '#495057' },
  emptyState: { padding: '18px', textAlign: 'center', color: '#6c757d' },
  statusBadge: (isCompleted) => ({
    padding: '5px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: isCompleted ? '#d1e7dd' : '#fff3cd',
    color: isCompleted ? '#0f5132' : '#664d03'
  }),
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner: { border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }
};

export default DashboardPartner;
