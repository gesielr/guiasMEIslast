import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const CadastroPage = () => {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.selectionContainer}>
        <div style={styles.logoWrapper}>
          <img src={logo} alt="Logo GuiaMei" style={styles.logo} />
          <h2 style={styles.title}>Escolha seu perfil</h2>
          <p style={styles.subtitle}>Selecione o tipo de cadastro que deseja realizar.</p>
        </div>

       <div style={styles.buttonContainer}>
  <Link to="/cadastro/mei" style={styles.selectionButton}>
    <span style={{ ...styles.buttonIcon, marginRight: '12px' }}>🏢</span>
    <span style={{
      ...styles.buttonText,
      textTransform: 'uppercase',
      color: '#28a745', // verde
      marginRight: '8px',
    }}>
      Sou MEI
    </span>
    <span style={styles.buttonSubtext}>
      Cadastro para Microempreendedor Individual
    </span>
  </Link>

  <Link to="/cadastro/autonomo" style={styles.selectionButton}>
    <span style={{ ...styles.buttonIcon, marginRight: '12px' }}>👤</span>
    <span style={{
      ...styles.buttonText,
      textTransform: 'uppercase',
      color: '#28a745', // verde
      marginRight: '8px',
    }}>
      Sou Autônomo
    </span>
    <span style={styles.buttonSubtext}>
      Cadastro para contribuintes individuais
    </span>
  </Link>
</div>

        <div style={styles.backLinkContainer}>
            <Link to="/" style={styles.backLink}>
                <span style={styles.backIcon}>{"←"}</span>
                <span>Voltar para a Home</span>
            </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
    pageContainer: {
        display: "flex",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f1f5ff 0%, #f8fbff 100%)",
        fontFamily: '"Inter", sans-serif',
        padding: "24px",
    },
    selectionContainer: {
        maxWidth: "500px",
        width: "100%",
        backgroundColor: "#ffffff",
        padding: "40px 48px",
        borderRadius: "24px",
        boxShadow: "0 28px 60px rgba(15, 23, 42, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
    },
    logoWrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "12px",
    },
    logo: {
        width: "64px",
        height: "64px",
        objectFit: "contain",
        marginBottom: "12px",
    },
    title: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#1f2937",
        margin: 0,
    },
    subtitle: {
        color: "#64748b",
        margin: 0,
        fontSize: "16px",
        lineHeight: "1.5",
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    selectionButton: {
        display: "flex",
        alignItems: "center",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #d5dbea",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        background: "#f9fbff",
    },
    buttonIcon: {
        fontSize: "32px",
        marginRight: "20px",
    },
    buttonText: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#1e293b",
    },
    buttonSubtext: {
        fontSize: "14px",
        color: "#475569",
        marginTop: "4px",
    },
    backLinkContainer: {
        textAlign: 'center',
        marginTop: '20px',
    },
    backLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        textDecoration: "none",
        color: "#475569",
        fontSize: "14px",
        fontWeight: "500",
    },
    backIcon: {
        fontSize: "18px",
        lineHeight: "1",
    },
};

export default CadastroPage;
