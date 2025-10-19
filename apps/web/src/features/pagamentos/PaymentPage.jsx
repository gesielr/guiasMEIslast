// src/pages/PaymentPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createCheckoutSession } from '../../services/paymentService';

const PaymentPage = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const userId = params.get('user_id');

  useEffect(() => {
    if (!userId) {
      setError('ID de usuário não fornecido. Por favor, retorne e tente novamente.');
      return;
    }

    const initiatePayment = async () => {
      try {
        const checkoutUrl = await createCheckoutSession(userId, 120, "Adesão Rebelo App");
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          throw new Error('Não foi possível obter a URL de pagamento.');
        }
      } catch (err) {
        setError(err.message || 'Ocorreu um erro desconhecido ao iniciar o pagamento.');
      }
    };

    initiatePayment();
  }, [userId]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {error ? (
          <>
            <h2 style={styles.title}>❌ Erro no Pagamento</h2>
            <p style={styles.subtitle}>{error}</p>
            <button onClick={() => navigate('/dashboard')} style={styles.button}>
              Ir para o Dashboard
            </button>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Processando seu Pagamento</h2>
            <p style={styles.subtitle}>Por favor, aguarde. Estamos preparando um ambiente seguro para você e em instantes você será redirecionado para o Stripe.</p>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: '"Inter", sans-serif',
    padding: '20px',
  },
  card: {
    maxWidth: '500px',
    width: '100%',
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: '15px',
  },
  subtitle: {
    color: '#6c757d',
    marginBottom: '30px',
    lineHeight: 1.5,
  },
  button: {
    padding: '12px 25px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px auto',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

export default PaymentPage;
