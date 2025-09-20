// deno-lint-ignore-file
// src/pages/CadastroPage.jsx
import { useState } from 'react';
import { supabase } from '../supabase/client.js';
import { validateCPF, validateCNPJ } from '../utils/validators.js';
import { encryptData } from '../utils/encryption.js';

const CadastroPage = () => {
  const [userType, setUserType] = useState('mei');
  const [formData, setFormData] = useState({
    document: '',
    pis: '',
    email: '',
    phone: '',
    business_name: '',
    name: '',
    password: '', // novo campo
  });

  // Garantir que todos os campos do formData sejam string
  const safeFormData = {
    document: formData.document || '',
    pis: formData.pis || '',
    email: formData.email || '',
    phone: formData.phone || '',
    business_name: formData.business_name || '',
    name: formData.name || '',
    password: formData.password || '',
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const handleDocumentChange = async (e) => {
    const doc = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, document: doc }));

    if (userType === 'mei' && doc.length === 14) {
      setLoading(true);
      try {
  const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/fetch-cnpj?cnpj=${doc}`);
        const data = await response.json();
        // A API retorna 'nome' (razao social) e 'fantasia' (nome fantasia)
        if (data && (data.nome || data.fantasia)) {
          setFormData((prev) => ({
            ...prev,
            business_name: data.fantasia || data.nome || '',
            name: data.nome || '',
          }));
        } else {
          setError('CNPJ não encontrado ou inválido.');
        }
      } catch (_err) {
        setError('Erro ao buscar CNPJ.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userType === 'mei' && !validateCNPJ(formData.document)) {
      setError('CNPJ inválido.');
      return;
    }
    if (userType === 'autonomo' && !validateCPF(formData.document)) {
      setError('CPF inválido.');
      return;
    }
    if (!formData.email || !formData.phone || !formData.password) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!consentGiven) {
      setError('É necessário aceitar a Política de Privacidade e Termos de Uso.');
      return;
    }

    setLoading(true);
    try {
      console.log('Iniciando cadastro com dados:', { 
        email: formData.email, 
        userType, 
        hasPassword: !!formData.password 
      });
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      console.log('Resultado do signup:', { authData, authError });
      
      if (authError) {
        console.error('Erro no signup:', authError);
        throw authError;
      }

      const encryptedDocument = await encryptData(formData.document);
      const encryptedPis = formData.pis ? await encryptData(formData.pis) : null;

      console.log('Inserindo perfil no banco:', {
        id: authData.user.id,
        name: formData.name,
        user_type: userType,
        hasDocument: !!encryptedDocument,
        hasPis: !!encryptedPis
      });

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        name: formData.name,
        document: encryptedDocument,
        pis: encryptedPis,
        business_name: formData.business_name,
        user_type: userType,
      });

      console.log('Resultado da inserção do perfil:', { profileError });

      if (profileError) {
        console.error('Erro ao inserir perfil:', profileError);
        throw profileError;
      }

      const whatsappUrl = `https://wa.me/5548991117268?text=Olá!%20Sou%20novo%20usuário.%20Meu%20ID%20é:%20${authData.user.id}`;
      
      window.location.href = whatsappUrl;

    } catch (err) {
      console.error('Erro detalhado no cadastro:', err);
      setError('Erro no cadastro: ' + (err.message || 'Erro desconhecido'));
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Cadastro Rápido</h2>
      <div style={styles.toggle}>
        <button type="button"
          onClick={() => setUserType('mei')}
          style={userType === 'mei' ? { ...styles.toggleButton, ...styles.activeToggle } : styles.toggleButton}
        >
          MEI (CNPJ)
        </button>
        <button type="button"
          onClick={() => setUserType('autonomo')}
          style={userType === 'autonomo' ? { ...styles.toggleButton, ...styles.activeToggle } : styles.toggleButton}
        >
          Autônomo (CPF)
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

  <form onSubmit={handleSubmit} style={styles.form}>
        
        <div>
          <label>{userType === 'mei' ? 'CNPJ' : 'CPF'}</label>
          <input
            type="text"
            value={safeFormData.document}
            onChange={handleDocumentChange}
            placeholder={userType === 'mei' ? '00.000.000/0000-00' : '000.000.000-00'}
            required
            style={styles.input}
          />
          {loading && <span style={styles.loadingText}>Buscando dados...</span>}
        </div>

        {userType === 'mei' && (
          <div>
            <label>Razão Social</label>
            <input
              type="text"
              value={safeFormData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.input}
              disabled
            />
          </div>
        )}

        <div>
          <label>E-mail</label>
          <input
            type="email"
            value={safeFormData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={styles.input}
          />
        </div>

        <div>
          <label>WhatsApp (com DDD)</label>
          <input
            type="tel"
            value={safeFormData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Exemplo: 11999999999"
            required
            style={styles.input}
          />
        </div>

        <div>
          <label>Senha</label>
          <input
            type="password"
            value={safeFormData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
            style={styles.input}
          />
        </div>

        {userType === 'autonomo' && (
          <>
            <div>
              <label>Nome Completo</label>
              <input
                type="text"
                value={safeFormData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={styles.input}
              />
            </div>
            <div>
              <label>Número do PIS</label>
              <input
                type="text"
                value={safeFormData.pis}
                onChange={(e) => setFormData({ ...formData, pis: e.target.value })}
                placeholder="000.00000.00-0"
                style={styles.input}
              />
            </div>
          </>
        )}

        {/* Campos duplicados removidos: E-mail e WhatsApp */}
        
        <div style={styles.consentContainer}>
          <input
            type="checkbox"
            id="consent"
            required
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
          />
          <label htmlFor="consent" style={styles.consentLabel}>
            Li e aceito a{' '}
            <a
              href="/politica-privacidade"
              rel="noreferrer"
              style={styles.link}
            >
              Política de Privacidade
            </a>{' '}
            e os Termos de Uso.
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading || !consentGiven} 
          style={{
            ...styles.submitButton,
            opacity: (loading || !consentGiven) ? 0.6 : 1,
            cursor: (loading || !consentGiven) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  toggle: {
    display: 'flex',
    marginBottom: '20px',
    gap: '5px',
  },
  toggleButton: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
  },
  activeToggle: {
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box',
  },
  submitButton: {
    padding: '12px',
    fontSize: '18px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.2s',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #f5c6cb',
    marginBottom: '15px',
  },
  loadingText: {
    fontSize: '12px',
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: '5px',
    display: 'block',
  },
  consentContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginTop: '15px',
  },
  consentLabel: {
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#495057',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default CadastroPage;