import { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

function formatCLP(amount) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("matcha_admin_secret"));
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  // Tabs: "applications" | "ambassadors"
  const [activeTab, setActiveTab] = useState("applications");

  // Applications state
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [credentials, setCredentials] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Ambassadors state
  const [ambassadors, setAmbassadors] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [ambLoading, setAmbLoading] = useState(false);
  const [expandedAmb, setExpandedAmb] = useState(null);

  useEffect(() => {
    if (authed && activeTab === "applications") fetchApplications();
    if (authed && activeTab === "ambassadors") fetchAmbassadors();
  }, [authed, activeTab, filter]);

  async function fetchApplications() {
    setAppLoading(true);
    setError("");
    try {
      const { data } = await adminAPI.listApplications(filter);
      setApplications(data.applications);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("matcha_admin_secret");
        setAuthed(false);
        setError("Clave incorrecta o expirada");
      } else {
        setError("Error al cargar postulaciones");
      }
    } finally {
      setAppLoading(false);
    }
  }

  async function fetchAmbassadors() {
    setAmbLoading(true);
    try {
      const { data } = await adminAPI.listAmbassadors();
      setAmbassadors(data.ambassadors);
      setGlobalStats(data.globalStats);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("matcha_admin_secret");
        setAuthed(false);
        setError("Clave incorrecta o expirada");
      }
    } finally {
      setAmbLoading(false);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!secret.trim()) return;
    localStorage.setItem("matcha_admin_secret", secret.trim());
    setAuthed(true);
    setSecret("");
  }

  function handleLogout() {
    localStorage.removeItem("matcha_admin_secret");
    setAuthed(false);
    setApplications([]);
    setAmbassadors([]);
    setCredentials(null);
  }

  async function handleApprove(id) {
    setActionLoading(id);
    setCredentials(null);
    try {
      const { data } = await adminAPI.approve(id);
      setCredentials(data);
      await fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error || "Error al aprobar");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    if (!confirm("Rechazar esta postulacion?")) return;
    setActionLoading(id);
    try {
      await adminAPI.reject(id);
      await fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error || "Error al rechazar");
    } finally {
      setActionLoading(null);
    }
  }

  function copyCredentials() {
    if (!credentials?.credentials) return;
    const c = credentials.credentials;
    navigator.clipboard.writeText(`Email: ${c.email}\nUsuario: ${c.username}\nContrasena: ${c.password}`);
  }

  // Login gate
  if (!authed) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="bg-white border border-matcha-100 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="w-12 h-12 bg-matcha-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-matcha-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-matcha-950 text-center mb-2">Admin Panel</h1>
            <p className="text-matcha-500 text-sm text-center mb-6">Ingresa la clave de administrador</p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Admin secret"
                className="w-full bg-matcha-50/50 border border-matcha-200 text-matcha-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500 placeholder-matcha-300"
              />
              <button type="submit" className="w-full bg-matcha-600 hover:bg-matcha-700 text-white font-bold py-3 rounded-xl transition-colors">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-matcha-950">
              Panel <span className="text-matcha-600 italic">Admin</span>
            </h1>
            <p className="text-matcha-500 text-sm mt-1">Gestiona embajadores y postulaciones</p>
          </div>
          <button onClick={handleLogout} className="text-matcha-500 hover:text-red-500 text-sm font-medium transition-colors">
            Cerrar sesion
          </button>
        </div>

        {/* Main tabs */}
        <div className="flex gap-1 bg-white border border-matcha-100 rounded-xl p-1 mb-6 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "applications" ? "bg-matcha-600 text-white" : "text-matcha-600 hover:bg-matcha-50"
            }`}
          >
            Postulaciones
          </button>
          <button
            onClick={() => setActiveTab("ambassadors")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "ambassadors" ? "bg-matcha-600 text-white" : "text-matcha-600 hover:bg-matcha-50"
            }`}
          >
            Embajadores
          </button>
        </div>

        {/* ============ APPLICATIONS TAB ============ */}
        {activeTab === "applications" && (
          <>
            {/* Credentials banner */}
            {credentials?.credentials && (
              <div className="bg-matcha-50 border border-matcha-300 rounded-2xl p-4 sm:p-5 mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-matcha-800 font-semibold text-sm mb-2">Credenciales generadas:</p>
                    <div className="font-mono text-sm text-matcha-700 space-y-1 bg-white rounded-lg p-3 border border-matcha-200">
                      <p>Email: <span className="font-semibold">{credentials.credentials.email}</span></p>
                      <p>Usuario: <span className="font-semibold">{credentials.credentials.username}</span></p>
                      <p>Contrasena: <span className="font-semibold">{credentials.credentials.password}</span></p>
                    </div>
                    {credentials.note && <p className="text-matcha-500 text-xs mt-2">{credentials.note}</p>}
                  </div>
                  <button onClick={copyCredentials} className="bg-matcha-600 hover:bg-matcha-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                    Copiar
                  </button>
                </div>
              </div>
            )}

            {/* Status filter */}
            <div className="flex gap-1 bg-matcha-50 border border-matcha-100 rounded-lg p-1 mb-6 w-fit">
              {[
                { value: "pending", label: "Pendientes" },
                { value: "approved", label: "Aprobadas" },
                { value: "rejected", label: "Rechazadas" },
                { value: "", label: "Todas" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    filter === tab.value ? "bg-white text-matcha-700 shadow-sm" : "text-matcha-500 hover:text-matcha-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {appLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-matcha-200 border-t-matcha-600 rounded-full animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white border border-matcha-100 rounded-2xl p-8 text-center shadow-sm">
                <p className="text-matcha-400 text-sm">No hay postulaciones {filter && `"${filter}"`}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white border border-matcha-100 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-matcha-900 font-semibold text-sm">{app.name}</h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            app.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : app.status === "approved" ? "bg-matcha-50 text-matcha-600 border border-matcha-200"
                            : "bg-red-50 text-red-500 border border-red-200"
                          }`}>
                            {app.status === "pending" ? "Pendiente" : app.status === "approved" ? "Aprobada" : "Rechazada"}
                          </span>
                        </div>
                        <div className="text-matcha-500 text-xs space-y-0.5">
                          <p>{app.email}</p>
                          <p>{app.instagram}{app.followers && <span className="ml-2 text-matcha-400">· {app.followers} seguidores</span>}</p>
                          {app.message && <p className="text-matcha-400 mt-1 italic">"{app.message}"</p>}
                          <p className="text-matcha-300 mt-1">
                            {new Date(app.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      {app.status === "pending" && (
                        <div className="flex items-center gap-2 self-end sm:self-start">
                          <button onClick={() => handleApprove(app.id)} disabled={actionLoading === app.id}
                            className="bg-matcha-600 hover:bg-matcha-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                            {actionLoading === app.id ? "..." : "Aprobar"}
                          </button>
                          <button onClick={() => handleReject(app.id)} disabled={actionLoading === app.id}
                            className="bg-red-50 hover:bg-red-100 disabled:opacity-50 border border-red-200 text-red-500 text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ============ AMBASSADORS TAB ============ */}
        {activeTab === "ambassadors" && (
          <>
            {/* Global stats */}
            {globalStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <div className="bg-white border border-matcha-100 rounded-xl p-4 shadow-sm">
                  <p className="text-matcha-500 text-xs uppercase tracking-wider mb-1">Embajadores</p>
                  <p className="text-matcha-900 text-2xl font-bold">{globalStats.totalAmbassadors}</p>
                </div>
                <div className="bg-white border border-matcha-100 rounded-xl p-4 shadow-sm">
                  <p className="text-matcha-500 text-xs uppercase tracking-wider mb-1">Ventas totales</p>
                  <p className="text-matcha-900 text-2xl font-bold">{formatCLP(globalStats.totalRevenue)}</p>
                </div>
                <div className="bg-white border border-matcha-100 rounded-xl p-4 shadow-sm">
                  <p className="text-matcha-500 text-xs uppercase tracking-wider mb-1">Comisiones</p>
                  <p className="text-matcha-700 text-2xl font-bold">{formatCLP(globalStats.totalCommissions)}</p>
                </div>
                <div className="bg-white border border-matcha-100 rounded-xl p-4 shadow-sm">
                  <p className="text-matcha-500 text-xs uppercase tracking-wider mb-1">Referidos</p>
                  <p className="text-matcha-900 text-2xl font-bold">{globalStats.totalReferrals}</p>
                </div>
              </div>
            )}

            {ambLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-matcha-200 border-t-matcha-600 rounded-full animate-spin" />
              </div>
            ) : ambassadors.length === 0 ? (
              <div className="bg-white border border-matcha-100 rounded-2xl p-8 text-center shadow-sm">
                <p className="text-matcha-400 text-sm">No hay embajadores registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ambassadors.map((amb) => (
                  <div key={amb.id} className="bg-white border border-matcha-100 rounded-2xl shadow-sm overflow-hidden">
                    {/* Ambassador row */}
                    <button
                      onClick={() => setExpandedAmb(expandedAmb === amb.id ? null : amb.id)}
                      className="w-full text-left p-4 sm:p-5 hover:bg-matcha-50/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-matcha-100 rounded-full flex items-center justify-center text-matcha-600 font-bold text-sm">
                            {amb.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-matcha-900 font-semibold text-sm">{amb.name}</h3>
                            <p className="text-matcha-500 text-xs">
                              {amb.instagram || amb.email}
                              {!amb.active && <span className="ml-2 text-red-400">(inactivo)</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 text-xs">
                          <div className="text-center">
                            <p className="text-matcha-400 uppercase tracking-wider text-[10px]">Ventas</p>
                            <p className="text-matcha-900 font-bold">{formatCLP(amb.stats.totalRevenue)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-matcha-400 uppercase tracking-wider text-[10px]">Comision</p>
                            <p className="text-matcha-700 font-bold">{formatCLP(amb.stats.totalCommission)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-matcha-400 uppercase tracking-wider text-[10px]">Referidos</p>
                            <p className="text-matcha-900 font-bold">{amb.stats.totalReferrals}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-matcha-400 uppercase tracking-wider text-[10px]">Codigos</p>
                            <p className="text-matcha-900 font-bold">{amb.stats.activeCodes}</p>
                          </div>
                          <svg className={`w-4 h-4 text-matcha-400 transition-transform ${expandedAmb === amb.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {expandedAmb === amb.id && (
                      <div className="border-t border-matcha-100 p-4 sm:p-5 bg-matcha-50/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-matcha-600 mb-4">
                          <div>
                            <p><span className="text-matcha-400">Email:</span> {amb.email}</p>
                            <p><span className="text-matcha-400">Usuario:</span> {amb.username}</p>
                            {amb.phone && <p><span className="text-matcha-400">Telefono:</span> {amb.phone}</p>}
                            <p><span className="text-matcha-400">Desde:</span> {new Date(amb.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                          <div>
                            <p><span className="text-matcha-400">Usos totales de codigos:</span> {amb.stats.totalCodesUsed}</p>
                            <p><span className="text-matcha-400">Codigos activos:</span> {amb.stats.activeCodes}</p>
                          </div>
                        </div>

                        {/* Codes table */}
                        {amb.codes.length > 0 && (
                          <div>
                            <p className="text-matcha-700 font-semibold text-xs mb-2 uppercase tracking-wider">Codigos de descuento</p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-matcha-400 text-[10px] uppercase tracking-wider border-b border-matcha-100">
                                    <th className="text-left pb-2 font-medium">Codigo</th>
                                    <th className="text-center pb-2 font-medium">Descuento</th>
                                    <th className="text-center pb-2 font-medium">Usos</th>
                                    <th className="text-center pb-2 font-medium">Estado</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {amb.codes.map((dc) => (
                                    <tr key={dc.id} className="border-b border-matcha-50">
                                      <td className="py-2 font-mono text-matcha-700 font-semibold">{dc.code}</td>
                                      <td className="py-2 text-center text-matcha-600">{dc.discountPercent}%</td>
                                      <td className="py-2 text-center text-matcha-600">{dc.timesUsed}</td>
                                      <td className="py-2 text-center">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                          dc.active ? "bg-matcha-50 text-matcha-600 border border-matcha-200" : "bg-red-50 text-red-400 border border-red-200"
                                        }`}>
                                          {dc.active ? "Activo" : "Inactivo"}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
