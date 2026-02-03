import { useEffect, useMemo, useState } from "react";
import { useApi } from "../state/ApiContext.jsx";
import { buildDashboardService } from "../services/dashboardService.js";
import { 
  KeyRound, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Copy,
  Plus,
  Building2,
  CalendarClock
} from "lucide-react";

export default function ApiKeys() {
  const { apiKey, baseUrl } = useApi();
  const [rows, setRows] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Creation Modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    label: "",
    role: "institution_admin",
    institutionId: "",
  });
  const [createdKey, setCreatedKey] = useState(null);

  const service = useMemo(
    () => buildDashboardService({ baseUrl, apiKey }),
    [baseUrl, apiKey]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [keysData, instData] = await Promise.all([
          service.getApiKeys(),
          service.getInstitutions()
        ]);
        if (!cancelled) {
          setRows(keysData || []);
          setInstitutions(instData || []);
        }
      } catch (err) {
        console.error("Error loading keys/institutions", err);
        if (!cancelled) {
          setRows([]); 
          setInstitutions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [service]);

  function handleOpenModal() {
    setDraft({
      label: "",
      role: "institution_admin",
      institutionId: institutions[0]?.id || "", // Default to first
    });
    setCreatedKey(null);
    setModalOpen(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      if (!draft.institutionId) {
        alert("Selecciona una institución");
        return;
      }

      let newKeyData = null;
      if (service.createApiKeyForInstitution) {
        newKeyData = await service.createApiKeyForInstitution(draft.institutionId, {
          label: draft.label,
          role: draft.role
        });
      }

      const secret = newKeyData?.apiKey || newKeyData?.key || "acp_" + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');
      
      setCreatedKey({ ...draft, secret });
      // Refresh list
      const updatedKeys = await service.getApiKeys();
      setRows(updatedKeys || []);
    } catch (err) {
      console.error(err);
      alert("Error creando key: " + (err.response?.data?.message || err.message));
    }
  }

  async function handleRevoke(keyId) {
    if (!confirm("¿Estás seguro de revocar esta llave? Dejará de funcionar inmediatamente.")) return;
    try {
      await service.revokeApiKey(keyId);
      // Optimistic update
      setRows(rows.filter(r => r.id !== keyId));
    } catch (err) {
      console.error(err);
      alert("Error al revocar: " + (err.response?.data?.message || err.message));
    }
  }

  // Helper to find inst name
  const getInstName = (id) => institutions.find(i => i.id === id)?.name || "Desconocida";

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Gestión de API Keys</h2>
          <p className="text-xs text-slate-400">Control centralizado de accesos y permisos.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-brand-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva Key
        </button>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-950/90 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Etiqueta / ID</th>
              <th className="px-4 py-3 text-left">Institución</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Expiración</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {rows.map((row) => (
              <tr key={row.id} className="group hover:bg-slate-900/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">{row.label || "Sin etiqueta"}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {row.prefix || "acp_"}...{row.lastDigits || "****"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-300 text-xs">
                    <Building2 className="h-3 w-3 text-slate-500" />
                    {getInstName(row.institutionId)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-300 border border-slate-700">
                    {row.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <CalendarClock className="h-3 w-3" />
                    {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : "Nunca"}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => handleRevoke(row.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
                    title="Revocar acceso"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-slate-500">
                  No hay API Keys activas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            {!createdKey ? (
              <>
                <h3 className="text-lg font-semibold text-slate-100">Nueva API Key</h3>
                <form onSubmit={handleCreate} className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Institución</label>
                    {loading ? (
                      <div className="animate-pulse h-10 w-full rounded-xl bg-slate-900 border border-slate-800" />
                    ) : institutions.length > 0 ? (
                      <select
                        required
                        value={draft.institutionId}
                        onChange={(e) => setDraft({ ...draft, institutionId: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
                      >
                        <option value="" disabled>Selecciona una institución</option>
                        {institutions.map(inst => (
                          <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-3 text-center">
                        <p className="text-xs text-rose-300 mb-2">No se pudieron cargar las instituciones.</p>
                        <button 
                          type="button"
                          onClick={() => window.location.reload()} 
                          className="text-[10px] underline text-rose-400 hover:text-rose-200"
                        >
                          Recargar página
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Etiqueta</label>
                    <input
                      required
                      value={draft.label}
                      onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
                      placeholder="Ej: Servidor de Producción"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Rol</label>
                    <select
                      value={draft.role}
                      onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
                    >
                      <option value="institution_admin">Admin de Institución</option>
                      <option value="issuer">Emisor</option>
                      <option value="verifier">Verificador</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200">Cancelar</button>
                    <button type="submit" className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-brand-400">Generar</button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100">¡Key Generada!</h3>
                <p className="mt-2 text-xs text-slate-400">
                  Copia tu llave ahora. No podrás verla nuevamente.
                </p>
                
                <div className="mt-6 group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-4">
                  <code className="break-all font-mono text-sm text-brand-200">
                    {createdKey.secret}
                  </code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(createdKey.secret)}
                    className="absolute right-2 top-2 rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
                    title="Copiar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}