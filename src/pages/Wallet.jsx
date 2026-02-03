import { useEffect, useState } from "react";
import { useApi } from "../state/ApiContext.jsx";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, Coins } from "lucide-react";

export default function Wallet() {
  const { baseUrl } = useApi();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch wallet data
    async function loadWallet() {
      try {
        const res = await fetch(`${baseUrl}/dashboard/wallet`);
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
          setTransactions(data.transactions);
        }
      } catch (err) {
        console.error("Failed to load wallet data", err);
      } finally {
        setLoading(false);
      }
    }
    loadWallet();
  }, [baseUrl]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">Billetera & Tesorería</h2>
          <p className="text-sm text-slate-400">
            Gestión de fondos HBAR y registro de transacciones de la red.
          </p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-500/10 blur-xl transition-all group-hover:bg-brand-500/20" />
          <div className="relative">
            <div className="flex items-center gap-3 text-brand-200 mb-2">
              <div className="p-2 bg-brand-500/10 rounded-lg">
                <WalletIcon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Balance Total</span>
            </div>
            <div className="text-3xl font-bold text-slate-50 mt-2">
              {loading ? "..." : balance.toLocaleString()} <span className="text-lg font-normal text-slate-400">HBAR</span>
            </div>
            <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
              <span className="text-emerald-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +2.5%
              </span>
              vs mes anterior
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden">
           <div className="flex items-center gap-3 text-slate-300 mb-4">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Coins className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Token Académico (ACT)</span>
            </div>
            <div className="text-2xl font-bold text-slate-50">
              50,000 <span className="text-base font-normal text-slate-400">ACT</span>
            </div>
             <p className="mt-2 text-xs text-slate-500">
              Token de gobernanza interno para votaciones.
            </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-panel overflow-hidden">
        <div className="border-b border-slate-800 p-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <History className="h-4 w-4 text-slate-400" />
            Historial de Transacciones
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">ID Transacción</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium text-right">Monto (HBAR)</th>
                <th className="px-4 py-3 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                 <tr><td colSpan="5" className="p-4 text-center text-slate-500">Cargando...</td></tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {tx.type === 'credit' ? (
                          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400"><ArrowDownLeft className="h-3 w-3" /></div>
                        ) : (
                          <div className="p-1 rounded bg-slate-800 text-slate-400"><ArrowUpRight className="h-3 w-3" /></div>
                        )}
                        <span className="text-slate-300 capitalize">{tx.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{tx.txId}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className={`px-4 py-3 text-right font-medium ${tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        Completado
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No hay transacciones recientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
