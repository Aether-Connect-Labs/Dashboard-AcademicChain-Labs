import { useEffect, useMemo, useState } from "react";
import { useApi } from "../state/ApiContext.jsx";
import { buildDashboardService } from "../services/dashboardService.js";
import StatCard from "../components/ui/StatCard.jsx";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const fallbackOverview = {
  totalEmissions: 0,
  totalVerifications: 0,
  revokedCount: 0,
  activeInstitutions: 0,
  hbarBalance: 0,
  usageSeries: [],
  byInstitution: [],
};

const pieColors = ["#22c55e", "#38bdf8", "#f97316"];

export default function Metrics() {
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

  const totalsData = [
    { name: "Emitidas", value: overview.totalEmissions },
    { name: "Verificadas", value: overview.totalVerifications },
    { name: "Revocadas", value: overview.revokedCount },
  ].filter((item) => item.value > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-200">
            Métricas avanzadas
          </h2>
          <p className="text-xs text-slate-400">
            Analiza el comportamiento de emisiones, verificaciones y revocaciones.
          </p>
        </div>
        <span className="pill bg-slate-900/80 text-[11px] text-slate-300">
          Datos agregados desde la API partner
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total emitidas"
          value={overview.totalEmissions.toLocaleString("es-ES")}
          hint="Todas las credenciales registradas."
          accent=""
        />
        <StatCard
          label="Verificaciones"
          value={overview.totalVerifications.toLocaleString("es-ES")}
          hint="Consultas contra la API de verificación."
          accent=""
        />
        <StatCard
          label="Revocaciones"
          value={overview.revokedCount.toLocaleString("es-ES")}
          hint="Incluye revocaciones vía panel y API."
          accent=""
        />
        <StatCard
          label="Instituciones activas"
          value={overview.activeInstitutions.toLocaleString("es-ES")}
          hint="Partners con actividad reciente."
          accent=""
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.8fr,1.2fr]">
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-medium text-slate-300">
                Serie temporal de uso
              </div>
              <div className="text-[11px] text-slate-500">
                Volumen diario agregado de operaciones.
              </div>
            </div>
            <div className="pill bg-slate-950/60 text-[10px] text-slate-300">
              Últimos 7 días
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="metricsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#020617" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(15 23 42)",
                    borderColor: "rgb(51 65 85)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#metricsArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel flex flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-medium text-slate-300">
                Distribución global
              </div>
              <div className="text-[11px] text-slate-500">
                Equilibrio entre emisiones, verificaciones y revocaciones.
              </div>
            </div>
          </div>
          <div className="mt-4 flex h-64 items-center justify-center">
            {totalsData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(15 23 42)",
                      borderColor: "rgb(51 65 85)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={24}
                    formatter={(value) => (
                      <span className="text-[11px] text-slate-300">{value}</span>
                    )}
                  />
                  <Pie
                    data={totalsData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {totalsData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">
                Aún no hay suficientes datos para construir la distribución.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-slate-300">
              Emisiones por institución
            </div>
            <div className="text-[11px] text-slate-500">
              Comparativa entre instituciones activas.
            </div>
          </div>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={institutions}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(15 23 42)",
                  borderColor: "rgb(51 65 85)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="emissions" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading && (
        <div className="text-xs text-slate-500">
          Cargando métricas desde la API…
        </div>
      )}
    </div>
  );
}

