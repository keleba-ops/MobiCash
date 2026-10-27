export default function VergeDynamicsLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="logoGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {/* Outer diamond */}
      <path d="M50 5 L90 50 L50 95 L10 50 Z" fill="url(#logoGradient1)" opacity="0.9" />
      {/* Inner diamond */}
      <path d="M50 20 L75 50 L50 80 L25 50 Z" fill="url(#logoGradient2)" opacity="0.85" />
      {/* Center accent */}
      <path d="M50 35 L65 50 L50 65 L35 50 Z" fill="white" opacity="0.95" />
      {/* Dynamic lines suggesting movement */}
      <path d="M30 30 L40 40" stroke="white" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <path d="M70 30 L60 40" stroke="white" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <path d="M30 70 L40 60" stroke="white" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <path d="M70 70 L60 60" stroke="white" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}
