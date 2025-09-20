// src/pages/DashboardPartner.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';
import { decryptData } from '../utils/encryption'; // ✅ ADICIONADO

const DashboardPartner = () => {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    total_nfse: 0,
    total_gps: 0,
    total_revenue: 0,
    pending_payments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newClient, setNewClient] = useState({ document: '', name: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate('/login');
        return;
      }
      setUser(authUser);

      // Verifica se é parceiro
      if (authUser.user_metadata?.user_type !== 'partner') {
        alert('Acesso restrito a parceiros.');
        navigate('/dashboard');
        return;
      }

      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (partnerError) throw partnerError;
      setPartner(partnerData);

      const { data: clientData, error: clientError } = await supabase
        .from('partner_clients')
        .select(`
          client_id,
          created_at,
          client:users (
            id,
            email,
            user_type
          ),
          profile:profiles!inner (
            id,
            name,
            document,
            pis,
            onboarding_completed,
            contract_accepted
          )
        `)
        .eq('partner_id', authUser.id);

      if (clientError) throw clientError;

      // ✅ DESCRIPTOGRAFAR DADOS DOS CLIENTES
      const decryptedClients = await Promise.all(
        clientData.map(async (client) => {
          const decryptedDocument = client.profile.document 
            ? await decryptData(client.profile.document) 
            : '';
          const decryptedPis = client.profile.pis 
            ? await decryptData(client.profile.pis) 
            : '';

          return {
            ...client,
            profile: {
              ...client.profile,
              document: decryptedDocument,
              pis: decryptedPis,
            }
          };
        })
      );

      setClients(decryptedClients);

      // Calcular estatísticas
      await calculateStats(authUser.id, decryptedClients);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
      setLoading(false);
    }
  };

  const calculateStats = async (partnerId, clientList) => {
    if (!clientList?.length) {
      setStats({ total_nfse: 0, total_gps: 0, total_revenue: 0, pending_payments: 0 });
      return;
    }

    const clientIds = clientList.map(c => c.client_id);

    const { data: nfseData, error: nfseError } = await supabase
      .from('nfse_emissions')
      .select('id, value, partner_id')
      .in('user_id', clientIds)
      .eq('status', 'issued');

    if (nfseError) throw nfseError;

    const { data: gpsData, error: gpsError } = await supabase
      .from('gps_emissions')
      .select('id, value, partner_id')
      .in('user_id', clientIds)
      .eq('status', 'issued');

    if (gpsError) throw gpsError;

    // Calcular receita: R$3,00 por NFS-e + 6% sobre GPS
    const nfseCount = nfseData?.length || 0;
    const gpsTotalValue = gpsData?.reduce((sum, gps) => sum + gps.value, 0) || 0;
    const revenueFromNfse = nfseCount * 3.0;
    const revenueFromGps = gpsTotalValue * 0.06;
    const totalRevenue = revenueFromNfse + revenueFromGps;

    setStats({
      total_nfse: nfseCount,
      total_gps: gpsData?.length || 0,
      total_revenue: totalRevenue,
      pending_payments: 0,
    });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.document || !newClient.name) {
      alert('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const { data: newUser, error: userError } = await supabase.auth.signUp({
        email: `${newClient.document}@rebelo.local`,
        password: newClient.document,
        options: {
          data: {
            user_type: 'common',
            phone: '550099999999',
          },
        },
      });

      if (userError) throw userError;

      // ✅ CRIPTOGRAFAR DOCUMENTO ANTES DE SALVAR
      const { encryptData } = await import('../utils/encryption');
      const encryptedDocument = await encryptData(newClient.document);

      const { error: profileError } = await supabase.from('profiles').insert({
        id: newUser.user.id,
        name: newClient.name,
        document: encryptedDocument, // ✅ CRIPTOGRAFADO
        onboarding_completed: false,
        contract_accepted: false,
      });

      if (profileError) throw profileError;

      const { error: linkError } = await supabase.from('partner_clients').insert({
        partner_id: user.id,
        client_id: newUser.user.id,
      });

      if (linkError) throw linkError;

      setNewClient({ document: '', name: '' });
      fetchPartnerData();

      alert('Cliente cadastrado com sucesso!');
    } catch (err) {
      alert('Erro ao cadastrar cliente: ' + err.message);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Carregando dashboard do parceiro...</h2>
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
        <h1>Olá, {partner?.company_name}!</h1>
        <p>Dashboard de Parceiro — Gerencie seus clientes e comissões</p>
      </header>

      {/* Resumo de Comissões */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>Notas Emitidas</h3>
          <p style={styles.statNumber}>{stats.total_nfse}</p>
          <p>R$ {(stats.total_nfse * 3.00).toFixed(2)} em comissões</p>
        </div>
        <div style={styles.statCard}>
          <h3>Guias GPS Emitidas</h3>
          <p style={styles.statNumber}>{stats.total_gps}</p>
          <p>R$ {(stats.total_revenue - stats.total_nfse * 3.00).toFixed(2)} em comissões GPS</p>
          <small>*6% sobre valor total das guias</small>
        </div>
        <div style={styles.statCard}>
          <h3>Comissão Total</h3>
          <p style={{ ...styles.statNumber, color: '#28a745' }}>
            R$ {stats.total_revenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Formulário para adicionar cliente */}
      <div style={styles.section}>
        <h2>➕ Adicionar Novo Cliente</h2>
        <form onSubmit={handleAddClient} style={styles.form}>
          <div style={styles.formRow}>
            <input
              type="text"
              placeholder="Nome do Cliente"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              style={styles.inputHalf}
              required
            />
            <input
              type="text"
              placeholder="CPF ou CNPJ"
              value={newClient.document}
              onChange={(e) => setNewClient({ ...newClient, document: e.target.value.replace(/\D/g, '') })}
              style={styles.inputHalf}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={styles.addButton}
          >
            {loading ? 'Cadastrando...' : 'Adicionar Cliente'}
          </button>
        </form>
      </div>

      {/* Lista de Clientes */}
      <div style={styles.section}>
        <h2>📋 Meus Clientes ({clients.length})</h2>
        {clients.length === 0 ? (
          <p>Você ainda não cadastrou clientes.</p>
        ) : (
          <div style={styles.clientsList}>
            {clients.map((item) => (
              <div key={item.client_id} style={styles.clientCard}>
                <h4>{item.profile.name}</h4>
                <p><strong>Documento:</strong> {formatDocument(item.profile.document)}</p>
                {item.profile.pis && (
                  <p><strong>PIS:</strong> {item.profile.pis}</p>
                )}
                <p>
                  <strong>Status:</strong>{' '}
                  {item.profile.onboarding_completed ? (
                    <span style={{ color: 'green' }}>✅ Ativo</span>
                  ) : (
                    <span style={{ color: 'orange' }}>⏳ Pendente</span>
                  )}
                </p>
                <p><small>Cadastrado em: {new Date(item.created_at).toLocaleDateString('pt-BR')}</small></p>
              </div>
            ))}
          </div>
        )}
      </div>

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
    maxWidth: '1200px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
  },
  section: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginBottom: '40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formRow: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  inputHalf: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '200px',
  },
  addButton: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  clientsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  clientCard: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #eee',
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

export default DashboardPartner;