import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { applicationAPI } from "../services/api";

export default function Embajadores() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    instagram: "",
    seguidores: "",
    mensaje: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await applicationAPI.submit({
        name: form.nombre,
        email: form.email,
        instagram: form.instagram,
        followers: form.seguidores,
        message: form.mensaje,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.error || "Error al enviar postulación. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-24">
        {/* Ambassador dashboard link for logged-in users */}
        {user && (
          <div className="mb-8 bg-matcha-50 border border-matcha-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-matcha-900 font-semibold text-sm">¿Ya eres embajador?</p>
              <p className="text-matcha-600 text-xs mt-0.5">Accede a tu panel para gestionar códigos y ver comisiones.</p>
            </div>
            <Link
              to="/embajadores/dashboard"
              className="bg-matcha-600 hover:bg-matcha-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              Mi Panel de Embajador
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
          {/* Left - Info */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 text-matcha-700 text-sm font-semibold bg-matcha-100 px-4 py-2 rounded-full mb-6">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Programa Embajadores
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-matcha-950 leading-tight">
                Sé un{" "}
                <span className="text-matcha-600 italic">Embajador</span>
              </h1>
              <p className="text-matcha-600 text-base sm:text-lg mt-3 sm:mt-4 leading-relaxed max-w-md">
                ¿Eres influencer o creador de contenido? Únete a nuestra comunidad de embajadores y colabora con la marca de matcha más innovadora de Chile.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  ),
                  title: "Matcha Gratis",
                  desc: "Productos cada mes",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  ),
                  title: "Código Exclusivo",
                  desc: "Descuento para tu comunidad",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  ),
                  title: "Eventos VIP",
                  desc: "Acceso a lanzamientos",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  ),
                  title: "Comisiones",
                  desc: "15% neto por venta",
                },
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="bg-white border border-matcha-100 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all"
                >
                  <div className="text-matcha-600 mb-3">{benefit.icon}</div>
                  <h3 className="text-matcha-900 font-semibold text-sm">{benefit.title}</h3>
                  <p className="text-matcha-500 text-xs mt-1">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Form */}
          <div className="bg-white border border-matcha-100 rounded-2xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-matcha-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-matcha-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-matcha-900 font-display text-2xl mb-2">Postulación enviada</h3>
                <p className="text-matcha-600">Te contactaremos en 48 horas. Gracias por tu interés.</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl text-matcha-900 mb-2">Postula como Embajador</h2>
                <p className="text-matcha-500 text-sm mb-6">
                  Completa el formulario y nos pondremos en contacto contigo.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-matcha-700 mb-1.5">
                      Tu nombre completo <span className="text-matcha-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                      className="w-full bg-matcha-50/50 border border-matcha-200 text-matcha-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500 placeholder-matcha-300 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-matcha-700 mb-1.5">
                      Tu correo electrónico <span className="text-matcha-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Tu correo electrónico"
                      className="w-full bg-matcha-50/50 border border-matcha-200 text-matcha-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500 placeholder-matcha-300 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-matcha-700 mb-1.5">
                      Tu Instagram <span className="text-matcha-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      required
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="@tu_usuario"
                      className="w-full bg-matcha-50/50 border border-matcha-200 text-matcha-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500 placeholder-matcha-300 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-matcha-700 mb-1.5">
                      Cantidad de seguidores
                    </label>
                    <input
                      type="text"
                      name="seguidores"
                      value={form.seguidores}
                      onChange={handleChange}
                      placeholder="ej: 5,000"
                      className="w-full bg-matcha-50/50 border border-matcha-200 text-matcha-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500 placeholder-matcha-300 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-matcha-700 mb-1.5">
                      ¿Por qué quieres ser embajador?
                    </label>
                    <textarea
                      name="mensaje"
                      rows={4}
                      value={form.mensaje}
                      onChange={handleChange}
                      placeholder="Cuéntanos sobre ti, tu contenido y por qué te apasiona el matcha..."
                      className="w-full bg-matcha-50/50 border border-matcha-200 text-matcha-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500 placeholder-matcha-300 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-matcha-600 hover:bg-matcha-700 disabled:bg-matcha-300 text-white font-bold py-4 rounded-xl transition-colors text-base mt-2"
                  >
                    {sending ? "Enviando..." : "Enviar Postulación"}
                  </button>

                  <p className="text-center text-matcha-400 text-xs mt-3">
                    *Revisamos todas las postulaciones. Te contactaremos en 48 horas.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
