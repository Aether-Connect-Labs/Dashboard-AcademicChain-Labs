import { useEffect, useMemo, useState } from "react";
import { useApi } from "../state/ApiContext.jsx";
import { buildDashboardService } from "../services/dashboardService.js";
import StatCard from "../components/ui/StatCard.jsx";
import MiniArea from "../components/charts/MiniArea.jsx";

const fallbackOverview = {
  totalEmissions: 0,
  totalVerifications: 0,
  revokedCount: 0,
  activeInstitutions: 0,
  hbarBalance: 0,
  usageSeries: [],
  byInstitution: [],
};

export default function DashboardHome() {
  const { apiKey, baseUrl } = useApi();
  const [overview, setOverview] = useState(fallbackOverview);
  const [loading, setLoading] = useState(true);

  const service = useMemo(
    () => buildDashboardService({ baseUrl, apiKey }),
    [baseUrl, apiKey]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await service.getOverview();
        if (!cancelled) {
          setOverview({ ...fallbackOverview, ...data });
        }
      } catch {
        if (!cancelled) {
          setOverview(fallbackOverview);
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
  }, [service]);

  const series = overview.usageSeries || [];
  const institutions = overview.byInstitution || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-200">
            Panorama general de emisiones
          </h2>
          <p className="text-xs text-slate-400">
            Métricas en tiempo real por institución, token académico y estado legal.
          </p>
        </div>
        <span className="pill bg-slate-900/80 text-[11px] text-slate-300">
          Verificación media &lt; 2s · Evidencia multi-chain
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Credenciales emitidas"
          value={overview.totalEmissions.toLocaleString("es-ES")}
          hint="Incluye emisiones vía API partner y panel web."
          accent="+12% últimos 30 días"
        />
        <StatCard
          label="Verificaciones"
          value={overview.totalVerifications.toLocaleString("es-ES")}
          hint="QR, enlaces públicos y partners de RRHH."
        />
        <StatCard
          label="Credenciales revocadas"
          value={overview.revokedCount.toLocaleString("es-ES")}
          hint="Con trazabilidad forense completa."
        />
        <StatCard
          label="Universidades activas"
          value={overview.activeInstitutions.toLocaleString("es-ES")}
          hint="Incluye partners enterprise y creators."
        />
      </div>
      <div className="grid gap-4 md:grid-cols-[1.7fr,1.1fr]">
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-medium text-slate-300">
                Emisiones y verificaciones
              </div>
              <div className="text-[11px] text-slate-500">
                Serie temporal agregada por día.
              </div>
            </div>
            <div className="pill bg-slate-950/60 text-[10px] text-slate-300">
              Latencia media blockchain Hedera
            </div>
          </div>
          <div className="mt-4">
            <MiniArea data={series} />
          </div>
        </div>
        <div className="glass-panel flex flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-medium text-slate-300">
                Emisiones por institución
              </div>
              <div className="text-[11px] text-slate-500">
                Top instituciones y planes activos.
              </div>
            </div>
            <div className="pill bg-emerald-500/10 text-[10px] text-emerald-300">
              HBAR balance: {overview.hbarBalance} HBAR
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {institutions.map((inst) => (
              <div
                key={inst.name}
                className="flex items-center justify-between gap-2 rounded-xl bg-slate-950/60 px-3 py-2"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-100">
                    {inst.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Plan {inst.plan} ·{" "}
                    <span className="text-slate-300">
                      {inst.emissions.toLocaleString("es-ES")} credenciales
                    </span>
                  </div>
                </div>
                <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-400"
                    style={{
                      width: `${Math.min(100, 25 + inst.emissions / 8)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {loading && (
        <div className="text-xs text-slate-500">
          Cargando métricas en vivo desde la API…
        </div>
      )}
    </div>
  );
}

