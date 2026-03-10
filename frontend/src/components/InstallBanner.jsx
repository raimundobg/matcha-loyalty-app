import { useState, useEffect } from "react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      setIsStandalone(true);
      return;
    }

    // Already dismissed this session
    if (sessionStorage.getItem("matcha_install_dismissed")) {
      setDismissed(true);
      return;
    }

    // Register SW early so install prompt can fire
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsStandalone(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("matcha_install_dismissed", "1");
  };

  // On iOS Safari, beforeinstallprompt doesn't fire — show manual hint
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
  const shouldShow = !isStandalone && !dismissed && (deferredPrompt || isIOS);

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4">
      <div className="max-w-lg mx-auto bg-white border border-matcha-200 rounded-2xl shadow-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 bg-matcha-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-matcha-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-matcha-900 font-semibold text-sm leading-snug">
              Descarga la app de MatchaLab
            </p>
            <p className="text-matcha-500 text-xs mt-0.5 leading-relaxed">
              {isIOS
                ? "Toca el boton de compartir y luego \"Agregar a pantalla de inicio\" para recibir ofertas exclusivas."
                : "Recibe siempre las ofertas exclusivas para miembros de la app."}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={handleDismiss}
            className="text-matcha-300 hover:text-matcha-500 transition-colors flex-shrink-0 p-0.5"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Install button (Android/Chrome) or iOS hint */}
        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="w-full mt-3 bg-matcha-600 hover:bg-matcha-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            Instalar App
          </button>
        ) : isIOS ? (
          <div className="mt-3 flex items-center justify-center gap-2 bg-matcha-50 rounded-xl py-2.5 px-3">
            <svg className="w-5 h-5 text-matcha-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="text-matcha-700 text-xs font-medium">
              Compartir {">"} "Agregar a inicio"
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
