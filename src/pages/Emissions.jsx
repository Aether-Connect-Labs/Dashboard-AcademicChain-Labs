import { useEffect, useMemo, useState } from "react";
import { useApi } from "../state/ApiContext.jsx";
import { buildDashboardService } from "../services/dashboardService.js";

const statusStyles = {
  emitida: "bg-sky-500/10 text-sky-300",
  verificada: "bg-emerald-500/10 text-emerald-300",
  revocada: "bg-rose-500/10 text-rose-300",
};

export default function Emissions() {
  const { apiKey, baseUrl, activeInstitution } = useApi();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");

  const service = useMemo(
    () => buildDashboardService({ baseUrl, apiKey }),
    [baseUrl, apiKey]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const params = {};
        if (activeInstitution?.id) {
          params.institutionId = activeInstitution.id;
        }
        if (status !== "all") {
          params.status = status;
        }
        const data = await service.getEmissions(params);
        if (!cancelled) {
          setRows(data);
        }
      } catch {
        if (!cancelled) {
          setRows([
            {
              id: "demo-1",
              studentName: "Ana Martínez",
              institutionName: "Tech University",
              credentialType: "Grado en Ingeniería Informática",
              status: "verificada",
              tokenId: "0.0.123456",
              serialNumber: 1283,
              issuedAt: "2024-09-12",
            },
            {
              id: "demo-2",
              studentName: "Carlos Gómez",
              institutionName: "Escuela de Negocios Global",
              credentialType: "MBA Data & AI",
              status: "emitida",
              tokenId: "0.0.654321",
              serialNumber: 342,
              issuedAt: "2024-10-03",
            },
            {
              id: "demo-3",
              studentName: "Laura Pérez",
              institutionName: "Tech University",
              credentialType: "Bootcamp Web3",
              status: "revocada",
              tokenId: "0.0.123456",
              serialNumber: 291,
              issuedAt: "2023-07-21",
            },
          ]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [service, activeInstitution, status]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Emisiones de credenciales
          </h2>
          <p className="text-xs text-slate-400">
            Filtra por institución, estado y tipo de credencial.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs text-slate-100 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
          >
            <option value="all">Todos los estados</option>
            <option value="emitida">Emitida</option>
            <option value="verificada">Verificada</option>
            <option value="revocada">Revocada</option>
          </select>
          {activeInstitution && (
            <span className="pill bg-slate-950/70 text-[11px] text-slate-300">
              Filtro institución: {activeInstitution.name}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Titular</th>
              <th className="px-4 py-3 text-left">Institución</th>
              <th className="px-4 py-3 text-left">Credencial</th>
              <th className="px-4 py-3 text-left">Token / Serial</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Fecha emisión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {rows.map((row) => (
              <tr key={row.id} className="bg-slate-950/60">
                <td className="px-4 py-3 text-xs text-slate-100">
                  <div className="font-medium">{row.studentName}</div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-300">
                  {row.institutionName}
                </td>
                <td className="px-4 py-3 text-xs text-slate-200">
                  {row.credentialType}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-slate-300">
                  {row.tokenId} · #{row.serialNumber}
                </td>
                <td className="px-4 py-3 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      statusStyles[row.status] || "bg-slate-700/50 text-slate-200"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-slate-400">
                  {row.issuedAt}
                </td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-xs text-slate-500"
                >
                  Aún no hay emisiones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {loading && (
        <div className="text-xs text-slate-500">
          Cargando emisiones desde la API…
        </div>
      )}
    </div>
  );
}

