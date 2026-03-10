import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MatchaIcon from "./MatchaIcon";
import InstallBanner from "./InstallBanner";

const navLinks = [
  { to: "/blog", label: "Blog" },
  { to: "/embajadores", label: "Embajadores" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-matcha-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-1.5 sm:gap-2">
            <MatchaIcon size={28} className="sm:w-8 sm:h-8" />
            <span className="font-display text-matcha-900 text-lg sm:text-xl font-bold italic">MatchaLab</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-matcha-600" : "text-matcha-800 hover:text-matcha-600"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? "text-matcha-600" : "text-matcha-800 hover:text-matcha-600"
                    }`
                  }
                >
                  Mi Cuenta
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-sm text-matcha-600 hover:text-matcha-800 font-medium transition-colors border border-matcha-300 rounded-full px-4 py-1.5"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-white bg-matcha-600 hover:bg-matcha-700 px-5 py-2 rounded-full transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Menu"
          >
            <span className={`w-6 h-0.5 bg-matcha-800 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`w-6 h-0.5 bg-matcha-800 transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`w-6 h-0.5 bg-matcha-800 transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-matcha-100 bg-cream/98 backdrop-blur-md">
            <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="text-matcha-800 font-medium py-2 border-b border-matcha-50"
                >
                  {link.label}
                </NavLink>
              ))}
              {user ? (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="text-matcha-800 font-medium py-2 border-b border-matcha-50"
                  >
                    Mi Cuenta
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="text-matcha-600 font-medium py-2 text-left"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-matcha-800 font-medium py-2 border-b border-matcha-50"
                  >
                    Iniciar sesión
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-center text-white bg-matcha-600 font-medium py-3 rounded-full mt-2"
                  >
                    Crear cuenta
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-matcha-50 border-t border-matcha-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <MatchaIcon size={28} />
                <span className="font-display text-xl font-bold italic text-matcha-700">MatchaLab</span>
              </div>
              <p className="text-matcha-500 text-sm leading-relaxed">
                El mejor matcha japonés premium de Chile. Matcha enlatado listo para llevar, bar de matcha y coworking gratuito en Taller 1, Providencia.
              </p>
            </div>

            {/* Nav */}
            <div>
              <h4 className="font-semibold text-matcha-700 text-sm uppercase tracking-wider mb-4">Navegación</h4>
              <ul className="space-y-2 text-sm text-matcha-500">
                <li><Link to="/" className="hover:text-matcha-700 transition-colors">Productos</Link></li>
                <li><Link to="/" className="hover:text-matcha-700 transition-colors">Nuestro Matcha</Link></li>
                <li><Link to="/" className="hover:text-matcha-700 transition-colors">Beneficios</Link></li>
                <li><Link to="/" className="hover:text-matcha-700 transition-colors">Delivery</Link></li>
              </ul>
            </div>

            {/* More */}
            <div>
              <h4 className="font-semibold text-matcha-700 text-sm uppercase tracking-wider mb-4">Más</h4>
              <ul className="space-y-2 text-sm text-matcha-500">
                <li><Link to="/blog" className="hover:text-matcha-700 transition-colors">Blog</Link></li>
                <li><Link to="/embajadores" className="hover:text-matcha-700 transition-colors">Embajadores</Link></li>
                <li><Link to="/" className="hover:text-matcha-700 transition-colors">Contacto</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-matcha-700 text-sm uppercase tracking-wider mb-4">Encuéntranos</h4>
              <ul className="space-y-2 text-sm text-matcha-500">
                <li>General Salvo 20, Taller 1</li>
                <li>Providencia, Santiago, Chile</li>
                <li className="pt-2">
                  <a href="mailto:rai@zenlab.cl" className="hover:text-matcha-700 transition-colors">rai@zenlab.cl</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 pt-6 border-t border-matcha-200 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs text-matcha-400">
              &copy; {new Date().getFullYear()} MatchaLab by ZenLab. Todos los derechos reservados.
            </p>
            <p className="text-sm font-semibold text-matcha-600">#MatchaToGo</p>
          </div>
        </div>
      </footer>

      {/* PWA Install Banner */}
      <InstallBanner />
    </div>
  );
}
