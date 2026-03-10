import { useState } from "react";

export default function ProximityBanner({ info }) {
  const [dismissed, setDismissed] = useState(false);

  if (!info?.nearby || dismissed) return null;

  return (
    <div className="animate-fade-up fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="bg-gradient-to-r from-matcha-600 to-matcha-700 rounded-2xl p-4 shadow-2xl shadow-matcha-500/30 text-white relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-3 text-white/60 hover:text-white text-lg"
        >
          ✕
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm">{info.message?.title}</p>
            <p className="text-white/80 text-xs mt-1 leading-relaxed">{info.message?.body}</p>
            {info.distance && (
              <p className="text-matcha-200 text-xs mt-2 font-medium">
                Estás a {info.distance}m de MatchaLab
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
