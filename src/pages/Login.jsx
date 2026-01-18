import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../state/ApiContext.jsx";

export default function Login() {
  const { apiKey, baseUrl, setApiKey, setBaseUrl } = useApi();
  const [urlValue, setUrlValue] = useState(
    "https://academicchain-ledger.onrender.com"
  );
  const [keyValue, setKeyValue] = useState("acp_3fa9c2ab_0c2a3d4e5f6g7h8i9j0k");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setApiKey(keyValue.trim());
    setBaseUrl(urlValue.trim());
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr,1fr]">
          <div className="glass-panel relative overflow-hidden p-8">
            <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="pill bg-slate-950/70 text-brand-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Infra de verificación instantánea
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
                Dashboard de emisiones académicas
              </h1>
              <p className="text-sm text-slate-300">
                Conecta la API de AcademicChain Labs y controla, en un solo lugar, qué
                universidades emiten qué credenciales, con métricas en tiempo real.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Segmentación por institución, token académico y plan.</li>
                <li>• Visibilidad de emisiones, verificaciones y revocaciones.</li>
                <li>• Panel pensado para CTOs, compliance y partners enterprise.</li>
              </ul>
            </div>
          </div>
          <div className="glass-panel p-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Conectar instancia
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Introduce la URL de tu backend y la API key con permisos de partner.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5 text-sm">
                <label className="text-xs font-medium text-slate-200">
                  URL base de la API
                </label>
                <input
                  type="url"
                  required
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none ring-brand-500/40 placeholder:text-slate-500 focus:border-brand-400 focus:ring-2"
                  placeholder="https://academicchain-ledger.onrender.com/api"
                />
              </div>
              <div className="space-y-1.5 text-sm">
                <label className="text-xs font-medium text-slate-200">API key</label>
                <input
                  type="password"
                  required
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none ring-brand-500/40 placeholder:text-slate-500 focus:border-brand-400 focus:ring-2"
                  placeholder="acp_xxxxxxxxx"
                />
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-brand-400"
              >
                Entrar al panel
              </button>
            </form>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
              Tus credenciales se almacenan solo en tu navegador. Este dashboard actúa como
              un cliente sobre la API multi-institución de AcademicChain Labs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
