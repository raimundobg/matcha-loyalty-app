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

  async function shareCode(code) {
    const text = `¡Usa mi código ${code} en MatchaLab y obtén un 10% de descuento! 🍵✨`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "MatchaLab - Código de descuento", text });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    }
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
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-matcha-200 border-t-matcha-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Registration form for non-ambassadors
  if (notAmbassador) {
    return (
      <div className="bg-cream min-h-screen">
        <div className="max-w-md mx-auto px-4 py-16">
          <h1 className="font-display text-3xl text-matcha-950 mb-2 text-center">
            Activa tu cuenta de <span className="text-matcha-600 italic">Embajador</span>
          </h1>
          <p className="text-matcha-500 text-center text-sm mb-8">
            Registra tus datos para empezar a generar códigos y ganar comisiones.
          </p>

          <form onSubmit={handleRegister} className="bg-white border border-matcha-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <label className="block text-sm text-matcha-700 mb-1.5">Nombre</label>
              <input
                type="text"
                required
                value={regForm.name}
                onChange={(e) => setRegForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Tu nombre"
                className="w-full bg-matcha-50/50 border border-matcha-200 text-matcha-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500 placeholder-matcha-300"
              />
            </div>
            <div>
              <label className="block text-sm text-matcha-700 mb-1.5">Instagram (opcional)</label>
              <input
                type="text"
                value={regForm.instagram}
                onChange={(e) => setRegForm((p) => ({ ...p, instagram: e.target.value }))}
                placeholder="@tu_usuario"
                className="w-full bg-matcha-50/50 border border-matcha-200 text-matcha-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500 placeholder-matcha-300"
              />
            </div>
            <div>
              <label className="block text-sm text-matcha-700 mb-1.5">Teléfono (opcional)</label>
              <input
                type="text"
                value={regForm.phone}
                onChange={(e) => setRegForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+56 9 ..."
                className="w-full bg-matcha-50/50 border border-matcha-200 text-matcha-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500 placeholder-matcha-300"
              />
            </div>
            <button
              type="submit"
              disabled={registering}
              className="w-full bg-matcha-600 hover:bg-matcha-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
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
    <div className="bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-matcha-950">
              Hola, <span className="text-matcha-600 italic">{ambassador.name}</span>
            </h1>
            <p className="text-matcha-500 text-sm mt-1">Panel de embajador MatchaLab</p>
          </div>
          {ambassador.instagram && (
            <span className="text-matcha-700 text-sm font-medium bg-matcha-100 px-3 py-1.5 rounded-full hidden sm:inline">
              {ambassador.instagram}
            </span>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="bg-white border border-matcha-100 rounded-xl p-4 sm:p-5 shadow-sm">
            <p className="text-matcha-500 text-xs uppercase tracking-wider mb-1">Comisión total</p>
            <p className="text-matcha-700 text-2xl font-bold">{formatCLP(stats.totalCommission)}</p>
            <p className="text-matcha-400 text-xs mt-1">15% neto por venta referida</p>
          </div>
          <div className="bg-white border border-matcha-100 rounded-xl p-4 sm:p-5 shadow-sm">
            <p className="text-matcha-500 text-xs uppercase tracking-wider mb-1">Ventas referidas</p>
            <p className="text-matcha-900 text-2xl font-bold">{stats.totalReferrals}</p>
            <p className="text-matcha-400 text-xs mt-1">compras con tu código</p>
          </div>
          <div className="bg-white border border-matcha-100 rounded-xl p-4 sm:p-5 shadow-sm">
            <p className="text-matcha-500 text-xs uppercase tracking-wider mb-1">Usos totales</p>
            <p className="text-matcha-900 text-2xl font-bold">{stats.totalCodesUsed}</p>
            <p className="text-matcha-400 text-xs mt-1">veces se usaron tus códigos</p>
          </div>
        </div>

        {/* Discount Codes */}
        <div className="bg-white border border-matcha-100 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-matcha-900 font-semibold text-base sm:text-lg">Mis códigos de descuento</h2>
            <button
              onClick={handleGenerateCode}
              disabled={generating}
              className="bg-matcha-600 hover:bg-matcha-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {generating ? "Generando..." : "+ Nuevo código"}
            </button>
          </div>

          {codes.length === 0 ? (
            <p className="text-matcha-400 text-sm text-center py-6">
              Aún no tienes códigos. Genera tu primer código de descuento.
            </p>
          ) : (
            <div className="space-y-3">
              {codes.map((dc) => (
                <div
                  key={dc.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border gap-2 sm:gap-0 ${
                    dc.active
                      ? "bg-matcha-50 border-matcha-200"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-mono text-matcha-700 font-bold text-xs sm:text-sm tracking-wider">
                      {dc.code}
                    </span>
                    <span className="text-matcha-400 text-[10px] sm:text-xs">
                      {dc.discountPercent}% desc · {dc.timesUsed} usos
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => copyCode(dc.code)}
                      className="text-matcha-400 hover:text-matcha-600 transition-colors p-1.5"
                      title="Copiar código"
                    >
                      {copied === dc.code ? (
                        <svg className="w-4 h-4 text-matcha-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => shareCode(dc.code)}
                      className="text-matcha-400 hover:text-matcha-600 transition-colors p-1.5"
                      title="Compartir código"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggleCode(dc.id)}
                      className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                        dc.active
                          ? "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
                          : "bg-matcha-50 text-matcha-600 hover:bg-matcha-100 border border-matcha-200"
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
        <div className="bg-white border border-matcha-100 rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-matcha-900 font-semibold text-base sm:text-lg mb-4 sm:mb-5">Historial de comisiones</h2>

          {commissions.length === 0 ? (
            <p className="text-matcha-400 text-sm text-center py-6">
              Aún no tienes comisiones. Comparte tus códigos para empezar a ganar.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-xs sm:text-sm min-w-[360px]">
                <thead>
                  <tr className="text-matcha-500 text-xs uppercase tracking-wider border-b border-matcha-100">
                    <th className="text-left pb-3 font-medium">Fecha</th>
                    <th className="text-left pb-3 font-medium">Código</th>
                    <th className="text-right pb-3 font-medium">Venta</th>
                    <th className="text-right pb-3 font-medium">Comisión (15%)</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-matcha-50">
                      <td className="py-3 text-matcha-700">
                        {new Date(c.createdAt).toLocaleDateString("es-CL")}
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-matcha-600 text-xs">{c.discountCode.code}</span>
                      </td>
                      <td className="py-3 text-right text-matcha-700">{formatCLP(c.saleAmount)}</td>
                      <td className="py-3 text-right text-matcha-700 font-semibold">
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
