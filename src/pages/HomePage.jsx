// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Rebelo App</h1>
        <p>Automatize sua gestão fiscal como MEI ou Autônomo</p>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <h2>Emita Notas Fiscais e Guias de INSS pelo WhatsApp</h2>
          <p>Com IA guiando você passo a passo. Sem burocracia.</p>
          <Link to="/cadastro">
            <button style={styles.ctaButton}>Cadastrar-se Agora</button>
          </Link>
        </section>

        <section style={styles.testimonials}>
          <h3>O que nossos usuários dizem:</h3>
          <div style={styles.testimonialCard}>
            <p>“Em 5 minutos eu já tinha emitido minha primeira nota!”</p>
            <cite>— Ana, Designer Freelancer</cite>
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  hero: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  ctaButton: {
    padding: '12px 24px',
    fontSize: '18px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  testimonials: {
    textAlign: 'center',
  },
  testimonialCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    margin: '20px auto',
    maxWidth: '600px',
  },
};

export default HomePage;