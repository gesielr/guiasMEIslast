import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import logo from '../../assets/logo.png';
import { supabase } from '../../supabase/client';
import { encryptData } from '../../utils/encryption';
import { useNavigate } from 'react-router-dom';

export default function RegisterParceiro(){
  const [form, setForm] = useState({ document: '', crc: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offlineFallback, setOfflineFallback] = useState(false);
  const nav = useNavigate();

  const handleChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Preencha email e senha'); return; }
    setLoading(true);
    try {

      let userId = null;
      let didSignIn = false;
      try {
        const { data, error: signError } = await supabase.auth.signUp({ email: form.email, password: form.password });
        if (signError) {
          // Caso o Supabase responda com erro, iremos tentar fallback
          console.warn('signUp retornou erro:', signError.message || signError);
          setOfflineFallback(true);
        }
        userId = data?.user?.id;

        // Se o signUp ocorreu (usuario criado), tentamos login automático.
        if (userId) {
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
            if (signInError) {
                // Muitas vezes o erro acontece quando a conta precisa de verificação por e-mail.
                console.warn('signIn automático falhou:', signInError.message || signInError);
                // Se o projeto estiver em modo de teste, permitimos ignorar confirmação de e-mail
                if (process.env.REACT_APP_SKIP_EMAIL_CONFIRMATION === 'true') {
                  console.warn('REACT_APP_SKIP_EMAIL_CONFIRMATION=true: ignorando confirmação de e-mail em modo de teste.');
                  didSignIn = true;
                }
              } else {
              // Login bem sucedido
              didSignIn = !!signInData?.user;
              // Use o id do usuário autenticado se disponível
              userId = signInData?.user?.id || userId;
            }
            } catch (signinNetErr) {
            console.warn('Erro de rede ao tentar signIn após signUp:', signinNetErr && (signinNetErr.message || signinNetErr));
            // Não alterar didSignIn, manter fallback abaixo
            if (process.env.REACT_APP_SKIP_EMAIL_CONFIRMATION === 'true') {
              console.warn('REACT_APP_SKIP_EMAIL_CONFIRMATION=true: fallback para autenticação mock por modo de teste.');
              didSignIn = true;
            }
          }
        }

      } catch (networkErr) {
        // Erro de rede (ex: DNS não resolvido). Log e fallback para mock.
        console.warn('Falha ao conectar ao Supabase (signUp). Usando fallback mock. Detalhe:', networkErr && (networkErr.message || networkErr));
        setOfflineFallback(true);
      }

      if (!userId) {
        // fallback: gerar id mock
        userId = `mock_${Date.now()}`;
      }

      const encryptedDoc = form.document ? await encryptData(form.document) : null;

      // Tentar inserir em tabela 'partners' (se existir) ou 'profiles'
      if (supabase.from) {
        const table = supabase.from('partners');
        await table.upsert({ id: userId, cnpj: encryptedDoc, crc: form.crc, email: form.email, phone: form.phone, created_at: new Date().toISOString() });
      }

      // Se não foi possível autenticar (por exemplo, Supabase exige confirmação por e-mail),
      // avise o usuário e direcione para a tela de login para que possa confirmar/entrar.
      setLoading(false);
      if (didSignIn || offlineFallback) {
        nav('/dashboard-parceiro');
      } else {
        setError('Registro criado. Verifique seu e-mail para confirmar a conta antes de acessar o painel. Você será redirecionado para a tela de login.');
        // Pequena pausa para o usuário ver a mensagem, então redireciona ao login
        setTimeout(() => nav('/login'), 2200);
      }
    } catch (err) {
      setError('Erro ao cadastrar: ' + (err.message || err));
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={logo} alt="GuiasMEI Logo" style={styles.logo} />
        <h2 style={styles.title}>Cadastro Parceiro</h2>
        <p style={styles.subtitle}>Cadastre seu escritório de contabilidade para gerenciar clientes e comissões.</p>

        {error && <div style={styles.error}>{error}</div>}
  {offlineFallback && <div style={styles.warn}>Serviço de autenticação indisponível — cadastro concluído em modo de teste (mock).</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>CPF/CNPJ</label>
          <Input value={form.document} onChange={handleChange('document')} placeholder="CPF ou CNPJ" />

          <label style={styles.label}>Nº CRC</label>
          <Input value={form.crc} onChange={handleChange('crc')} placeholder="Número do CRC" />

          <label style={styles.label}>Email</label>
          <Input type="email" value={form.email} onChange={handleChange('email')} placeholder="contato@exemplo.com" />

          <label style={styles.label}>Telefone</label>
          <Input value={form.phone} onChange={handleChange('phone')} placeholder="11999999999" />

          <label style={styles.label}>Senha</label>
          <Input type="password" value={form.password} onChange={handleChange('password')} placeholder="Crie uma senha" />

          <div style={{marginTop:18}}>
            <Button type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar Parceiro'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f3f6fb', padding: 20, fontFamily: 'Inter, sans-serif' },
  card: { width: '100%', maxWidth: 520, background: '#fff', padding: 32, borderRadius: 14, boxShadow: '0 10px 30px rgba(2,6,23,0.08)', textAlign: 'left' },
  logo: { width: 72, height: 72, objectFit: 'contain', display: 'block', margin: '0 auto 16px' },
  title: { textAlign: 'center', margin: '8px 0 4px', fontSize: 22, color: '#0f172a' },
  subtitle: { textAlign: 'center', margin: '0 0 18px', color: '#475569', fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 14, color: '#334155', fontWeight: 600 },
  error: { background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 12 }
};
