import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { encryptData } from "../../utils/encryption";
import logo from "../../assets/logo.png";

const CadastroPageParceiro = () => {
  const [formData, setFormData] = useState({
    company_name: "",
    document: "",
    crc: "",
    email: "",
    phone: "",
    password: ""
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!consentGiven) {
      setError("É necessário aceitar os Termos e a Política de Privacidade.");
      return;
    }

    if (!formData.company_name || !formData.document || !formData.crc || !formData.email || !formData.password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: "partner",
            phone: formData.phone ?? null
          }
        }
      });

      if (authError) throw authError;
      if (!authData?.user?.id) {
        throw new Error("Não foi possível criar o usuário parceiro.");
      }

      const encryptedDocument = await encryptData(formData.document);

      const { error: partnerError } = await supabase.from("partners").upsert(
        {
          id: authData.user.id,
          company_name: formData.company_name,
          document: encryptedDocument,
          crc: formData.crc,
          email: formData.email,
          phone: formData.phone
        },
        { onConflict: "id", returning: "minimal" }
      );
      if (partnerError) throw partnerError;

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: authData.user.id,
          name: formData.company_name,
          document: encryptedDocument,
          user_type: "partner"
        },
        { onConflict: "id", returning: "minimal" }
      );
      if (profileError) throw profileError;

      navigate("/dashboard/parceiro");
    } catch (err) {
      setError(err.message ?? "Erro ao criar cadastro de parceiro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formSection}>
        <div style={styles.formContainer}>
          <Link to="/" style={styles.backLink}>
            <span style={styles.backIcon}>{"\u2190"}</span>
            <span>Voltar para a Home</span>
          </Link>
          <div style={styles.logoWrapper}>
            <div style={styles.logoBadge}>
              <img src={logo} alt="Logo GuiasMEI" style={styles.logo} />
            </div>
            <h2 style={styles.title}>Cadastro Parceiro Contábil</h2>
            <p style={styles.subtitle}>
              Informe os dados da sua contabilidade para oferecer os serviços GuiasMEI aos seus clientes.
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Nome da Contabilidade
              <input
                style={styles.input}
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Contabilidade ABC"
                required
              />
            </label>
            <label style={styles.label}>
              CPF/CNPJ
              <input
                style={styles.input}
                name="document"
                value={formData.document}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, document: event.target.value.replace(/\D/g, "") }))
                }
                placeholder="00.000.000/0000-00"
                required
              />
            </label>
            <label style={styles.label}>
              Número do CRC
              <input
                style={styles.input}
                name="crc"
                value={formData.crc}
                onChange={handleChange}
                placeholder="CRC-000000/UF"
                required
              />
            </label>
            <label style={styles.label}>
              E-mail
              <input
                style={styles.input}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contato@contabilidade.com"
                required
              />
            </label>
            <label style={styles.label}>
              Telefone (opcional)
              <input
                style={styles.input}
                name="phone"
                value={formData.phone}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, "") }))
                }
                placeholder="(00) 00000-0000"
              />
            </label>
            <label style={styles.label}>
              Senha
              <input
                style={styles.input}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Crie uma senha segura"
                required
              />
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(event) => setConsentGiven(event.target.checked)}
              />
              Concordo com a Política de Privacidade e Termos de Uso.
            </label>

            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? "Enviando..." : "Cadastrar parceiro"}
            </button>
          </form>

          <p style={styles.helperText}>
            Já possui conta? <Link to="/login" style={styles.link}>Acesse aqui</Link>
          </p>
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
    padding: "24px"
  },
  formSection: {
    maxWidth: "520px",
    width: "100%"
  },
  formContainer: {
    backgroundColor: "#ffffff",
    padding: "40px 48px",
    borderRadius: "24px",
    boxShadow: "0 28px 60px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  logoWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px"
  },
  logoBadge: {
    width: "72px",
    height: "72px",
    borderRadius: "18px",
    background: "#ecfdf3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    width: "40px"
  },
  title: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0
  },
  subtitle: {
    color: "#64748b",
    fontSize: "15px",
    margin: 0,
    lineHeight: 1.5
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 500
  },
  backIcon: {
    fontSize: "18px",
    lineHeight: 1
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
    color: "#1f2937",
    fontWeight: 500
  },
  input: {
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #d5dbea",
    fontSize: "15px",
    color: "#1f2937",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#475569"
  },
  submitButton: {
    marginTop: "8px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "none",
    background: "#0F9D58",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s"
  },
  helperText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#64748b"
  },
  link: {
    color: "#0F9D58",
    fontWeight: 600,
    textDecoration: "none"
  }
};

export default CadastroPageParceiro;
