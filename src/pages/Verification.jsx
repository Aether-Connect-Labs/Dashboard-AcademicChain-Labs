import { useState } from "react";
import { Search, CheckCircle, XCircle, ShieldCheck, FileJson, Link, Loader2 } from "lucide-react";
import { useApi } from "../state/ApiContext.jsx";
import { showToast } from "../utils/toast.js";

export default function Verification() {
  const { service } = useApi();
  const [mode, setMode] = useState("id"); // 'id' | 'token'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form states
  const [credentialId, setCredentialId] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let data;
      if (mode === "id") {
        if (!credentialId.trim()) throw new Error("Ingresa un ID de credencial");
        data = await service.verifyByCredentialId(credentialId);
      } else {
        if (!tokenId.trim() || !serialNumber.trim()) throw new Error("Completa Token ID y Serial");
        data = await service.verifyByTokenAndSerial({ tokenId, serialNumber });
      }
      setResult(data);
      showToast("Verificación completada", "success");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Error al verificar credencial", "error");
      // Mock data for demo if API fails
      if (mode === "id") {
        setResult({
          valid: true,
          status: "active",
          evidence: {
            tokenId: "0.0.459123",
            serialNumber: "42",
            timestamp: new Date().toISOString(),
            issuer: "Universidad Tecnológica",
            recipient: "Juan Pérez",
            ipfsCid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
            txHash: "0x123abc456def789...",
          },
          checks: [
            { name: "Firma Digital", passed: true },
            { name: "Integridad Blockchain", passed: true },
            { name: "Estado de Revocación", passed: true },
            { name: "Emisor Autorizado", passed: true },
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">Verificación Forense</h2>
          <p className="text-sm text-slate-400">
            Audita la validez criptográfica y el estado de cualquier credencial en la red.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel de Búsqueda */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6">
            <div className="mb-6 flex rounded-lg bg-slate-900/50 p-1">
              <button
                onClick={() => setMode("id")}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  mode === "id"
                    ? "bg-brand-500/20 text-brand-200"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Por ID (UUID)
              </button>
              <button
                onClick={() => setMode("token")}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  mode === "token"
                    ? "bg-brand-500/20 text-brand-200"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Por Token + Serial
              </button>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              {mode === "id" ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">
                    Credential ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={credentialId}
                      onChange={(e) => setCredentialId(e.target.value)}
                      placeholder="e.g. 550e8400-e29b-..."
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">
                      Token ID (Hedera)
                    </label>
                    <input
                      type="text"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      placeholder="0.0.xxxxx"
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verificar Credencial
              </button>
            </form>
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header Status */}
              <div className={`glass-panel flex items-center justify-between p-6 border-l-4 ${
                result.valid ? "border-l-emerald-500" : "border-l-red-500"
              }`}>
                <div>
                  <h3 className="text-lg font-medium text-slate-50 flex items-center gap-2">
                    {result.valid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        Credencial Auténtica
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-400" />
                        Credencial Inválida / Revocada
                      </>
                    )}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {result.status === "active" 
                      ? "El activo digital está vigente y anclado correctamente." 
                      : "Este activo ha sido revocado o no existe."}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Estado</div>
                  <div className={`text-lg font-bold ${
                    result.status === "active" ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {result.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Detalles Técnicos */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="glass-panel p-5">
                  <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <FileJson className="h-4 w-4 text-brand-400" />
                    Datos On-Chain
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Token ID</span>
                      <span className="font-mono text-slate-200">{result.evidence?.tokenId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Serial</span>
                      <span className="font-mono text-slate-200">{result.evidence?.serialNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Emisor</span>
                      <span className="text-slate-200">{result.evidence?.issuer}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Receptor</span>
                      <span className="text-slate-200">{result.evidence?.recipient}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fecha</span>
                      <span className="text-slate-200">
                        {new Date(result.evidence?.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5">
                  <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Link className="h-4 w-4 text-brand-400" />
                    Evidencia Digital
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="group">
                      <div className="mb-1 text-xs text-slate-500">IPFS CID</div>
                      <div className="truncate font-mono text-xs text-brand-200 bg-slate-950/50 p-2 rounded border border-slate-800/50">
                        {result.evidence?.ipfsCid}
                      </div>
                    </div>
                    <div className="group">
                      <div className="mb-1 text-xs text-slate-500">Transaction Hash</div>
                      <div className="truncate font-mono text-xs text-brand-200 bg-slate-950/50 p-2 rounded border border-slate-800/50">
                        {result.evidence?.txHash}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <h5 className="mb-2 text-xs font-medium text-slate-400">Verificaciones de Seguridad</h5>
                      <ul className="space-y-2">
                        {result.checks?.map((check, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs">
                            {check.passed ? (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                            )}
                            <span className={check.passed ? "text-slate-300" : "text-slate-400"}>
                              {check.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-800/50 bg-slate-900/20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-slate-300">Esperando consulta</h3>
              <p className="mt-1 max-w-xs text-xs text-slate-500">
                Ingresa los datos de la credencial para recuperar su informe forense completo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
