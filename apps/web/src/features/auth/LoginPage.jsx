import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/auth-provider';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const LoginPage = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5511999999999';

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
          const result = await login(identifier, password);

      const userType = result?.profile?.user_type;
      if (userType === 'partner') {
        navigate('/dashboard/parceiro');
        return;
      }
      if (userType === 'admin') {
        navigate('/dashboard/admin');
        return;
      }

      const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Quero falar com a IA do GuiasMEI.')}`;
      window.location.href = whatsappLink;
    } catch (err) {
      setError(err.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const imageSectionStyle = {
    flex: 1,
    display: screenWidth >= 768 ? 'block' : 'none',
  };

  return (
    <div style={styles.pageContainer}>
      
      <div style={styles.formSection}>
        
        <div style={styles.formContainer}>
          <div style={imageSectionStyle}>
        <img src={logo} alt="Rebelo App" style={styles.image} />
      </div>
          <h2 style={styles.title}>Bem-vindo de volta!</h2>
          <p style={styles.subtitle}>Faça login para acessar seu painel.</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div>
              <label style={styles.label}>E-mail ou telefone</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p style={styles.signupText}>
            Não tem uma conta? <Link to="/cadastro" style={styles.link}>Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '"Inter", sans-serif',
  },
  image: {
    width: '30%',
    height: '30%',
    objectFit: 'cover',
    display: 'block',      // transforma em bloco
    margin: '0 auto',      // centraliza horizontalmente
    marginBottom: '10px',  // espaço abaixo da imagem
  },
  formSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#f8f9fa',
  },
  formContainer: {
    maxWidth: '450px',
    width: '100%',
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: '5px',
    textAlign: 'center',
    marginTop: '-5px',
  },
  subtitle: {
    color: '#6c757d',
    marginBottom: '30px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  label: {
    fontWeight: '500',
    marginBottom: '5px',
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
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  submitButton: {
    padding: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.2s, opacity 0.2s',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #f5c6cb',
    marginBottom: '15px',
    fontSize: '14px',
    textAlign: 'center',
  },
  signupText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#6c757d',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default LoginPage;

