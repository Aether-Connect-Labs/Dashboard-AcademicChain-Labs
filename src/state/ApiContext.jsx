import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildDashboardService } from "../services/dashboardService.js";

const ApiContext = createContext(null);

export function ApiProvider({ children }) {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("ac_api_key") || "acp_3fa9c2ab_0c2a3d4e5f6g7h8i9j0k"
  );
  const [baseUrl, setBaseUrl] = useState(
    () =>
      localStorage.getItem("ac_base_url") ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001"
  );
  const [activeInstitution, setActiveInstitution] = useState(null);

  const service = useMemo(
    () => (apiKey && baseUrl ? buildDashboardService({ baseUrl, apiKey }) : null),
    [baseUrl, apiKey]
  );

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("ac_api_key", apiKey);
    } else {
      localStorage.removeItem("ac_api_key");
    }
  }, [apiKey]);

  useEffect(() => {
    if (baseUrl) {
      localStorage.setItem("ac_base_url", baseUrl);
    }
  }, [baseUrl]);

  const value = {
    apiKey,
    setApiKey,
    baseUrl,
    setBaseUrl,
    service,
    activeInstitution,
    setActiveInstitution,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error("useApi must be used within ApiProvider");
  }
  return ctx;
}
