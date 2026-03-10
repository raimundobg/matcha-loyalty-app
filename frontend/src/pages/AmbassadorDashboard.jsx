import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { ambassadorAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AmbassadorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notAmbassador, setNotAmbassador] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", instagram: "", phone: "" });
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchDashboard();
  }, [user]);

  async function fetchDashboard() {
    try {
      const { data } = await ambassadorAPI.dashboard();
      setDashboard(data);
      setNotAmbassador(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotAmbassador(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegistering(true);
    try {
      await ambassadorAPI.register(regForm);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || "Error al registrar");
    } finally {
      setRegistering(false);
    }
  }

  async function handleGenerateCode() {
    setGenerating(true);
    try {
      await ambassadorAPI.generateCode();
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || "Error al generar código");
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggleCode(codeId) {
    try {
      await ambassadorAPI.toggleCode(codeId);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || "Error al actualizar código");
    }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatCLP(amount) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-matcha-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Registration form for non-ambassadors
  if (notAmbassador) {
    return (
      <div className="bg-dark min-h-screen">
        <div className="max-w-md mx-auto px-4 py-16">
          <h1 className="font-display text-3xl text-white mb-2 text-center">
            Activa tu cuenta de <span className="text-matcha-400 italic">Embajador</span>
          </h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            Registra tus datos para empezar a generar códigos y ganar comisiones.
          </p>

          <form onSubmit={handleRegister} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Nombre</label>
              <input
                type="text"
                required
                value={regForm.name}
                onChange={(e) => setRegForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Tu nombre"
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-400 focus:ring-1 focus:ring-matcha-400 placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Instagram (opcional)</label>
              <input
                type="text"
                value={regForm.instagram}
                onChange={(e) => setRegForm((p) => ({ ...p, instagram: e.target.value }))}
                placeholder="@tu_usuario"
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-400 focus:ring-1 focus:ring-matcha-400 placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Teléfono (opcional)</label>
              <input
                type="text"
                value={regForm.phone}
                onChange={(e) => setRegForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+56 9 ..."
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-400 focus:ring-1 focus:ring-matcha-400 placeholder-gray-600"
              />
            </div>
            <button
              type="submit"
              disabled={registering}
              className="w-full bg-matcha-500 hover:bg-matcha-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {registering ? "Registrando..." : "Activar cuenta embajador"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { ambassador, codes, commissions, stats } = dashboard;

  return (
    <div className="bg-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-white">
              Hola, <span className="text-matcha-400 italic">{ambassador.name}</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Panel de embajador MatchaLab</p>
          </div>
          {ambassador.instagram && (
            <span className="text-matcha-400 text-sm font-medium bg-matcha-400/10 px-3 py-1.5 rounded-full hidden sm:inline">
              {ambassador.instagram}
            </span>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Comisión total</p>
            <p className="text-matcha-400 text-2xl font-bold">{formatCLP(stats.totalCommission)}</p>
            <p className="text-gray-500 text-xs mt-1">15% neto por venta referida</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Ventas referidas</p>
            <p className="text-white text-2xl font-bold">{stats.totalReferrals}</p>
            <p className="text-gray-500 text-xs mt-1">compras con tu código</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Usos totales</p>
            <p className="text-white text-2xl font-bold">{stats.totalCodesUsed}</p>
            <p className="text-gray-500 text-xs mt-1">veces se usaron tus códigos</p>
          </div>
        </div>

        {/* Discount Codes */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-white font-semibold text-base sm:text-lg">Mis códigos de descuento</h2>
            <button
              onClick={handleGenerateCode}
              disabled={generating}
              className="bg-matcha-500 hover:bg-matcha-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {generating ? "Generando..." : "+ Nuevo código"}
            </button>
          </div>

          {codes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              Aún no tienes códigos. Genera tu primer código de descuento.
            </p>
          ) : (
            <div className="space-y-3">
              {codes.map((dc) => (
                <div
                  key={dc.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border gap-2 sm:gap-0 ${
                    dc.active
                      ? "bg-matcha-500/5 border-matcha-500/20"
                      : "bg-white/3 border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-mono text-matcha-400 font-bold text-xs sm:text-sm tracking-wider">
                      {dc.code}
                    </span>
                    <span className="text-gray-500 text-[10px] sm:text-xs">
                      {dc.discountPercent}% desc · {dc.timesUsed} usos
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => copyCode(dc.code)}
                      className="text-gray-400 hover:text-matcha-400 transition-colors p-1.5"
                      title="Copiar código"
                    >
                      {copied === dc.code ? (
                        <svg className="w-4 h-4 text-matcha-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleCode(dc.id)}
                      className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                        dc.active
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-matcha-500/10 text-matcha-400 hover:bg-matcha-500/20"
                      }`}
                    >
                      {dc.active ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Commissions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
          <h2 className="text-white font-semibold text-base sm:text-lg mb-4 sm:mb-5">Historial de comisiones</h2>

          {commissions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              Aún no tienes comisiones. Comparte tus códigos para empezar a ganar.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-xs sm:text-sm min-w-[360px]">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                    <th className="text-left pb-3 font-medium">Fecha</th>
                    <th className="text-left pb-3 font-medium">Código</th>
                    <th className="text-right pb-3 font-medium">Venta</th>
                    <th className="text-right pb-3 font-medium">Comisión (15%)</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-white/5">
                      <td className="py-3 text-gray-300">
                        {new Date(c.createdAt).toLocaleDateString("es-CL")}
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-matcha-400 text-xs">{c.discountCode.code}</span>
                      </td>
                      <td className="py-3 text-right text-gray-300">{formatCLP(c.saleAmount)}</td>
                      <td className="py-3 text-right text-matcha-400 font-semibold">
                        {formatCLP(c.commissionAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
