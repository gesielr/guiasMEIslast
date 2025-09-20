// src/pages/EmitirNotaPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';

const EmitirNotaPage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Estado do formulário
  const [formData, setFormData] = useState({
    tomador_nome: '',
    tomador_cpf_cnpj: '',
    tomador_email: '',
    valor: '',
    descricao_servico: '',
  });

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          navigate('/login');
          return;
        }
        setUser(authUser);

        // CORREÇÃO: Removido destructuring incorreto
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Verificar se onboarding foi concluído
        if (!profileData.onboarding_completed) {
          alert('Complete o onboarding antes de emitir notas fiscais.');
          navigate('/dashboard');
          return;
        }

        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados: ' + err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]); // CORREÇÃO: Adicionado navigate como dependência

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.tomador_nome) {
      setError('Nome do tomador é obrigatório.');
      return false;
    }
    if (!formData.tomador_cpf_cnpj) {
      setError('CPF/CNPJ do tomador é obrigatório.');
      return false;
    }
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      setError('Valor deve ser maior que zero.');
      return false;
    }
    if (!formData.descricao_servico) {
      setError('Descrição do serviço é obrigatória.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // CORREÇÃO: Limpar erros antes da validação
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // SIMULAÇÃO: Em vez de chamar a API real, geramos uma chave fictícia
      const simulatedNfseKey = `NFSE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const simulatedPdfUrl = `https://rebelo.app/mock-nfse/${simulatedNfseKey}.pdf`;

      // Registrar no banco
      const { error: insertError } = await supabase.from('nfse_emissions').insert({
        user_id: user.id,
        value: parseFloat(formData.valor),
        service_description: formData.descricao_servico,
        issued_at: new Date().toISOString(),
        nfse_key: simulatedNfseKey,
        status: 'issued',
        tomador: {
          nome: formData.tomador_nome,
          documento: formData.tomador_cpf_cnpj,
          email: formData.tomador_email,
        },
        // CORREÇÃO: Adicionado campo pdf_url se necessário
        pdf_url: simulatedPdfUrl,
      });

      if (insertError) throw insertError;

      setSuccess(`✅ Nota fiscal emitida com sucesso!\nChave: ${simulatedNfseKey}`);
      setFormData({
        tomador_nome: '',
        tomador_cpf_cnpj: '',
        tomador_email: '',
        valor: '',
        descricao_servico: '',
      });

      // Para parceiros, aqui você registraria a taxa de R$3,00 — faremos depois!

    } catch (err) {
      setError('Erro ao emitir nota: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !success && !error) {
    return (
      <div style={styles.container}>
        <h2>Carregando...</h2>
        <div style={styles.spinner}>🔄</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>📄 Emitir Nota Fiscal de Serviço</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Nome do Tomador *</label>
          <input
            type="text"
            name="tomador_nome"
            value={formData.tomador_nome}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Nome ou Razão Social"
          />
        </div>

        <div style={styles.formGroup}>
          <label>CPF/CNPJ do Tomador *</label>
          <input
            type="text"
            name="tomador_cpf_cnpj"
            value={formData.tomador_cpf_cnpj}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
        </div>

        <div style={styles.formGroup}>
          <label>E-mail do Tomador (opcional)</label>
          <input
            type="email"
            name="tomador_email"
            value={formData.tomador_email}
            onChange={handleChange}
            style={styles.input}
            placeholder="exemplo@email.com"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Valor do Serviço (R$) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="valor"
            value={formData.valor}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="100.00"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Descrição do Serviço *</label>
          <textarea
            name="descricao_servico"
            value={formData.descricao_servico}
            onChange={handleChange}
            required
            style={{ ...styles.input, height: '100px', resize: 'vertical' }}
            placeholder="Ex: Consultoria em marketing digital"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Emitindo...' : 'Emitir Nota Fiscal'}
        </button>
      </form>

      <button
        onClick={() => navigate('/dashboard')}
        style={styles.backButton}
      >
        ← Voltar ao Dashboard
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box',
  },
  submitButton: {
    padding: '14px',
    fontSize: '18px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
  backButton: {
    display: 'block',
    margin: '30px auto 0',
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    textAlign: 'center',
    width: 'fit-content',
  },
  error: {
    padding: '15px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
  },
  success: {
    padding: '15px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb',
    whiteSpace: 'pre-line',
  },
  spinner: {
    textAlign: 'center',
    fontSize: '24px',
    margin: '20px 0',
  },
};

export default EmitirNotaPage;