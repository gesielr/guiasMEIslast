// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import imagem1 from '../assets/imagem_1.png';
import imagem2 from '../assets/imagem_2.png';
import whatsAppCard from '../assets/whatsAppcard_2.png';
import notaCard from '../assets/notaCard.png';
import card3 from '../assets/card3.png';
import gps from '../assets/Guia-GPS.png';
import imgtes01 from '../assets/imgtest01.png';
import imgtes02 from '../assets/imgtest02.png';
import imgtes03 from '../assets/imgtest03.png';

const HomePage = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const styles = useMemo(() => getStyles(isMobile), [isMobile]);

  return (
    <div style={styles.container}>
      {/* Cabeçalho */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>
            <img src={logo} alt="Rebelo App Logo" style={styles.logo} />
            <span style={styles.brandName}>GuiasMei</span>
          </div>

          <nav style={styles.nav}>
            <a href="#como-funciona" style={styles.navLink}>Como Funciona</a>
            <a href="#precos" style={styles.navLink}>Preços</a>
            <a href="#faq" style={styles.navLink}>FAQ</a>
            <a href="#contato" style={styles.navLink}>Contato</a>
          </nav>

          <div style={styles.headerCtas}>
            <Link to="/admin/login" style={styles.adminButton}>Acesso Restrito Admin</Link>
            <Link to="/login" style={styles.loginLink}>Entrar</Link>
            <Link to="/cadastro" style={styles.primaryButton}>Começar agora</Link>
          </div>
        </div>
      </header>

       {/* Hero */}
<section style={styles.hero}>
  {/* IMAGEM DA ESQUERDA (homem) */}
  <img 
    src={imagem1} 
    alt="Homem com capacete e documento" 
    style={styles.heroImageLeft} 
  />

  <div style={styles.heroContent}>
    <span style={styles.badge}>🚀 Novo · Gestão fiscal com IA no WhatsApp</span>
    <h1 style={styles.heroTitle}>
      Emita notas Fiscais de MEI e guias de INSS (GPS) para autônomos com IA
    </h1>
    <p style={styles.heroSubtitle}>
      Emita notas fiscais (NFS-e) e guias de INSS (GPS) com apenas algumas mensagens. 
      Nossa IA cuida de toda a burocracia fiscal para você focar no que importa: seu negócio.
    </p>
    <div style={styles.heroActions}>
      <Link to="/cadastro" style={styles.ctaPrimary}>Começar agora</Link>
    </div>
     <div style={styles.heroProof}>
      <div style={styles.proofItem}>
        <span style={styles.proofNumber}>R$ 150,00</span>
        <span style={styles.proofLabel}>SEM MENSALIDADES <br /> Taxa única de adesão</span>
      </div>
      <div style={styles.proofItem}>
        <span style={styles.proofNumber}>3 min</span>
        <span style={styles.proofLabel}>Para emitir nota fiscal e<br />Guia de GPS (INSS)</span>
       </div>
      <div style={styles.proofItem}>
        <span style={styles.proofNumber}>100%</span>
        <span style={styles.proofLabel}>Conforme à legislação</span>
      </div>
    </div>
  </div>

  {/* IMAGEM DA DIREITA (mulher) */}
  <img 
    src={imagem2} 
    alt="Mulher com celular e guia GPS" 
    style={styles.heroImageRight} 
  />
</section>

      {/* Para quem é */}
      <section style={styles.target}>
        <div style={styles.containerInner}>
          <h2 style={styles.sectionTitle}>Ideal para MEIs e autônomos que querem simplicidade</h2>
          <div style={styles.targetGrid}>
            <TargetCard styles={styles}
              icon="👨‍💻"
              title="Desenvolvedores e Designers"
              description="Freelancers de tecnologia que precisam emitir notas fiscais rapidamente para clientes."
            />
            <TargetCard styles={styles}
              icon="🛠️"
              title="Prestadores de Serviços"
              description="Profissionais autônomos: eletricistas, encanadores, consultores, etc."
            />
            <TargetCard styles={styles}
              icon="🎨"
              title="Criativos e Consultores"
              description="Fotógrafos, publicitários, coaches e outros profissionais liberais."
            />
            <TargetCard styles={styles}
              icon="🏢"
              title="Contabilidades Parceiras"
              description="Escritórios contábeis que querem oferecer este serviço aos seus clientes MEI."
            />
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" style={styles.howItWorks}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Como funciona em 3 passos simples</h2>
          <p style={styles.sectionSubtitle}>
            Do cadastro à emissão de documentos fiscais, tudo pelo WhatsApp com nossa IA.
          </p>
        </div>

        <div style={styles.stepsGrid}>
          <StepCard styles={styles}
            number="1"
            title="Cadastre-se como MEI ou Autônomo"
            description="Informe seu CNPJ e nossa IA busca automaticamente seus dados na Receita Federal. Ou faça o cadastro de autônomo. Rápido e seguro."
            image={notaCard}
          />
          <StepCard styles={styles}
            number="2"
            title="Converse no WhatsApp"
            description="Nossa IA te guia pelo processo de adesão. SEM MENSALIDADES. Pague R$ 150.00 uma única vez e ative sua conta. Pague somente se usar. R$ 3,00 por nota ou 6% sobre a o valor da Guia de GPS (INSS)"
            image={whatsAppCard}
          />
          <StepCard styles={styles}
            number="3"
            title="Emita documentos fiscais"
            description="Solicite notas fiscais (NFS-e) e guias de GPS (INSS) direto pelo whatsApp. Simples assim!"
            image={card3} //
          />
        </div>

        <div style={styles.whatsappDemo}>
          <div style={styles.demoContent}>
            <h3 style={styles.demoTitle}>Veja como é fácil emitir uma nota fiscal:</h3>
            <div style={styles.chatDemo}>
              <div style={styles.chatMessage}>
                <span style={styles.userMessage}>Oi! Preciso emitir uma nota fiscal de R$ 1.500 para a empresa XYZ</span>
              </div>
              <div style={styles.chatMessage}>
                <span style={styles.botMessage}>
                  🤖 Perfeito! Vou te ajudar a emitir essa NFS-e.<br/>
                  Confirme os dados:<br/>
                  💰 Valor: R$ 1.500,00<br/>
                  🏢 Cliente: XYZ<br/>
                  📝 Serviço: [Digite a descrição]
                </span>
              </div>
              <div style={styles.chatMessage}>
                <span style={styles.userMessage}>Desenvolvimento de sistema web</span>
              </div>
              <div style={styles.chatMessage}>
                <span style={styles.botMessage}>
                  ✅ Nota fiscal emitida com sucesso!<br/>
                  📊 Número: 2024001<br/>
                  📧 PDF Nota Fiscal - clique para baixar<br/>
                  💻 Disponível no seu dashboard
                </span>
              </div>
            </div>
          </div>
          <div style={styles.demoImage}>
            <img
              src="https://sebrae.com.br/Sebrae/Portal%20Sebrae/UFs/AP/Imagens/artigo%2Bnfse%2B14.png"
              alt="WhatsApp no celular"
              style={styles.phoneImage}
            />
          </div>
        </div>

          <div style={styles.whatsappDemo}>
          <div style={styles.demoContent}>
            <h3 style={styles.demoTitle}>Veja como é fácil emitir a Guia de GPS (INSS):</h3>
            <div style={styles.chatDemo}>
              <div style={styles.chatMessage}>
                <span style={styles.userMessage}>Oi! quero pagar meu INSS deste mês, pode me enviar a guia?</span>
              </div>
              <div style={styles.chatMessage}>
                <span style={styles.botMessage}>
                  🤖 Perfeito! Vou te ajudar a emitir sua guia de INSS<br/>
                  Confirme os dados:<br/><br/>
                  💰 Valor que você quer contribuir?<br/>
                  💰 Valor: R$ 1.510,00 - Um salário mínimo<br/>
                  💰 Valor: Outro valor acima do salário mínimo? <br/>
                  💰 digite o valor: <br/><br/>
                  🏢 Cliente: 1.800,00<br/><br/>
                  🤖 Qual tipo de autono você pegar pagar?<br/><br/>
                  1. Trabalhador Autônomo (8% INSS)<br/>
                  2. Contribuinte Individual (20% INSS)<br/>  
                  3. Facultativo (11% INSS)<br/>
                  4. MEI (5% INSS)<br/>
                  5. Outro<br/>  
                  
                </span>
              </div>
              <div style={styles.chatMessage}>
                <span style={styles.userMessage}>1</span>
              </div>
              <div style={styles.chatMessage}>
                <span style={styles.botMessage}>
                  ✅ Guia de GPS (INSS) emitida com sucesso!<br/>
                  📊 Número: 2024001<br/>
                  📧 PDF Guia GP (INSS) - clique para baixar<br/>
                  💻 Disponível no seu dashboard
                </span>
              </div>
            </div>
          </div>
          <div style={styles.demoImage}>
            <img
              src={gps}
              alt="WhatsApp no celular"
              style={styles.phoneImage}
            />
          </div>
        </div>


      </section>

      {/* Recursos */}
      <section style={styles.features}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Tudo que você precisa para sua gestão fiscal</h2>
          <p style={styles.sectionSubtitle}>
            Recursos pensados especificamente para MEIs e autônomos brasileiros.
          </p>
        </div>

        <div style={styles.featureGrid}>
          <FeatureCard styles={styles}
            icon="📊"
            title="Emissão de NFS-e"
            description="Notas fiscais de serviço eletrônicas válidas em todo território nacional, integradas aos sistemas municipais."
          />
          <FeatureCard styles={styles}
            icon="🏛️"
            title="Guias de INSS (GPS)"
            description="Gere suas guias de previdência social automaticamente com os valores corretos e datas de vencimento."
          />
          <FeatureCard styles={styles}
            icon="🤖"
            title="IA no WhatsApp"
            description="Atendimento inteligente 24/7 que entende suas necessidades e executa tarefas fiscais automaticamente."
          />
          <FeatureCard styles={styles}
            icon="🔍"
            title="Busca automática CNPJ"
            description="Integração com a Receita Federal para buscar automaticamente os dados da sua empresa."
          />
          <FeatureCard styles={styles}
            icon="🔒"
            title="Segurança e LGPD"
            description="Todos os dados são criptografados e tratados conforme a Lei Geral de Proteção de Dados."
          />
          <FeatureCard styles={styles}
            icon="📈"
            title="Dashboard completo"
            description="Acompanhe todas as suas emissões, histórico de pagamentos e relatórios fiscais em um só lugar."
          />
        </div>
      </section>

      {/* Preços */}
      <section id="precos" style={styles.pricing}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Preço justo e transparente</h2>
          <p style={styles.sectionSubtitle}>
            Sem mensalidades. Pague o que usar.
          </p>
        </div>

        <div style={styles.pricingCards}>
          <div style={styles.pricingCard}>
            <div style={styles.pricingHeader}>
              <h3 style={styles.pricingTitle}>MEI Individual</h3>
              <div style={styles.pricingPrice}>
                <span style={styles.priceValue}>Taxa de adesão R$ 150,00</span>
                <span style={styles.priceLabel}>Taxa anual, paga uma vez por ano</span>
              </div>
            </div>
            <ul style={styles.pricingFeatures}>
              <li>✅ Emissão ilimitada de NFS-e</li>
              <li>✅ Geração de guias GPS</li>
              <li>✅ Atendimento IA no WhatsApp</li>
              <li>✅ Dashboard pessoal</li>
              <li>✅ Suporte por email</li>
              <li>✅ Conformidade LGPD</li>
            </ul>
            <Link to="/cadastro" style={styles.pricingButton}>Começar agora</Link>
          </div>

          <div style={styles.pricingCardPartner}>
            
            <div style={styles.pricingHeader}>
              <h3 style={styles.pricingTitle}>Contabilidade Parceira</h3>
              <div style={styles.pricingPrice}>
                <span style={styles.priceValue}>Comissões</span>
                <span style={styles.priceLabel}>Por cliente ativado</span>
              </div>
            </div>
            <ul style={styles.pricingFeatures}>
              <li>✅ Tudo do plano MEI Individual</li>
              <li>✅ Dashboard de gestão de clientes</li>
              <li>✅ Relatórios de comissões</li>
              <li>✅ White label (sua marca)</li>
              <li>✅ Suporte prioritário</li>
              <li>✅ Material de divulgação</li>
            </ul>
            <Link to="/cadastro/parceiro" style={styles.pricingButtonPartner}>Ser parceiro</Link>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section style={styles.testimonials}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>MEIs que já simplificaram sua vida fiscal</h2>
        </div>

        <div style={styles.testimonialsGrid}>
          <Testimonial styles={styles}
            quote="Antes eu perdia horas tentando entender como emitir nota fiscal. Agora é só mandar uma mensagem no WhatsApp!"
            author="Carlos Silva"
            role="Eletricista Autônomo"
            avatar={imgtes02}
          />
          <Testimonial styles={styles}
            quote="Como contadora, ofereço o GuiasMei para meus clientes MEI. Eles adoram a praticidade e eu ganho comissão!"
            author="Ana Oliveira"
            role="Contadora Parceira"
            avatar={imgtes01}
          />
          <Testimonial styles={styles}
            quote="Emitir GPS nunca foi tão fácil. A IA calcula tudo certinho e eu só confirmo. Economizo tempo e evito erros."
            author="Roberta Santos"
            role="Consultora de Marketing"
            avatar={imgtes03}
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={styles.faq}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Dúvidas frequentes</h2>
        </div>
        <div style={styles.faqList}>
          <details style={styles.faqItem}>
            <summary style={styles.faqSummary}>Como funciona a taxa única de R$ 150?</summary>
            <p style={styles.faqAnswer}>Você paga R$ 150 uma única vez por ano pode usar o sistema sem mensalida, se emitir nota paga  R$ 3,00 por nota fiscal e  6% sobre a valor da Guia de GPS (INSS).</p>
          </details>
          
          <details style={styles.faqItem}>
            <summary style={styles.faqSummary}>As notas fiscais são válidas legalmente?</summary>
            <p style={styles.faqAnswer}>Sim! Utilizamos o sistema oficial do Emissor Nacional de NFS-e, garantindo que todas as notas sejam válidas e aceitas pelos órgãos competentes.</p>
          </details>
          <details style={styles.faqItem}>
            <summary style={styles.faqSummary}>Preciso ter conhecimento técnico para usar?</summary>
            <p style={styles.faqAnswer}>Não! Nossa IA foi desenvolvida para ser super simples. Você só precisa saber usar o WhatsApp e nossa IA te guia em tudo.</p>
          </details>
          <details style={styles.faqItem}>
            <summary style={styles.faqSummary}>Meus dados estão seguros?</summary>
            <p style={styles.faqAnswer}>Sim. Todos os dados são criptografados e seguimos rigorosamente a LGPD. Seus dados pessoais e fiscais estão totalmente protegidos.</p>
          </details>
          <details style={styles.faqItem}>
            <summary style={styles.faqSummary}>Como funciona para contabilidades parceiras?</summary>
            <p style={styles.faqAnswer}>Contabilidades podem se cadastrar como parceiras, oferecer o serviço aos clientes MEI e receber comissões por cada cliente ativado.</p>
          </details>
        </div>
      </section>

      {/* CTA Final */}
      <section style={styles.finalCta}>
        <div style={styles.finalCtaInner}>
          <h3 style={styles.finalCtaTitle}>Pronto para simplificar a emissão de nota fiscal ou guia de GPS(INSS)</h3>
          <p style={styles.finalCtaDesc}>
            Cadastre-se agora e comece a emitir suas notas ou sua guia de GPS (INSS) pelo WhatsApp em poucos minutos.
          </p>
          <div style={styles.finalCtaActions}>
            <Link to="/cadastro/parceiro" style={styles.ctaPrimary}>Cadastre-se</Link>
            <a href="https://wa.me/5511999999999" style={styles.whatsappButton} target="_blank" rel="noopener noreferrer">
              💬 Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <img src={logo} alt="Rebelo App Logo" style={styles.logoSmall} />
            <p style={styles.footerText}>
              Gestão fiscal automatizada para MEIs e autônomos brasileiros.
            </p>
          </div>
          <div style={styles.footerCols}>
            <div style={styles.footerCol}>
              <h4 style={styles.footerHeading}>Produto</h4>
              <a href="#como-funciona" style={styles.footerLink}>Como funciona</a>
              <a href="#precos" style={styles.footerLink}>Preços</a>
              <Link to="/dashboard" style={styles.footerLink}>Dashboard</Link>
            </div>
            <div style={styles.footerCol}>
              <h4 style={styles.footerHeading}>Suporte</h4>
              <a href="#faq" style={styles.footerLink}>FAQ</a>
              <a href="mailto:suporte@rebeloapp.com" style={styles.footerLink}>Email</a>
              <a href="https://wa.me/5511999999999" style={styles.footerLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
            <div style={styles.footerCol}>
              <h4 style={styles.footerHeading}>Legal</h4>
              <Link to="/politica-privacidade" style={styles.footerLink}>Privacidade</Link>
              <Link to="/termos" style={styles.footerLink}>Termos de Uso</Link>
              <Link to="/lgpd" style={styles.footerLink}>LGPD</Link>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Rebelo App. Todos os direitos reservados. CNPJ: 00.000.000/0001-00</p>
        </div>
      </footer>
    </div>
  );
};

/* ==== Subcomponentes ==== */
const TargetCard = ({ icon, title, description, styles }) => (
  <div style={styles.targetCard}>
    <div style={styles.targetIcon}>{icon}</div>
    <h3 style={styles.targetTitle}>{title}</h3>
    <p style={styles.targetDesc}>{description}</p>
  </div>
);

const StepCard = ({ number, title, description, image, styles }) => (
  <div style={styles.stepCard}>
    <div style={styles.stepNumber}>{number}</div>
    <img src={image} alt={title} style={styles.stepImage} />
    <h3 style={styles.stepTitle}>{title}</h3>
    <p style={styles.stepDesc}>{description}</p>
  </div>
);

const FeatureCard = ({ icon, title, description, styles }) => (
  <div style={styles.featureCard}>
    <div style={styles.featureIcon}>{icon}</div>
    <h3 style={styles.featureTitle}>{title}</h3>
    <p style={styles.featureDesc}>{description}</p>
  </div>
);

const Testimonial = ({ quote, author, role, avatar, styles }) => (
  <blockquote style={styles.testimonial}>
    <p style={styles.testimonialQuote}>"{quote}"</p>
    <div style={styles.testimonialMeta}>
      <img src={avatar} alt={`Foto de ${author}`} style={styles.testimonialAvatar} />
      <div>
        <div style={styles.testimonialAuthor}>{author}</div>
        <div style={styles.testimonialRole}>{role}</div>
      </div>
    </div>
  </blockquote>
);

/* ==== Estilos ==== */
const baseStyles = {
  container: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    lineHeight: 1.6,
  },
  containerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
  },

  hero: {
    display: 'flex', // ESSENCIAL: Garante que os itens internos fiquem lado a lado
    justifyContent: 'center', // Centraliza os itens (imagens e conteúdo) horizontalmente
    alignItems: 'center', // Alinha os itens verticalmente ao centro
    padding: '80px 20px', // Espaçamento interno da seção
    gap: '40px', // Espaço entre os itens (imagens e conteúdo)
    minHeight: '80vh', // Garante que a seção ocupe pelo menos 80% da altura da viewport
    backgroundColor: '#F8FBF8', // Cor de fundo suave
    position: 'relative', // Importante para posicionar elementos filhos de forma absoluta se necessário
    overflow: 'hidden', // Esconde qualquer conteúdo que possa vazar
  },

  heroContent: {
    flex: '1', // Permite que o bloco de conteúdo cresça e ocupe o espaço disponível
    maxWidth: '700px', // Limita a largura do texto central
    textAlign: 'center', // Centraliza o texto dentro do bloco
    zIndex: '10', // Garante que o conteúdo fique sobre as imagens se houver sobreposição
  },

  heroTitle: {
    fontSize: '3em',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '20px',
    lineHeight: '1.2',
  },

  heroSubtitle: {
    fontSize: '1.2em',
    color: '#555',
    marginBottom: '30px',
  },

  badge: {
    backgroundColor: '#e6ffe6',
    color: '#28a745',
    padding: '8px 15px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.9em',
    marginBottom: '20px',
    display: 'inline-block', // Para que o padding funcione corretamente
  },

  heroActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '40px',
  },

  ctaPrimary: {
    backgroundColor: '#0baa77',
    color: 'white',
    padding: '15px 30px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.1em',
    transition: 'background-color 0.3s ease',
  },

  ctaPrimaryHover: { // Adicione um hover se quiser
    backgroundColor: '#218838',
  },

  ctaSecondary: {
    backgroundColor: 'transparent',
    color: '#28a745',
    padding: '15px 30px',
    borderRadius: '8px',
    border: '2px solid #28a745',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.1em',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },

  ctaSecondaryHover: { // Adicione um hover se quiser
    backgroundColor: '#28a745',
    color: 'white',
  },

  heroProof: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    flexWrap: 'wrap', // Permite que os itens quebrem linha em telas menores
  },

  proofItem: {
    textAlign: 'center',
  },

  proofNumber: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    color: '#2c3e50',
    display: 'block',
  },

  proofLabel: {
    fontSize: '0.9em',
    color: '#777',
  },

  // NOVOS ESTILOS PARA AS IMAGENS
  heroImageLeft: {
    width: 'auto', // Largura automática
    height: 'auto', // Altura automática
    maxHeight: '450px', // Limita a altura máxima
    maxWidth: '25%', // Para telas muito largas, não deixa a imagem ficar gigante
    objectFit: 'contain', // Garante que a imagem se ajuste sem cortar
    // Posicionamento absoluto para que elas não afetem o layout do conteúdo central
    position: 'absolute',
    left: '50px', // Distância da borda esquerda
    bottom: '150px', // Alinhe a imagem inferior
    top: 'auto', // Garante que não tenha top
    transform: 'translateY(1%)', // Ajuste a posição vertical
    zIndex: '5', // Fica por baixo do conteúdo principal
  },
  heroImageRight: {
    width: 'auto',
    height: 'auto',
    maxHeight: '400px',
    maxWidth: '25%',
    objectFit: 'contain',
    position: 'absolute',
    right: '50px', // Distância da borda direita
    top: '50px', // Alinhe a imagem superior
    bottom: 'auto', // Garante que não tenha bottom
    transform: 'translateY(-10%)', // Ajuste a posição vertical
    zIndex: '5',
  },

  // Estilos responsivos (muito importante!)
  '@media (maxWidth: 1024px)': {
    heroImageLeft: {
      left: '20px',
      maxWidth: '20%',
      maxHeight: '350px',
    },
    heroImageRight: {
      right: '20px',
      maxWidth: '20%',
      maxHeight: '350px',
    },
    heroTitle: {
      fontSize: '2.5em',
    },
  },

  '@media (maxWidth: 768px)': {
    hero: {
      flexDirection: 'column', // Empilha o conteúdo em telas menores
      padding: '40px 15px',
      gap: '20px',
      minHeight: 'auto', // Remove altura mínima em mobile
    },
    heroImageLeft: {
      position: 'relative', // Torna relativa novamente para seguir o fluxo
      left: 'auto',
      bottom: 'auto',
      transform: 'none',
      maxWidth: '60%', // Aumenta um pouco para ser visível
      marginBottom: '20px',
    },
    heroImageRight: {
      position: 'relative',
      right: 'auto',
      top: 'auto',
      transform: 'none',
      maxWidth: '60%',
      marginTop: '20px',
    },
    heroContent: {
      maxWidth: '100%',
    },
    heroTitle: {
      fontSize: '2em',
    },
    heroSubtitle: {
      fontSize: '1em',
    },
    heroActions: {
      flexDirection: 'column', // Empilha os botões
    },
  },


  /* Header */
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #E5E7EB',
  },
  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    height: 36,
    width: 36,
    borderRadius: 8,
  },
  brandName: {
    fontWeight: 700,
    fontSize: 40,
    color: '#1F2937',
  },
  nav: {
    display: 'flex',
    gap: 24,
    alignItems: 'center',
  },
  navLink: {
    color: '#000000',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
    transition: 'color 0.2s ease',
  },
  headerCtas: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  loginLink: {
    color: '#6B7280',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
  },
  adminButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 18px',
    borderRadius: 10,
    border: '1px solid #1F2937',
    color: '#1F2937',
    textDecoration: 'none',
    fontWeight: 600,
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    width: 'auto',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: '#FFFFFF',
    padding: '12px 20px',
    borderRadius: 10,
    fontWeight: 600,
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },

   /* Target */
  target: {
    padding: '80px 0',
  },
  sectionTitle: {
    fontSize: 36,
    margin: '0 0 16px',
    color: '#1F2937',
    fontWeight: 700,
    textAlign: 'center',
  },
  sectionSubtitle: {
    color: '#6B7280',
    fontSize: 18,
    textAlign: 'center',
    maxWidth: 600,
    margin: '0 auto',
  },
  sectionHeader: {
    marginBottom: 48,
  },
  targetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
    marginTop: 48,
  },
  targetCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 16,
    padding: 32,
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  targetIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  targetTitle: {
    margin: '0 0 12px',
    fontSize: 20,
    fontWeight: 600,
    color: '#1F2937',
  },
  targetDesc: {
    margin: 0,
    color: '#6B7280',
    lineHeight: 1.6,
  },

  /* How it works */
  howItWorks: {
    padding: '80px 24px',
    background: '#F9FAFB',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 32,
    marginTop: 48,
    maxWidth: 1200,
    margin: '48px auto 0',
  },
  stepCard: {
    background: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    textAlign: 'center',
    border: '1px solid #E5E7EB',
    position: 'relative',
  },
  stepNumber: {
    position: 'absolute',
    top: -16,
    left: 24,
    background: '#10B981',
    color: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 16,
  },
  stepImage: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    borderRadius: 12,
    marginBottom: 20,
  },
  stepTitle: {
    margin: '0 0 12px',
    fontSize: 20,
    fontWeight: 600,
    color: '#1F2937',
  },
  stepDesc: {
    margin: 0,
    color: '#6B7280',
    lineHeight: 1.6,
  },

  /* WhatsApp Demo */
  whatsappDemo: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 48,
    alignItems: 'center',
    marginTop: 64,
    maxWidth: 1200,
    margin: '64px auto 0',
  },
  demoContent: {},
  demoTitle: {
    fontSize: 24,
    margin: '0 0 24px',
    color: '#1F2937',
    fontWeight: 600,
  },
  chatDemo: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 16,
    padding: 20,
    maxHeight: 400,
    overflowY: 'auto',
  },
  chatMessage: {
    marginBottom: 16,
  },
  userMessage: {
    display: 'inline-block',
    background: '#10B981',
    color: '#FFFFFF',
    padding: '12px 16px',
    borderRadius: '18px 18px 4px 18px',
    maxWidth: '80%',
    marginLeft: 'auto',
    textAlign: 'right',
  },
  botMessage: {
    display: 'inline-block',
    background: '#F3F4F6',
    color: '#1F2937',
    padding: '12px 16px',
    borderRadius: '18px 18px 18px 4px',
    maxWidth: '80%',
    lineHeight: 1.5,
  },
  demoImage: {},
  phoneImage: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 20,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  },

  /* Features */
  features: {
    padding: '80px 24px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 24,
    marginTop: 48,
  },
  featureCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 16,
    padding: 32,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  featureTitle: {
    margin: '0 0 12px',
    fontSize: 20,
    fontWeight: 600,
    color: '#1F2937',
  },
  featureDesc: {
    margin: 0,
    color: '#6B7280',
    lineHeight: 1.6,
  },

  /* Pricing */
  pricing: {
    padding: '80px 24px',
    background: '#F9FAFB',
  },
  pricingCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 32,
    maxWidth: 800,
    margin: '48px auto 0',
  },
  pricingCard: {
    background: '#FFFFFF',
    border: '2px solid #10B981',
    borderRadius: 16,
    padding: 32,
    textAlign: 'center',
  },
  pricingCardPartner: {
    background: '#FFFFFF',
    border: '2px solid #10B981',
    borderRadius: 16,
    padding: 32,
    textAlign: 'center',
    position: 'relative',
  },
  partnerBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#10B981',
    color: '#FFFFFF',
    padding: '6px 16px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },
  pricingHeader: {
    marginBottom: 24,
  },
  pricingTitle: {
    fontSize: 24,
    margin: '0 0 16px',
    fontWeight: 600,
    color: '#1F2937',
  },
  pricingPrice: {
    marginBottom: 24,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: 800,
    color: '#10B981',
    display: 'block',
  },
  priceLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  pricingFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 32px',
    textAlign: 'left',
  },
  pricingButton: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: '#FFFFFF',
    padding: '16px 24px',
    borderRadius: 12,
    fontWeight: 600,
    textDecoration: 'none',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    marginLeft: '-8px',
  },
  pricingButtonPartner: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: '#FFFFFF',
    padding: '16px 24px',
    borderRadius: 12,
    fontWeight: 600,
    textDecoration: 'none',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
    width: '90%', // botão só do tamanho do texto
    marginTop: 53,
    marginLeft: '-8px',
  },

  /* Testimonials */
  testimonials: {
    padding: '80px 24px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  testimonialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 24,
    marginTop: 48,
  },
  testimonial: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  testimonialQuote: {
    margin: '0 0 20px',
    color: '#374151',
    fontSize: 16,
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  testimonialMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  testimonialAvatar: {
    height: 48,
    width: 48,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  testimonialAuthor: {
    fontWeight: 600,
    color: '#1F2937',
    fontSize: 15,
  },
  testimonialRole: {
    color: '#6B7280',
    fontSize: 14,
  },

  /* FAQ */
  faq: {
    padding: '80px 24px',
    background: '#F9FAFB',
    maxWidth: 1000,
    margin: '0 auto',
  },
  faqList: {
    marginTop: 48,
    display: 'grid',
    gap: 16,
  },
  faqItem: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 20,
  },
  faqSummary: {
    cursor: 'pointer',
    color: '#1F2937',
    fontWeight: 600,
    fontSize: 16,
    outline: 'none',
  },
  faqAnswer: {
    color: '#6B7280',
    marginTop: 12,
    lineHeight: 1.6,
  },

  /* Final CTA */
  finalCta: {
    padding: '80px 24px',
    background: 'linear-gradient(135deg, #3c46d7)',
  },
  finalCtaInner: {
    maxWidth: 800,
    margin: '0 auto',
    textAlign: 'center',
  },
  finalCtaTitle: {
    fontSize: 36,
    margin: '0 0 16px',
    color: '#FFFFFF',
    fontWeight: 700,
  },
  finalCtaDesc: {
    fontSize: 18,
    color: '#D1FAE5',
    margin: '0 0 32px',
    lineHeight: 1.6,
  },
  finalCtaActions: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappButton: {
    background: '#0eb17c',
    color: '#FFFFFF',
    padding: '16px 24px',
    borderRadius: 12,
    fontWeight: 600,
    textDecoration: 'none',
    fontSize: 16,
    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
  },

  /* Footer */
  footer: {
    borderTop: '1px solid #E5E7EB',
    background: '#F9FAFB',
  },
  footerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '48px 24px 24px',
    display: 'grid',
    gridTemplateColumns: '1.5fr 2fr',
    gap: 48,
  },
  footerBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  logoSmall: {
    height: 32,
    width: 32,
    borderRadius: 8,
  },
  footerText: {
    color: '#6B7280',
    margin: 0,
    lineHeight: 1.6,
  },
  footerCols: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  footerHeading: {
    color: '#1F2937',
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
  },
  footerLink: {
    color: '#6B7280',
    textDecoration: 'none',
    fontSize: 14,
    transition: 'color 0.2s ease',
  },
  footerBottom: {
    textAlign: 'center',
    padding: '24px',
    color: '#9CA3AF',
    fontSize: 14,
    borderTop: '1px solid #E5E7EB',
  },

  
};

