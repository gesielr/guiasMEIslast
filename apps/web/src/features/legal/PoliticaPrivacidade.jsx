// src/pages/PoliticaPrivacidade.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const PoliticaPrivacidade = () => {
  return (
    <div style={styles.pageWrapper}>
      <header style={styles.header}>
        <Link to="/"><img src={logo} alt="Rebelo App Logo" style={styles.logo} /></Link>
        <nav>
          <Link to="/cadastro" style={styles.ctaButtonHeader}>Cadastrar-se</Link>
        </nav>
      </header>

      <main style={styles.container}>
        <h1 style={styles.mainTitle}>Política de Privacidade</h1>
        <p style={styles.lastUpdated}><strong>Última atualização:</strong> 10 de Abril de 2025</p>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Introdução</h2>
          <p>
            A Rebelo Contabilidade ("nós", "nosso"), inscrita no CNPJ 00.000.000/0000-00, valoriza e respeita a sua privacidade. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos, compartilhamos e protegemos seus dados pessoais ao usar nossa plataforma Rebelo App ("Plataforma"), em total conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018) do Brasil.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Dados Pessoais Coletados</h2>
          <p>Para a prestação de nossos serviços, coletamos os seguintes dados:</p>
          <ul style={styles.list}>
            <li><strong>Dados de Identificação:</strong> Nome completo, CPF ou CNPJ, e número do PIS/PASEP.</li>
            <li><strong>Dados de Contato:</strong> Endereço de e-mail e número de telefone (WhatsApp).</li>
            <li><strong>Dados de Autenticação:</strong> Senha de acesso (armazenada de forma criptografada).</li>
            <li><strong>Dados de Pagamento:</strong> Informações necessárias para processar pagamentos de assinaturas e serviços, gerenciadas por nosso parceiro de pagamentos (Stripe).</li>
            <li><strong>Dados de Uso:</strong> Logs de comunicação, informações sobre as guias e notas fiscais emitidas, e interações com a plataforma.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Finalidade do Tratamento de Dados</h2>
          <p>Seus dados são utilizados exclusivamente para as seguintes finalidades:</p>
          <ul style={styles.list}>
            <li>Permitir a emissão de notas fiscais de serviço (NFS-e) e guias de INSS (GPS) em seu nome.</li>
            <li>Realizar seu cadastro e autenticação na plataforma.</li>
            <li>Processar pagamentos pelos nossos serviços.</li>
            <li>Enviar comunicações importantes sobre sua conta, serviços e suporte técnico via e-mail ou WhatsApp.</li>
            <li>Cumprir obrigações legais e fiscais.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Compartilhamento de Dados</h2>
          <p>A Rebelo App não vende, aluga ou comercializa seus dados. O compartilhamento ocorre apenas nas seguintes circunstâncias:</p>
          <ul style={styles.list}>
            <li><strong>Órgãos Governamentais:</strong> Com a Receita Federal, Prefeituras e outros órgãos competentes, estritamente para a emissão dos documentos fiscais solicitados por você.</li>
            <li><strong>Processadores de Pagamento:</strong> Com a Stripe, para processar transações financeiras de forma segura.</li>
            <li><strong>Parceiros Contábeis:</strong> Caso você opte por vincular sua conta a um de nossos parceiros contábeis.</li>
            <li><strong>Obrigações Legais:</strong> Se formos obrigados por lei, ordem judicial ou requisição de autoridade competente.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Segurança dos Dados</h2>
          <p>
            Adotamos as melhores práticas de segurança para proteger seus dados. Todos os dados sensíveis, como CPF, CNPJ e PIS, são criptografados em nossos bancos de dados. Utilizamos protocolos de segurança (HTTPS) para a transferência de dados e implementamos políticas de acesso restrito (Row Level Security no Supabase) para garantir que apenas pessoal autorizado tenha acesso às informações.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Seus Direitos como Titular dos Dados</h2>
          <p>De acordo com a LGPD, você tem o direito de:</p>
          <ul style={styles.list}>
            <li>Confirmar a existência de tratamento de seus dados.</li>
            <li>Acessar seus dados a qualquer momento.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em não conformidade com a lei.</li>
            <li>Revogar seu consentimento a qualquer momento.</li>
          </ul>
          <p>Para exercer seus direitos, entre em contato com nosso Encarregado de Proteção de Dados (DPO) pelo e-mail: <a href="mailto:dpo@rebelo.app" style={styles.link}>dpo@rebelo.app</a>.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Contato</h2>
          <p>Se tiver qualquer dúvida sobre esta Política de Privacidade, entre em contato conosco:</p>
          <p><strong>Encarregado de Proteção de Dados (DPO):</strong> dpo@rebelo.app</p>
          <p><strong>Suporte Geral:</strong> contato@rebelo.app</p>
        </section>

        <div style={styles.backLinkContainer}>
            <Link to="/" style={styles.backLink}>← Voltar para a Página Inicial</Link>
        </div>
      </main>

      <footer style={styles.footer}>
        <p>© 2025 Rebelo App. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

const styles = {
  pageWrapper: {
    fontFamily: '"Inter", sans-serif',
    color: '#343a40',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 40px',
    borderBottom: '1px solid #e9ecef',
  },
  logo: {
    height: '50px',
  },
  logoLink: {
    textDecoration: 'none',
    color: '#212529',
  },
  ctaButtonHeader: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  mainTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
  },
  lastUpdated: {
    textAlign: 'center',
    color: '#6c757d',
    marginBottom: '40px',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px',
    marginBottom: '20px',
    color: '#007bff',
  },
  list: {
    paddingLeft: '20px',
    lineHeight: '1.8',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '500',
  },
  backLinkContainer: {
      textAlign: 'center',
      marginTop: '40px',
  },
  backLink: {
    display: 'inline-block',
    fontWeight: '500',
    color: '#007bff',
    textDecoration: 'none',
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    marginTop: '40px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e9ecef',
    color: '#6c757d',
  },
};

export default PoliticaPrivacidade;
