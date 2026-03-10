export default function MatchaIcon({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Steam lines */}
      <path
        d="M22 16 Q22 10 24 6"
        stroke="#a3e635"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M32 14 Q32 8 34 4"
        stroke="#a3e635"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M42 16 Q42 10 40 6"
        stroke="#a3e635"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Bowl */}
      <path
        d="M8 24 C8 24 8 48 32 52 C56 48 56 24 56 24 Z"
        fill="#84cc16"
        stroke="#65a30d"
        strokeWidth="2"
      />
      {/* Matcha liquid surface */}
      <ellipse
        cx="32"
        cy="24"
        rx="24"
        ry="6"
        fill="#a3e635"
        stroke="#65a30d"
        strokeWidth="2"
      />
      {/* Foam detail */}
      <ellipse
        cx="32"
        cy="24"
        rx="18"
        ry="4"
        fill="#bef264"
        opacity="0.6"
      />
      {/* Saucer */}
      <ellipse
        cx="32"
        cy="54"
        rx="28"
        ry="5"
        fill="#d9f99d"
        stroke="#84cc16"
        strokeWidth="1.5"
      />
    </svg>
  );
}
