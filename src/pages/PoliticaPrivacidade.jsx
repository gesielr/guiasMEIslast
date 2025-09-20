// src/pages/PoliticaPrivacidade.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PoliticaPrivacidade = () => {
  return (
    <div style={styles.container}>
      <h1>Política de Privacidade - Rebelo App</h1>
      <p><strong>Última atualização:</strong> 10 de Abril de 2025</p>

      <h2>1. Introdução</h2>
      <p>
        A Rebelo Contabilidade, inscrita no CNPJ 00.000.000/0000-00, compromete-se a proteger a privacidade dos usuários de sua plataforma.
        Esta política descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a LGPD (Lei 13.709/2018).
      </p>

      <h2>2. Dados Coletados</h2>
      <ul>
        <li>Nome completo</li>
        <li>CPF ou CNPJ</li>
        <li>Número do PIS</li>
        <li>E-mail e telefone</li>
        <li>Dados de pagamento</li>
        <li>Logs de comunicação via WhatsApp</li>
      </ul>

      <h2>3. Finalidade do Tratamento</h2>
      <p>Os dados são coletados exclusivamente para:</p>
      <ul>
        <li>Emissão de notas fiscais e guias de INSS em seu nome</li>
        <li>Envio de comprovantes e comunicação via WhatsApp</li>
        <li>Cumprimento de obrigações fiscais e legais</li>
      </ul>

      <h2>4. Compartilhamento de Dados</h2>
      <p>
        Seus dados não serão vendidos ou compartilhados com terceiros, exceto:
      </p>
      <ul>
        <li>Com parceiros contábeis que você vincular</li>
        <li>Com órgãos governamentais (Receita, INSS, Prefeituras) para emissão de documentos</li>
        <li>Quando exigido por lei</li>
      </ul>

      <h2>5. Segurança</h2>
      <p>
        Todos os dados sensíveis (CPF, CNPJ, PIS) são criptografados em repouso.
        Acesso é restrito por políticas de segurança (RLS) e autenticação.
      </p>

      <h2>6. Seus Direitos</h2>
      <p>Você tem direito a:</p>
      <ul>
        <li>Confirmar a existência de tratamento</li>
        <li>Acessar seus dados</li>
        <li>Corrigir dados incompletos ou inexatos</li>
        <li>Solicitar anonimização, bloqueio ou eliminação</li>
        <li>Revogar consentimento</li>
      </ul>
      <p>Para exercer esses direitos, envie e-mail para: privacidade@rebelo.app</p>

      <h2>7. Contato</h2>
      <p>Encarregado de Proteção de Dados (DPO): dpo@rebelo.app</p>

      <Link to="/" style={styles.backLink}>← Voltar para Home</Link>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
  },
  backLink: {
    display: 'inline-block',
    marginTop: '40px',
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default PoliticaPrivacidade;