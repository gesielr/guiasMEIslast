import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSdk } from "./sdk-provider";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const sdk = useSdk();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [challenge, setChallenge] = useState(null);

  const value = useMemo(
    () => ({
      session,
      challenge,
      async login(identifier, password) {
        const result = await sdk.auth.login({ identifier, password });
        if (result.challengeRequired) {
          setChallenge({ identifier });
          navigate("/auth/2fa");
          return;
        }
        setSession(result);
        navigate("/dashboard");
      },
      async register(payload) {
        await sdk.auth.register(payload);
        navigate("/auth/login");
      },
      async verify2fa(code) {
        const result = await sdk.auth.verify2fa({ code });
        setSession(result);
        setChallenge(null);
        navigate("/dashboard");
      },
      logout() {
        setSession(null);
        navigate("/");
      }
    }),
    [sdk, navigate, session, challenge]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return value;
}
