import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authAPI } from "../services/api";
import MatchaIcon from "../components/MatchaIcon";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("La contrasena debe tener al menos 6 caracteres");
    }
    if (password !== confirm) {
      return setError("Las contrasenas no coinciden");
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar contrasena");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 flex flex-col items-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-display text-2xl text-matcha-950 mb-2 font-bold">Link invalido</h1>
        <p className="text-matcha-600 mb-6 text-center">Este enlace de recuperacion no es valido. Solicita uno nuevo.</p>
        <Link to="/forgot-password" className="text-matcha-700 font-semibold hover:underline">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 flex flex-col items-center py-12 animate-fade-up">
      <div className="w-16 h-16 bg-matcha-100 rounded-full flex items-center justify-center mb-4">
        <MatchaIcon size={36} />
      </div>

      {success ? (
        <div className="text-center">
          <h1 className="font-display text-3xl text-matcha-950 mb-2 font-bold">Contrasena actualizada</h1>
          <p className="text-matcha-600 mb-6">Tu contrasena ha sido cambiada exitosamente.</p>
          <Link
            to="/login"
            className="inline-flex justify-center bg-matcha-600 hover:bg-matcha-700 text-white font-semibold py-3 px-8 rounded-full transition-all"
          >
            Iniciar sesion
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-3xl text-matcha-950 mb-2 font-bold">Nueva contrasena</h1>
          <p className="text-matcha-600 mb-8">Ingresa tu nueva contrasena</p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-matcha-700 mb-1.5">Nueva contrasena</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3.5 bg-white border-2 border-matcha-100 rounded-xl focus:border-matcha-400 focus:outline-none transition-colors text-matcha-900 placeholder:text-matcha-300"
                placeholder="Minimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-matcha-700 mb-1.5">Confirmar contrasena</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-white border-2 border-matcha-100 rounded-xl focus:border-matcha-400 focus:outline-none transition-colors text-matcha-900 placeholder:text-matcha-300"
                placeholder="Repite tu contrasena"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-matcha-600 hover:bg-matcha-700 disabled:bg-matcha-300 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-matcha-200 active:scale-[0.98] mt-2"
            >
              {loading ? "Guardando..." : "Cambiar contrasena"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
