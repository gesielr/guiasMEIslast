import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client.js";
import { validateCPF } from "../../utils/validators.js";
import { encryptData } from "../../utils/encryption.js";
import logo from "../../assets/logo.png";

const CadastroPage = () => {
  const [formData, setFormData] = useState({
    document: "",
    pis: "",
    email: "",
    phone: "",
    name: "",
    password: "",
  });

  const safeFormData = {
    document: formData.document || "",
    pis: formData.pis || "",
    email: formData.email || "",
    phone: formData.phone || "",
    name: formData.name || "",
    password: formData.password || "",
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const navigate = useNavigate();

  const handleDocumentChange = (event) => {
    const doc = event.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, document: doc }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateCPF(formData.document)) {
      setError("CPF inválido.");
      return;
    }
    if (!formData.email || !formData.phone || !formData.password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!consentGiven) {
      setError("É necessário aceitar a Política de Privacidade e Termos de Uso.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData?.user?.id) {
        throw new Error("Não foi possível obter o usuário criado.");
      }

      const encryptedDocument = await encryptData(formData.document);
      const encryptedPis = formData.pis ? await encryptData(formData.pis) : null;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        name: formData.name,
        document: encryptedDocument,
        pis: encryptedPis,
        user_type: "autonomo",
      }, { onConflict: "id", returning: "minimal" });

      if (profileError) throw profileError;

      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setError("Erro no cadastro: " + (err.message || "Erro desconhecido"));
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
              <img src={logo} alt="Logo GuiaMei" style={styles.logo} />
            </div>
            <h2 style={styles.title}>Crie sua Conta</h2>
            <p style={styles.subtitle}>Comece a simplificar sua vida fiscal hoje mesmo.</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label style={styles.label}>CPF</label>
              <input
                type="text"
                value={safeFormData.document}
                onChange={handleDocumentChange}
                placeholder="000.000.000-00"
                required
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Nome Completo</label>
              <input
                type="text"
                value={safeFormData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>E-mail</label>
              <input
                type="email"
                value={safeFormData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>WhatsApp (com DDD)</label>
              <input
                type="tel"
                value={safeFormData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                placeholder="Ex: 11999999999"
                required
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Senha</label>
              <input
                type="password"
                value={safeFormData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Número do PIS (Opcional)</label>
              <input
                type="text"
                value={safeFormData.pis}
                onChange={(event) => setFormData({ ...formData, pis: event.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.consentContainer}>
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(event) => setConsentGiven(event.target.checked)}
                style={styles.checkbox}
              />
              <label style={styles.consentLabel}>
                Eu li e aceito a <Link to="/politica-privacidade" style={styles.link}>Política de Privacidade</Link> e os Termos de Uso.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !consentGiven}
              style={{
                ...styles.submitButton,
                opacity: loading || !consentGiven ? 0.7 : 1,
              }}
            >
              {loading ? "Cadastrando..." : "Finalizar Cadastro"}
            </button>
          </form>
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
  formSection: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "16px",
  },
  formContainer: {
    maxWidth: "440px",
    width: "100%",
    backgroundColor: "#ffffff",
    padding: "40px 48px",
    borderRadius: "24px",
    boxShadow: "0 28px 60px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
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
  logoWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
  },
  logoBadge: {
    width: "88px",
    height: "88px",
    borderRadius: "26px",
    background: "linear-gradient(160deg, #ebf2ff 0%, #dbe8ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "52px",
    height: "52px",
    objectFit: "contain",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    margin: 0,
    fontSize: "15px",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  label: {
    fontWeight: "600",
    marginBottom: "6px",
    display: "block",
    fontSize: "14px",
    color: "#1e293b",
  },
  input: {
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #d5dbea",
    borderRadius: "10px",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#f9fbff",
  },
  submitButton: {
    padding: "14px",
    fontSize: "15px",
    fontWeight: "600",
    backgroundColor: "#3c6df0",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    marginTop: "8px",
    transition: "opacity 0.2s ease",
  },
  error: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    fontSize: "13px",
  },
  consentContainer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginTop: "4px",
  },
  checkbox: {
    marginTop: "4px",
  },
  consentLabel: {
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#475569",
  },
  link: {
    color: "#3c6df0",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default CadastroPage;