const getStyles = (isMobile) => ({
  ...baseStyles,
  container: {
    ...baseStyles.container,
    padding: isMobile ? '0 0 80px' : baseStyles.container.padding,
  },
  headerInner: {
    ...baseStyles.headerInner,
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'center' : baseStyles.headerInner.alignItems,
    gap: isMobile ? 16 : undefined,
  },
  nav: {
    ...baseStyles.nav,
    flexWrap: isMobile ? 'wrap' : baseStyles.nav.flexWrap,
    justifyContent: isMobile ? 'center' : 'flex-start',
    width: isMobile ? '100%' : 'auto',
    marginTop: isMobile ? 12 : 0,
    gap: isMobile ? 16 : baseStyles.nav.gap,
  },
  headerCtas: {
    ...baseStyles.headerCtas,
    marginTop: isMobile ? 16 : 0,
    width: isMobile ? '100%' : 'auto',
    justifyContent: isMobile ? 'center' : 'flex-end',
  },
  hero: {
    ...baseStyles.hero,
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 24 : baseStyles.hero.gap,
    padding: isMobile ? '60px 16px' : baseStyles.hero.padding,
    minHeight: isMobile ? 'auto' : baseStyles.hero.minHeight,
    textAlign: isMobile ? 'center' : 'left',
  },
  heroContent: {
    ...baseStyles.heroContent,
    alignItems: isMobile ? 'center' : baseStyles.heroContent.alignItems,
    maxWidth: isMobile ? '100%' : baseStyles.heroContent.maxWidth,
    textAlign: isMobile ? 'center' : baseStyles.heroContent.textAlign,
  },
  heroActions: {
    ...baseStyles.heroActions,
    flexDirection: isMobile ? 'column' : 'row',
    width: isMobile ? '100%' : 'auto',
    alignItems: isMobile ? 'stretch' : 'center',
    gap: isMobile ? 12 : baseStyles.heroActions.gap,
  },
  heroTitle: {
    ...baseStyles.heroTitle,
    fontSize: isMobile ? '2.2em' : baseStyles.heroTitle.fontSize,
  },
  heroSubtitle: {
    ...baseStyles.heroSubtitle,
    fontSize: isMobile ? '1.05em' : baseStyles.heroSubtitle.fontSize,
  },
  heroProof: {
    ...baseStyles.heroProof,
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
  },
  brandName: {
    ...baseStyles.brandName,
    fontSize: isMobile ? 28 : baseStyles.brandName.fontSize,
  },
  heroImageLeft: {
    ...baseStyles.heroImageLeft,
    position: isMobile ? 'relative' : baseStyles.heroImageLeft.position,
    left: isMobile ? 'auto' : baseStyles.heroImageLeft.left,
    bottom: isMobile ? 'auto' : baseStyles.heroImageLeft.bottom,
    transform: isMobile ? 'none' : baseStyles.heroImageLeft.transform,
    maxWidth: isMobile ? '70%' : baseStyles.heroImageLeft.maxWidth,
    marginBottom: isMobile ? 20 : baseStyles.heroImageLeft.marginBottom,
    display: isMobile ? 'block' : baseStyles.heroImageLeft.display,
    alignSelf: isMobile ? 'center' : baseStyles.heroImageLeft.alignSelf,
  },
  heroImageRight: {
    ...baseStyles.heroImageRight,
    position: isMobile ? 'relative' : baseStyles.heroImageRight.position,
    right: isMobile ? 'auto' : baseStyles.heroImageRight.right,
    top: isMobile ? 'auto' : baseStyles.heroImageRight.top,
    transform: isMobile ? 'none' : baseStyles.heroImageRight.transform,
    maxWidth: isMobile ? '70%' : baseStyles.heroImageRight.maxWidth,
    marginTop: isMobile ? 20 : baseStyles.heroImageRight.marginTop,
    display: isMobile ? 'block' : baseStyles.heroImageRight.display,
    alignSelf: isMobile ? 'center' : baseStyles.heroImageRight.alignSelf,
  },
  adminButton: {
    ...baseStyles.adminButton,
    width: isMobile ? '100%' : baseStyles.adminButton.width,
    textAlign: 'center',
  },
  primaryButton: {
    ...baseStyles.primaryButton,
    width: isMobile ? '100%' : baseStyles.primaryButton.width,
    textAlign: 'center',
  },
  ctaPrimary: {
    ...baseStyles.ctaPrimary,
    display: 'inline-block',
    textAlign: 'center',
    width: isMobile ? '100%' : 'auto',
  },
  target: {
    ...baseStyles.target,
    padding: isMobile ? '60px 16px' : baseStyles.target.padding,
  },
  targetGrid: {
    ...baseStyles.targetGrid,
    gridTemplateColumns: isMobile ? '1fr' : baseStyles.targetGrid.gridTemplateColumns,
    gap: isMobile ? 16 : baseStyles.targetGrid.gap,
  },
  howItWorks: {
    ...baseStyles.howItWorks,
    padding: isMobile ? '60px 16px' : baseStyles.howItWorks.padding,
  },
  stepsGrid: {
    ...baseStyles.stepsGrid,
    gridTemplateColumns: isMobile ? '1fr' : baseStyles.stepsGrid.gridTemplateColumns,
    gap: isMobile ? 16 : baseStyles.stepsGrid.gap,
  },
  featureGrid: {
    ...baseStyles.featureGrid,
    gridTemplateColumns: isMobile ? '1fr' : baseStyles.featureGrid.gridTemplateColumns,
  },
  whatsappDemo: {
    ...baseStyles.whatsappDemo,
    gridTemplateColumns: isMobile ? '1fr' : baseStyles.whatsappDemo.gridTemplateColumns,
  },
  pricingCards: {
    ...baseStyles.pricingCards,
    gridTemplateColumns: isMobile ? '1fr' : baseStyles.pricingCards.gridTemplateColumns,
  },
  testimonialsGrid: {
    ...baseStyles.testimonialsGrid,
    gridTemplateColumns: isMobile ? '1fr' : baseStyles.testimonialsGrid.gridTemplateColumns,
  },
  finalCta: {
    ...baseStyles.finalCta,
    padding: isMobile ? '60px 16px' : baseStyles.finalCta.padding,
  },
  finalCtaActions: {
    ...baseStyles.finalCtaActions,
    flexDirection: isMobile ? 'column' : baseStyles.finalCtaActions.flexDirection,
    gap: isMobile ? 12 : baseStyles.finalCtaActions.gap,
  },
  footerInner: {
    ...baseStyles.footerInner,
    gridTemplateColumns: isMobile ? '1fr' : baseStyles.footerInner.gridTemplateColumns,
    gap: isMobile ? 32 : baseStyles.footerInner.gap,
  },
  footerCols: {
    ...baseStyles.footerCols,
    gridTemplateColumns: isMobile ? '1fr' : baseStyles.footerCols.gridTemplateColumns,
    gap: isMobile ? 16 : baseStyles.footerCols.gap,
  },
});

export default HomePage;

