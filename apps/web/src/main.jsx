import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./styles/global.css";
import { SdkProvider } from "./providers/sdk-provider";
import { AuthProvider as SdkAuthProvider } from "./providers/auth-provider";
import { AuthProvider as RoleAuthProvider } from "./auth/AuthProvider";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SdkProvider>
          <RoleAuthProvider>
            <SdkAuthProvider>
              <App />
            </SdkAuthProvider>
          </RoleAuthProvider>
        </SdkProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
