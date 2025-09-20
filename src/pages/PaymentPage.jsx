// src/pages/PaymentPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createCheckoutSession } from '../services/paymentService';

const PaymentPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Extrair user_id da URL (ex: /pagar?user_id=uuid)
  const params = new URLSearchParams(location.search);
  const userId = params.get('user_id');

  useEffect(() => {
    if (!userId) {
      setError('ID de usuário não fornecido.');
      setLoading(false);
      return;
    }

    const initiatePayment = async () => {
      try {
        const checkoutUrl = await createCheckoutSession(userId, 120, "Adesão Rebelo App");
        window.location.href = checkoutUrl; // Redireciona para o Stripe
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initiatePayment();
  }, [userId]);

  if (error) {
    return (
      <div style={styles.container}>
        <h2>❌ Erro no Pagamento</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} style={styles.button}>
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Processando pagamento...</h2>
      <p>Por favor, aguarde. Você será redirecionado ao Stripe.</p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '100px auto',
    padding: '20px',
    textAlign: 'center',
    fontFamily: 'Arial',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default PaymentPage;