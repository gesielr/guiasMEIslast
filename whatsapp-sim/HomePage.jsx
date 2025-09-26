import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../supabase/client';

// Componente para o formulário de cadastro
const SignupForm = ({ type, title, subtitle, fields, ctaText }) => {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Lógica de cadastro (simplificada para o exemplo)
      // Em um app real, você faria o signUp com Supabase aqui
      console.log(`Cadastrando ${type}:`, formData);

      // Simulação de criação de usuário para obter um ID
      const mockUserId = `user_${Math.random().toString(36).substr(2, 9)}`;

      // Redireciona para o onboarding no Telegram
      const botUsername = 'seu_bot_do_telegram'; // SUBSTITUA PELO NOME DO SEU BOT
      // const message = `Olá! Sou novo usuário. Meu ID é: ${mockUserId}`;
      window.open(`https://t.me/${botUsername}?start=${mockUserId}`, '_blank');

      // Opcional: redirecionar para uma página de "verifique seu telegram"
      // navigate('/post-cadastro');

    } catch (err) {
      setError(err.message || 'Ocorreu um erro no cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h3>{title}</h3>
      <p style={styles.subtitle}>{subtitle}</p>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.name} style={styles.formGroup}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required
              style={styles.input}
            />
            {field.helpText && <small style={styles.helpText}>{field.helpText}</small>}
          </div>
        ))}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Cadastrando...' : ctaText}
        </button>
      </form>
    </div>
  );
};


const HomePage = () => {
  const meiFields = [
    { name: 'cnpj', label: 'CNPJ', type: 'text', placeholder: '00.000.000/0001-00' },
    { name: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
    { name: 'phone', label: 'Telefone', type: 'tel', placeholder: '(00) 90000-0000' },
  ];

  const pfFields = [
    { name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Seu nome completo' },
    { name: 'cpf', label: 'CPF', type: 'text', placeholder: '000.000.000-00' },
    { name: 'pis', label: 'Número do PIS', type: 'text', placeholder: '000.00000.00-0', helpText: "Encontre na sua Carteira de Trabalho Digital." },
  ];

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <h1>Simplifique sua vida fiscal.</h1>
        <p>Notas fiscais e guias de INSS em poucos cliques, com automação via Telegram.</p>
      </header>

      <main style={styles.mainContent}>
        <SignupForm
          type="mei"
          title="Sou MEI"
          subtitle="Quero emitir Notas Fiscais"
          fields={meiFields}
          ctaText="Cadastrar e Iniciar"
        />
        <div style={styles.divider}></div>
        <SignupForm
          type="pf"
          title="Sou Autônomo"
          subtitle="Quero gerar minhas guias de INSS (GPS)"
          fields={pfFields}
          ctaText="Cadastrar e Iniciar"
        />
      </main>

      <section style={styles.featuresSection}>
        <h2>Como Funciona</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>1️⃣</span>
            <h3>Cadastre-se em 60s</h3>
            <p>Preencha seus dados básicos em nosso site de forma rápida e segura.</p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>2️⃣</span>
            <h3>Converse com nossa IA</h3>
            <p>Nossa assistente virtual te guia pelo Telegram para finalizar a configuração.</p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>3️⃣</span>
            <h3>Emita e Gerencie</h3>
            <p>Acesse seu painel e emita suas guias e notas sempre que precisar.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  pageContainer: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
    textAlign: 'center',
    padding: '0 20px',
  },
  header: {
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
  },
  mainContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '40px',
    padding: '40px 0',
    flexWrap: 'wrap',
  },
  formContainer: {
    flex: 1,
    minWidth: '320px',
    maxWidth: '450px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    borderRadius: '12px',
    backgroundColor: 'white',
  },
  subtitle: {
    color: '#6c757d',
    marginBottom: '25px',
  },
  divider: {
    width: '1px',
    backgroundColor: '#dee2e6',
    alignSelf: 'stretch',
  },
  formGroup: {
    textAlign: 'left',
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    boxSizing: 'border-box',
  },
  helpText: {
    fontSize: '12px',
    color: '#6c757d',
    marginTop: '4px',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  featuresSection: {
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
  },
  featuresGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginTop: '30px',
    flexWrap: 'wrap',
  },
  featureCard: {
    flex: 1,
    maxWidth: '300px',
  },
  featureIcon: {
    fontSize: '2rem',
  }
};

export default HomePage;