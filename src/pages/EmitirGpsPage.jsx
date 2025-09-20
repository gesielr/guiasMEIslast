// src/pages/EmitirGpsPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';

const EmitirGpsPage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Estado do formulário
  const [formData, setFormData] = useState({
    month_ref: '', // Formato: YYYY-MM
    value: '',
  });

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ✅ CORREÇÃO 1: Sintaxe correta da desestruturação
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          navigate('/login');
          return;
        }
        setUser(authUser);

        // ✅ CORREÇÃO 2: Sintaxe correta da desestruturação
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Verificar se onboarding foi concluído
        if (!profileData.onboarding_completed) {
          alert('Complete o onboarding antes de emitir guias GPS.');
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
  }, [navigate]); // ✅ MELHORIA: Adicionado navigate nas dependências

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.month_ref) {
      alert('Selecione o mês de competência.');
      return false;
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      alert('Valor deve ser maior que zero.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      // SIMULAÇÃO: Gerar código de barras e chave fictícia
      const simulatedBarcode = `846700000000${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
      const simulatedPdfUrl = `https://rebelo.app/mock-gps/${Date.now()}.pdf`;

      // Registrar no banco
      const { error: insertError } = await supabase.from('gps_emissions').insert({
        user_id: user.id,
        value: parseFloat(formData.value),
        month_ref: formData.month_ref, // ex: "2025-04"
        barcode: simulatedBarcode,
        pdf_url: simulatedPdfUrl,
        status: 'issued',
        inss_code: profile.pis || profile.document, // Usa PIS ou CPF/CNPJ como código INSS
      });

      if (insertError) throw insertError;

      setSuccess(
        `✅ Guia GPS emitida com sucesso!\n\nMês: ${formData.month_ref}\nValor: R$ ${parseFloat(formData.value).toFixed(2)}\nCódigo de Barras: ${simulatedBarcode}`
      );

      // Resetar formulário
      setFormData({
        month_ref: '',
        value: '',
      });

      // Para parceiros, aqui você registraria a comissão de 6% — faremos depois!

    } catch (err) {
      setError('Erro ao emitir guia: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !success) {
    return (
      <div style={styles.container}>
        <h2>Carregando...</h2>
        <div style={styles.spinner}>🔄</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>💰 Emitir Guia de Previdência Social (GPS)</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Mês de Competência *</label>
          <input
            type="month"
            name="month_ref"
            value={formData.month_ref}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Valor da Contribuição (R$) *</label>
          <input
            type="number"
            step="0.01"
            name="value"
            value={formData.value}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Ex: 67,33"
            min="0.01"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={styles.submitButton}
        >
          {loading ? 'Emitindo...' : 'Emitir Guia GPS'}
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

export default EmitirGpsPage;