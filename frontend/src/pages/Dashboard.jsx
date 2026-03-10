import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { purchaseAPI, ticketAPI, discountAPI } from "../services/api";
import TicketDisplay from "../components/TicketDisplay";
import MatchaIcon from "../components/MatchaIcon";
import ProximityBanner from "../components/ProximityBanner";
import { useGeofence } from "../hooks/useGeofence";

export default function Dashboard() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [ticketCount, setTicketCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [activatingCode, setActivatingCode] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const proximityInfo = useGeofence(user);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) loadTickets();
  }, [user, authLoading]);

  const loadTickets = async () => {
    try {
      const { data } = await ticketAPI.getAll();
      setTicketCount(data.available);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Imagen muy grande (máx. 5MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      showMessage("Selecciona una imagen primero", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("voucher", file);
      await purchaseAPI.create(formData);
      showMessage("¡Compra verificada y registrada! +1 punto");
      setPreview(null);
      fileRef.current.value = "";
      await loadTickets();
    } catch (err) {
      showMessage(err.response?.data?.error || "Error al subir voucher", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRedeem = async () => {
    if (ticketCount < 3) return;
    setRedeeming(true);
    try {
      const { data } = await ticketAPI.redeem();
      showMessage(data.message || "¡Tu 4to matcha es gratis!");
      setTicketCount(data.ticketsRemaining);
    } catch (err) {
      showMessage(err.response?.data?.error || "Error al canjear", "error");
    } finally {
      setRedeeming(false);
    }
  };

  const handleActivateDiscount = async (e) => {
    e.preventDefault();
    if (!discountCode.trim()) return;
    setActivatingCode(true);
    try {
      const { data } = await discountAPI.activate(discountCode.trim());
      setActiveVoucher(data.voucher);
      setDiscountCode("");
    } catch (err) {
      showMessage(err.response?.data?.error || "Código inválido", "error");
    } finally {
      setActivatingCode(false);
    }
  };

  // Voucher countdown
  useEffect(() => {
    if (!activeVoucher) return;
    const interval = setInterval(() => {
      const now = new Date();
      const expires = new Date(activeVoucher.expiresAt);
      if (now >= expires) {
        setActiveVoucher(null);
        showMessage("Tu voucher ha expirado", "error");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeVoucher]);

  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-matcha-200 border-t-matcha-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 sm:py-8 space-y-5 sm:space-y-6 animate-fade-up">
      {/* Message toast */}
      {message && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-lg text-sm font-medium animate-fade-up max-w-[90vw] ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-matcha-50 text-matcha-800 border border-matcha-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Greeting */}
      <div className="text-center">
        <p className="text-matcha-500 text-sm font-medium">Bienvenido</p>
        <h1 className="font-display text-2xl text-matcha-950 font-bold">
          Hola, {user?.username}
        </h1>
      </div>

      {/* Loyalty Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-matcha-700 via-matcha-600 to-matcha-800 p-4 sm:p-6 shadow-xl shadow-matcha-300/30">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <pattern id="leaves" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="8" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#leaves)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div>
              <p className="text-matcha-200 text-[10px] sm:text-xs font-medium tracking-widest uppercase">
                Tarjeta de fidelidad
              </p>
              <p className="text-white font-display text-lg sm:text-xl mt-1 font-bold">MatchaLab Rewards</p>
            </div>
            <MatchaIcon size={28} className="sm:w-9 sm:h-9" />
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4">
            <TicketDisplay count={ticketCount} max={3} />
          </div>
        </div>
      </div>

      {/* Active Voucher Fullscreen */}
      {activeVoucher && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-matcha-700 via-matcha-600 to-matcha-800 flex flex-col items-center justify-center p-6">
          <button
            onClick={() => setActiveVoucher(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center text-lg hover:bg-white/30"
          >
            ✕
          </button>

          <div className="text-center text-white mb-6">
            <p className="text-matcha-200 text-xs font-medium tracking-widest uppercase mb-1">MatchaLab</p>
            <h2 className="font-display text-2xl font-bold">Voucher de Descuento</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-matcha-100 rounded-full mb-3">
                <span className="text-3xl">🍵</span>
              </div>
              <p className="text-5xl font-display font-bold text-matcha-700">
                {activeVoucher.discountPercent}%
              </p>
              <p className="text-matcha-500 text-sm font-medium mt-1">de descuento</p>
            </div>

            <div className="bg-matcha-50 rounded-2xl p-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-matcha-500">Código</span>
                <span className="font-bold text-matcha-900 font-mono">{activeVoucher.code}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-matcha-500">Embajador</span>
                <span className="font-semibold text-matcha-800">{activeVoucher.ambassadorName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-matcha-500">Activado</span>
                <span className="font-medium text-matcha-800">
                  {new Date(activeVoucher.activatedAt).toLocaleString("es-CL", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit", second: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-matcha-500">Válido hasta</span>
                <span className="font-medium text-matcha-800">
                  {new Date(activeVoucher.expiresAt).toLocaleTimeString("es-CL", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <VoucherCountdown expiresAt={activeVoucher.expiresAt} />

            <div className="mt-4 text-center">
              <p className="text-matcha-400 text-[11px]">
                ID: {activeVoucher.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <p className="text-matcha-200 text-xs mt-6 text-center max-w-xs">
            Muestra esta pantalla al personal de MatchaLab para aplicar tu descuento
          </p>
        </div>
      )}

      {/* Discount Code Input */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-matcha-100">
        <h2 className="font-display text-lg text-matcha-900 mb-1 font-bold">
          Código de descuento
        </h2>
        <p className="text-matcha-500 text-xs mb-4">
          Ingresa un código de embajador para obtener 10% de descuento
        </p>
        <form onSubmit={handleActivateDiscount} className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="MATCHA-XXXXXX"
            className="flex-1 px-4 py-3 bg-matcha-50 border-2 border-matcha-100 rounded-xl focus:border-matcha-400 focus:outline-none transition-colors text-matcha-900 placeholder:text-matcha-300 font-mono text-sm"
          />
          <button
            type="submit"
            disabled={activatingCode || !discountCode.trim()}
            className="bg-matcha-600 hover:bg-matcha-700 disabled:bg-matcha-300 text-white font-semibold px-5 py-3 rounded-xl transition-all active:scale-[0.98] whitespace-nowrap text-sm"
          >
            {activatingCode ? "..." : "Activar"}
          </button>
        </form>
      </div>

      {/* Upload voucher */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-matcha-100">
        <h2 className="font-display text-lg text-matcha-900 mb-4 font-bold">
          Registrar compra
        </h2>

        <div className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          {preview ? (
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={preview}
                alt="Preview voucher"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          ) : (
            <label
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-matcha-200 rounded-2xl cursor-pointer hover:border-matcha-400 hover:bg-matcha-50/50 transition-all"
            >
              <svg className="w-8 h-8 text-matcha-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <span className="text-matcha-600 font-medium text-sm">
                Sube tu boleta de MatchaLab
              </span>
              <span className="text-matcha-400 text-xs mt-1">Foto de la boleta - JPG, PNG, WebP</span>
            </label>
          )}

          {preview && (
            <p className="text-xs text-matcha-500 text-center">
              Verificaremos automáticamente que sea una boleta de MatchaLab
            </p>
          )}

          {preview && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-matcha-600 hover:bg-matcha-700 disabled:bg-matcha-300 text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.98]"
            >
              {uploading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Subiendo...
                </span>
              ) : (
                "Registrar compra"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Redeem */}
      {ticketCount >= 3 && (
        <div className="animate-scale-in">
          <button
            onClick={handleRedeem}
            disabled={redeeming}
            className="w-full bg-gradient-to-r from-matcha-500 to-matcha-700 hover:from-matcha-600 hover:to-matcha-800 text-white font-bold py-5 rounded-3xl shadow-xl shadow-matcha-300/40 transition-all active:scale-[0.98] text-lg"
          >
            {redeeming ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Canjeando...
              </span>
            ) : (
              "Canjear Mi Matcha Gratis"
            )}
          </button>
        </div>
      )}

      {/* Proximity notification */}
      <ProximityBanner info={proximityInfo} />

      {/* Ambassador link */}
      {user?.isAmbassador && (
        <div className="mt-6 bg-matcha-50 border border-matcha-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-matcha-900 font-semibold text-sm">Eres embajador</p>
            <p className="text-matcha-500 text-xs mt-0.5">Gestiona tus codigos y comisiones.</p>
          </div>
          <Link
            to="/embajadores/dashboard"
            className="bg-matcha-600 hover:bg-matcha-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Mi Panel
          </Link>
        </div>
      )}
    </div>
  );
}

function VoucherCountdown({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires - now;
      if (diff <= 0) {
        setTimeLeft("Expirado");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const expired = timeLeft === "Expirado";

  return (
    <div className={`text-center py-3 rounded-xl ${expired ? "bg-red-50" : "bg-matcha-50"}`}>
      <p className={`text-xs font-medium ${expired ? "text-red-400" : "text-matcha-400"}`}>
        Tiempo restante
      </p>
      <p className={`text-2xl font-bold font-mono ${expired ? "text-red-600" : "text-matcha-700"}`}>
        {timeLeft}
      </p>
    </div>
  );
}
