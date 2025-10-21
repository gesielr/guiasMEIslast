import { useState } from "react";
import { useAuth } from "../../providers/auth-provider";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const fallbackAdminIdentifier =
  import.meta.env.VITE_ADMIN_USER ?? process.env.REACT_APP_ADMIN_USER ?? "";
const fallbackAdminPassword =
  import.meta.env.VITE_ADMIN_PASSWORD ?? process.env.REACT_APP_ADMIN_PASSWORD ?? "";
const hasFallbackAdmin = Boolean(fallbackAdminIdentifier && fallbackAdminPassword);

const isFallbackAdminMatch = (identifier, password) =>
  hasFallbackAdmin &&
  identifier === fallbackAdminIdentifier &&
  password === fallbackAdminPassword;

const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isFallbackAdminMatch(identifier, password)) {
        navigate("/dashboard/admin");
        return;
      }

      const result = await login(identifier, password);
      const userType =
        result?.profile?.user_type ??
        result?.user?.user_metadata?.role ??
        result?.profile?.role;

      if (userType === "admin" || isFallbackAdminMatch(identifier, password)) {
        navigate("/dashboard/admin");
        return;
      }
      setError("Acesso permitido apenas para administradores.");
    } catch (err) {
      setError(err.message || "Erro ao realizar login de administrador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formContainer}>
        <img src={logo} alt="GuiaMEI" style={styles.logo} />
        <h1 style={styles.title}>Acesso Restrito</h1>
        <p style={styles.subtitle}>Entre com suas credenciais de administrador.</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Usuário ou e-mail
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              style={styles.input}
              required
            />
          </label>

          <label style={styles.label}>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={styles.input}
              required
            />
          </label>

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? "Validando..." : "Entrar"}
          </button>
        </form>
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            Para testes locais, defina <code>VITE_ADMIN_USER</code> e <code>VITE_ADMIN_PASSWORD</code> no arquivo
            de ambiente. Se estiver usando o backend, utilize as credenciais cadastradas no banco.
          </p>
          <Link to="/" style={styles.backLink}>
            Voltar para a Home
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    padding: "24px",
    fontFamily: '"Inter", sans-serif'
  },
  formContainer: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    textAlign: "center"
  },
  logo: {
    width: "64px",
    height: "64px",
    objectFit: "contain",
    margin: "0 auto 8px"
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0"
  },
  subtitle: {
    fontSize: "15px",
    color: "#475569",
    margin: "0"
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "14px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    textAlign: "left"
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontWeight: "600",
    color: "#1e293b",
    fontSize: "14px"
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5f5",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s ease"
  },
  submitButton: {
    marginTop: "8px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer"
  },
  infoBox: {
    marginTop: "8px",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "13px",
    color: "#475569",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  infoText: {
    margin: 0
  },
  backLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600"
  }
};

export default AdminLoginPage;
