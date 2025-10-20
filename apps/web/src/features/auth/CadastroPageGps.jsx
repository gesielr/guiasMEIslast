import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { validateCPF } from "../../utils/validators.js";
import { encryptData } from "../../utils/encryption.js";
import logo from "../../assets/logo.png";
import { useAuth } from "../../providers/auth-provider.jsx";

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
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "5548991117268";

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
      
      const encryptedDocument = await encryptData(formData.document);
      const encryptedPis = formData.pis ? await encryptData(formData.pis) : undefined;
      const referralCode = searchParams.get("ref") ?? undefined;
      
      const response = await register({
        role: "autonomo",
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        document: encryptedDocument,
        pis: encryptedPis,
        referralCode,
         });

        const whatsappLink = response?.whatsappLink
        ?? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Quero gerar minha guia GuiasMEI")}`;
         window.location.href = whatsappLink;

        setLoading(false);
        window.location.href = whatsappLink;
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
              <label style={styles.label}>PIS (opcional)</label>
              <input
                type="text"
                value={safeFormData.pis}
                onChange={(event) => setFormData({ ...formData, pis: event.target.value.replace(/\D/g, "") })}
                placeholder="000.0000.000-0"
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
                placeholder="11999999999"
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

            <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Enviando..." : "Concluir cadastro"}
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
    fontFamily: '"Inter", sans-serif',
    background: "linear-gradient(135deg, #f1f5ff 0%, #f8fbff 100%)",
    alignItems: "center",
  },
  formSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    maxWidth: "520px",
    width: "100%",
    backgroundColor: "#fff",
    padding: "48px",
    borderRadius: "24px",
    boxShadow: "0 28px 60px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
   logoWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
  },
  logoBadge: {
    width: "72px",
    height: "72px",
    borderRadius: "18px",
    background: "#e7f1ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "48px",
    height: "48px",
    objectFit: "contain",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "12px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  label: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#334155",
    marginBottom: "6px",
    display: "block",
    },
  input: {
    width: "100%",
    padding: "14px",
    border: "1px solid #d5dbea",
    borderRadius: "12px",
    fontSize: "16px",
    color: "#1f2937",
    outline: "none",
  },
  consentContainer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  checkbox: {
    marginTop: "4px",
  },
  consentLabel: {
     fontSize: "14px",
    color: "#475569",
    lineHeight: 1.5,
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },
  submitButton: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#475569",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },
  backIcon: {
    fontSize: "18px",
  },
};

export default CadastroPage;





