import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MatchaIcon from "../components/MatchaIcon";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-cream py-10 sm:py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="animate-fade-up space-y-4 sm:space-y-6">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-matcha-950 leading-tight">
                Tu 4to matcha es{" "}
                <span className="text-matcha-500 italic">GRATIS</span>
              </h1>
              <p className="text-matcha-700 text-base sm:text-lg md:text-xl leading-relaxed max-w-lg">
                En MatchaLab premiamos tu lealtad. Por cada 3 matchas que compres, el cuarto va por nuestra cuenta. Así de simple, así de rico.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex justify-center bg-matcha-600 hover:bg-matcha-700 text-white font-semibold py-3.5 px-8 rounded-full text-center transition-all shadow-lg shadow-matcha-300/30 active:scale-[0.98]"
                  >
                    Ir a mi dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex justify-center bg-matcha-600 hover:bg-matcha-700 text-white font-semibold py-3.5 px-8 rounded-full text-center transition-all shadow-lg shadow-matcha-300/30 active:scale-[0.98]"
                    >
                      Crear mi cuenta
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex justify-center bg-white hover:bg-matcha-50 text-matcha-700 font-semibold py-3.5 px-8 rounded-full text-center transition-all border-2 border-matcha-300 active:scale-[0.98]"
                    >
                      Ya tengo cuenta
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Visual - Loyalty Progress */}
            <div className="animate-fade-up flex justify-center" style={{ animationDelay: "200ms", opacity: 0 }}>
              <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-matcha-100 w-full max-w-md">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="flex flex-col items-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-[3px] border-matcha-500 bg-matcha-50 flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-matcha-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <p className="font-bold text-matcha-800 mt-1.5 sm:mt-2 text-xs sm:text-sm">Matcha {num}</p>
                      <p className="text-[10px] sm:text-xs text-matcha-500">Suma 1 punto</p>
                    </div>
                  ))}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-matcha-600 flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <p className="font-bold text-matcha-600 mt-1.5 sm:mt-2 text-xs sm:text-sm">GRATIS!</p>
                    <p className="text-[10px] sm:text-xs text-matcha-500">Tu matcha de regalo</p>
                  </div>
                </div>
                {/* Progress line */}
                <div className="relative h-1 bg-matcha-100 rounded-full -mt-2 mb-4 mx-4 sm:mx-8">
                  <div className="absolute inset-0 bg-matcha-400 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                num: "1",
                title: "Compra tu matcha",
                desc: "Cada vez que compres un matcha en nuestro bar o en línea, acumulas un punto automáticamente.",
              },
              {
                num: "2",
                title: "Junta 3 puntos",
                desc: "Después de tu tercer matcha, desbloqueas tu recompensa. ¡Estás a un sorbo de distancia!",
              },
              {
                num: "3",
                title: "4to matcha gratis",
                desc: "Disfruta tu cuarto matcha completamente gratis. El ciclo se reinicia y puedes seguir acumulando.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="animate-fade-up text-center bg-cream rounded-2xl p-6 sm:p-8 border border-matcha-100"
                style={{ animationDelay: `${i * 150}ms`, opacity: 0 }}
              >
                <div className="w-12 h-12 rounded-full bg-matcha-100 text-matcha-700 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step.num === "3" ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <h3 className="font-display font-bold text-lg text-matcha-900 mb-2">{step.title}</h3>
                <p className="text-matcha-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-matcha-500 text-sm mt-8 italic">
            *Válido en todas las compras de Matcha To Go en nuestro bar de Taller 1, Providencia.
          </p>
        </div>
      </section>

      {/* Nuestro Matcha */}
      <section className="bg-cream py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-matcha-950 leading-tight">
                Nuestro <span className="italic text-matcha-600">Matcha</span>
              </h2>
              <p className="text-matcha-700 leading-relaxed">
                En MatchaLab trabajamos exclusivamente con matcha de grado premium japonés, cultivado en las regiones de Uji y Nishio en Japón. Nuestro matcha es seleccionado cuidadosamente para garantizar el color verde vibrante, el aroma fresco y el sabor umami que caracterizan al auténtico matcha japonés.
              </p>
              <p className="text-matcha-700 leading-relaxed">
                Traemos el mejor matcha de Chile directamente desde Japón, sin intermediarios, asegurando la máxima frescura y calidad en cada lote. Nuestro compromiso es ofrecerte una experiencia de matcha auténtica, como si estuvieras en una ceremonia del té en Kioto.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {["Grado Premium Japonés", "Importado de Japón", "100% Orgánico"].map((tag) => (
                  <span
                    key={tag}
                    className="text-sm font-medium text-matcha-700 border border-matcha-300 rounded-full px-4 py-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="col-span-2 h-48 sm:h-64 rounded-2xl overflow-hidden">
                <img src="/matcha_uber_eats_cover.jpg" alt="MatchaLab en Uber Eats" className="w-full h-full object-cover" />
              </div>
              <div className="h-28 sm:h-40 rounded-2xl overflow-hidden">
                <img src="/matchatogo.png" alt="Matcha To Go" className="w-full h-full object-cover" />
              </div>
              <div className="h-28 sm:h-40 rounded-2xl overflow-hidden">
                <img src="/matchawhisk.png" alt="Matcha Whisk" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-end mb-6 sm:mb-10">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-matcha-950">
              Nuestro <span className="italic text-matcha-600">Blog</span>
            </h2>
            <Link to="/blog" className="text-matcha-600 hover:text-matcha-700 font-medium text-sm transition-colors">
              Ver todos &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: "Energía Sostenida sin el Crash del Café", cat: "Energía & Bienestar", time: "5 min", slug: "matcha-energia-sostenida", img: "/barista.png" },
              { title: "Cómo el Matcha está Cambiando el Bienestar en Chile", cat: "Bienestar", time: "7 min", slug: "matcha-bienestar-chile", img: "/matchateam.png" },
              { title: "Escasez Mundial de Matcha y Sustentabilidad", cat: "Sustentabilidad", time: "8 min", slug: "escasez-matcha-sustentabilidad", img: "/escazes-matcha.png" },
            ].map((post, i) => (
              <Link
                key={i}
                to={`/blog/${post.slug}`}
                className="group bg-cream rounded-2xl overflow-hidden border border-matcha-100 hover:shadow-lg transition-all"
              >
                <div className="h-40 overflow-hidden">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-matcha-600 bg-matcha-100 px-2.5 py-1 rounded-full">
                    {post.cat}
                  </span>
                  <h3 className="font-display font-bold text-matcha-900 mt-3 mb-2 group-hover:text-matcha-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-matcha-500">{post.time} de lectura</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
