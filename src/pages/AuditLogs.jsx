import { useEffect, useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { useApi } from "../state/ApiContext.jsx";
import { buildDashboardService } from "../services/dashboardService.js";
 
const mapStatusLabel = (status) => {
  if (status === "success") return "Petición aceptada";
  if (status === "failed") return "Petición rechazada";
  return "Evento";
};
 
export default function AuditLogs() {
  const { apiKey, baseUrl } = useApi();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
 
  const service = useMemo(
    () => buildDashboardService({ baseUrl, apiKey }),
    [baseUrl, apiKey]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await service.getLogs();
        if (!cancelled) {
          setLogs(data);
        }
      } catch {
        if (!cancelled) {
          setLogs([]);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [service]);
 
  const filteredLogs = logs.filter((log) => {
    const text = [
      log.institutionName,
      log.endpoint,
      mapStatusLabel(log.status),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Logs de uso de API
          </h2>
          <p className="text-xs text-slate-400">
            Registro centralizado de llamadas realizadas con tus API Keys.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar en logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 rounded-xl border border-slate-800 bg-slate-950/50 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">Institución</th>
              <th className="px-6 py-3 text-left">Endpoint</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-right">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand-400" />
                    <span className="font-medium text-slate-200">
                      {log.institutionName || "Desconocida"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-300">
                  {log.endpoint || "-"}
                </td>
                <td className="px-6 py-4 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      log.status === "success"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-rose-500/10 text-rose-300"
                    }`}
                  >
                    {mapStatusLabel(log.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-slate-500">
                  {log.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
