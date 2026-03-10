import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import MatchaIcon from "../components/MatchaIcon";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 flex flex-col items-center py-12 animate-fade-up">
      <div className="w-16 h-16 bg-matcha-100 rounded-full flex items-center justify-center mb-4">
        <MatchaIcon size={36} />
      </div>

      {sent ? (
        <div className="text-center">
          <h1 className="font-display text-3xl text-matcha-950 mb-2 font-bold">Revisa tu email</h1>
          <p className="text-matcha-600 mb-6">
            Si el email <span className="font-semibold">{email}</span> esta registrado, recibiras instrucciones para recuperar tu contrasena.
          </p>
          <p className="text-matcha-500 text-sm mb-6">
            Si no recibes el email, contacta al administrador.
          </p>
          <Link
            to="/login"
            className="text-matcha-700 font-semibold hover:underline text-sm"
          >
            Volver a iniciar sesion
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-3xl text-matcha-950 mb-2 font-bold">Recuperar contrasena</h1>
          <p className="text-matcha-600 mb-8">Ingresa tu email para recibir un enlace de recuperacion</p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-matcha-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 bg-white border-2 border-matcha-100 rounded-xl focus:border-matcha-400 focus:outline-none transition-colors text-matcha-900 placeholder:text-matcha-300"
                placeholder="tu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-matcha-600 hover:bg-matcha-700 disabled:bg-matcha-300 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-matcha-200 active:scale-[0.98] mt-2"
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperacion"}
            </button>
          </form>

          <p className="mt-6 text-matcha-500 text-sm">
            <Link to="/login" className="text-matcha-700 font-semibold hover:underline">
              Volver a iniciar sesion
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
