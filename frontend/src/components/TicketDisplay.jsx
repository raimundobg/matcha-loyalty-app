export default function TicketDisplay({ count = 0, max = 3 }) {
  const dots = Array.from({ length: max }, (_, i) => i < count);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-lg border border-matcha-100">
      <div className="text-center mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm font-medium text-matcha-700 tracking-wide uppercase">
          Tus Puntos
        </p>
        <p className="text-2xl sm:text-3xl font-display text-matcha-900 mt-1 font-bold">
          {count} <span className="text-base sm:text-lg text-matcha-500">/ {max}</span>
        </p>
      </div>

      <div className="flex justify-center items-center gap-3 sm:gap-4 py-3 sm:py-4">
        {dots.map((filled, i) => (
          <div
            key={i}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-[3px] transition-all ${
              filled
                ? "border-matcha-500 bg-matcha-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${filled ? "text-matcha-600" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        ))}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2">
          <span className="text-matcha-400 text-lg sm:text-xl font-bold">&rarr;</span>
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-matcha-600 flex items-center justify-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 h-2 bg-matcha-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-matcha-400 to-matcha-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${(count / max) * 100}%` }}
        />
      </div>

      {count >= max ? (
        <p className="text-center mt-3 text-matcha-700 font-semibold text-sm sm:text-base animate-pulse">
          ¡Tu 4to matcha es gratis! Canjea ahora.
        </p>
      ) : (
        <p className="text-center mt-3 text-matcha-600 text-xs sm:text-sm">
          {max - count} {max - count === 1 ? "compra más" : "compras más"} para tu matcha gratis
        </p>
      )}
    </div>
  );
}
