// src/pages/EmitirGpsPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const EmitirGpsPage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    month_ref: '',
    value: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          navigate('/login'); // Redirect to login instead of cadastro
          return;
        }
        setUser(authUser);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

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
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.month_ref) {
      setError('Selecione o mês de competência.');
      return false;
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      setError('O valor da contribuição deve ser maior que zero.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const simulatedBarcode = `846700000000${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
      const simulatedPdfUrl = `https://rebelo.app/mock-gps/${Date.now()}.pdf`;

      const { error: insertError } = await supabase.from('gps_emissions').insert({
        user_id: user.id,
        value: parseFloat(formData.value),
        month_ref: formData.month_ref,
        barcode: simulatedBarcode,
        pdf_url: simulatedPdfUrl,
        status: 'issued',
        inss_code: profile.pis || profile.document,
      });

      if (insertError) throw insertError;

      setSuccess({
        message: 'Guia GPS emitida com sucesso!',
        month: formData.month_ref,
        value: parseFloat(formData.value).toFixed(2),
        barcode: simulatedBarcode,
      });

      setFormData({ month_ref: '', value: '' });

    } catch (err) {
      setError('Erro ao emitir guia: ' + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.centered}><div style={styles.spinner}></div></div>;
  }

  return (
    <div style={styles.dashboardContainer}>
      {/* Sidebar can be a shared component */}
      <aside style={styles.sidebar}>
        <img src={logo} alt="Rebelo App Logo" style={styles.logo} />
        <nav style={styles.nav}>
          <button style={styles.navLink} onClick={() => navigate('/dashboard')}><span>🏠</span> Dashboard</button>
          <button style={styles.navLink} onClick={() => navigate('/emitir-nota')}><span>📄</span> Emitir NFS-e</button>
          <button style={{...styles.navLink, ...styles.activeNavLink}}><span>💰</span> Emitir Guia GPS</button>
        </nav>
        <div style={styles.logoutButton} onClick={() => supabase.auth.signOut().then(() => navigate('/'))}>
          <span>🚪</span> Sair
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h2>Emitir Guia de Previdência Social (GPS)</h2>
          <p>Preencha os dados para gerar sua guia de contribuição.</p>
        </header>

        <div style={styles.formCard}>
          {error && <div style={styles.error}>{error}</div>}
          
          {success ? (
            <div style={styles.successContainer}>
              <h3>{success.message}</h3>
              <p><strong>Mês de Competência:</strong> {success.month}</p>
              <p><strong>Valor:</strong> R$ {success.value}</p>
              <div style={styles.barcodeContainer}>
                <p><strong>Código de Barras:</strong></p>
                <p style={styles.barcode}>{success.barcode}</p>
                <button onClick={() => navigator.clipboard.writeText(success.barcode)} style={styles.copyButton}>Copiar Código</button>
              </div>
              <button onClick={() => setSuccess('')} style={styles.submitButton}>Emitir Outra Guia</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mês de Competência *</label>
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
                <label style={styles.label}>Valor da Contribuição (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Ex: 150,55"
                  min="0.01"
                />
              </div>

              <button type="submit" disabled={formLoading} style={styles.submitButton}>
                {formLoading ? 'Emitindo...' : 'Emitir Guia GPS'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  // Using styles from Dashboard for consistency
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '"Inter", sans-serif',
    backgroundColor: '#f8f9fa',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#fff',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #dee2e6',
  },
  logo: {
    height: '50px',
    marginBottom: '40px',
    alignSelf: 'center',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flexGrow: 1,
  },
  navLink: {
    textDecoration: 'none',
    color: '#495057',
    padding: '12px 15px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: 500,
    transition: 'background-color 0.2s, color 0.2s',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  activeNavLink: {
    backgroundColor: '#e9ecef',
    color: '#007bff',
  },
  logoutButton: {
    padding: '12px 15px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: 500,
    color: '#dc3545',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  mainContent: {
    flex: 1,
    padding: '40px',
  },
  header: {
    marginBottom: '30px',
  },
  formCard: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    maxWidth: '600px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    fontWeight: '500',
    marginBottom: '8px',
    display: 'block',
    color: '#495057'
  },
  input: {
    padding: '12px 15px',
    fontSize: '16px',
    border: '1px solid #ced4da',
    borderRadius: '8px',
    width: '100%',
    boxSizing: 'border-box',
  },
  submitButton: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  successContainer: {
    textAlign: 'center',
  },
  barcodeContainer: {
    margin: '20px 0',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  barcode: {
    fontFamily: 'monospace',
    fontSize: '18px',
    wordBreak: 'break-all',
    color: '#212529',
  },
  copyButton: {
    padding: '8px 15px',
    fontSize: '14px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

export default EmitirGpsPage;
