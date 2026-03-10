import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../services/api";
import MatchaIcon from "../components/MatchaIcon";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await authAPI.login(form);
      login({ ...data.user, ticketCount: data.ticketCount }, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 flex flex-col items-center py-12 animate-fade-up">
      <div className="w-16 h-16 bg-matcha-100 rounded-full flex items-center justify-center mb-4">
        <MatchaIcon size={36} />
      </div>
      <h1 className="font-display text-3xl text-matcha-950 mb-2 font-bold">Bienvenido</h1>
      <p className="text-matcha-600 mb-8">Inicia sesión para ver tus puntos</p>

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
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full px-4 py-3.5 bg-white border-2 border-matcha-100 rounded-xl focus:border-matcha-400 focus:outline-none transition-colors text-matcha-900 placeholder:text-matcha-300"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matcha-700 mb-1.5">Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="w-full px-4 py-3.5 bg-white border-2 border-matcha-100 rounded-xl focus:border-matcha-400 focus:outline-none transition-colors text-matcha-900 placeholder:text-matcha-300"
            placeholder="Tu contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-matcha-600 hover:bg-matcha-700 disabled:bg-matcha-300 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-matcha-200 active:scale-[0.98] mt-2"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Entrando...
            </span>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      <p className="mt-6 text-matcha-500 text-sm">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="text-matcha-700 font-semibold hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
