import { createContext, useContext, useMemo } from "react";
import { createSdk } from "@sdk";

const SdkContext = createContext(null);

export function SdkProvider({ children }) {
  const sdk = useMemo(() => {
    return createSdk({
      baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:54321/functions/v1",
      mode: import.meta.env.VITE_APP_MODE ?? "mock"
    });
  }, []);

  return <SdkContext.Provider value={sdk}>{children}</SdkContext.Provider>;
}

export function useSdk() {
  const sdk = useContext(SdkContext);
  if (!sdk) {
    throw new Error("useSdk deve ser usado dentro de SdkProvider");
  }
  return sdk;
}
