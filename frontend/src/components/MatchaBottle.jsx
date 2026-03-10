export default function MatchaBottle({ filled = false, index = 0 }) {
  return (
    <div
      className="animate-scale-in"
      style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
    >
      <svg
        width="52"
        height="72"
        viewBox="0 0 52 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md transition-transform duration-200 hover:scale-110"
      >
        {/* Cap */}
        <rect
          x="18"
          y="2"
          width="16"
          height="10"
          rx="3"
          fill={filled ? "#496321" : "#D1D5DB"}
          stroke={filled ? "#3B5118" : "#9CA3AF"}
          strokeWidth="1.5"
        />
        {/* Neck */}
        <path
          d="M20 12 L20 18 Q14 20 14 24 L14 24"
          fill="none"
          stroke={filled ? "#5A7A2E" : "#9CA3AF"}
          strokeWidth="1.5"
        />
        <path
          d="M32 12 L32 18 Q38 20 38 24 L38 24"
          fill="none"
          stroke={filled ? "#5A7A2E" : "#9CA3AF"}
          strokeWidth="1.5"
        />
        {/* Body */}
        <rect
          x="10"
          y="22"
          width="32"
          height="44"
          rx="6"
          fill={filled ? "#6B8F3C" : "#E5E7EB"}
          stroke={filled ? "#496321" : "#9CA3AF"}
          strokeWidth="1.5"
        />
        {/* Label */}
        <rect
          x="15"
          y="32"
          width="22"
          height="18"
          rx="3"
          fill={filled ? "#FFF8F0" : "#F3F4F6"}
          stroke={filled ? "#5A7A2E" : "#D1D5DB"}
          strokeWidth="1"
        />
        {/* Label text - leaf icon */}
        <path
          d={filled
            ? "M26 36 Q22 40 24 44 Q26 42 28 44 Q30 40 26 36Z"
            : "M26 37 Q23 40 25 43 Q26 42 27 43 Q29 40 26 37Z"
          }
          fill={filled ? "#6B8F3C" : "#D1D5DB"}
        />
        {/* Liquid level indicator */}
        {filled && (
          <rect
            x="13"
            y="48"
            width="26"
            height="15"
            rx="4"
            fill="#86efac"
            opacity="0.3"
          />
        )}
        {/* Bottom */}
        <rect
          x="12"
          y="62"
          width="28"
          height="3"
          rx="1.5"
          fill={filled ? "#496321" : "#9CA3AF"}
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
