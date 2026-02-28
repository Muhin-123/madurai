import logoImage from '../../assets/image.png';

export default function CleanMaduraiLogo({ size = 44, showText = true, className = '', useImage = false }) {
  if (useImage) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img 
          src={logoImage} 
          alt="Clean Madurai Logo" 
          className="rounded-lg object-cover"
          style={{ width: size, height: size }}
        />
        {showText && (
          <div>
            <h1 className="text-sm font-black tracking-wider bg-gradient-to-r from-civic-blue to-civic-green bg-clip-text text-transparent leading-tight">
              CLEAN MADURAI
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight tracking-wide">
              Smart City Command
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#E67E22" />
          </linearGradient>
          <linearGradient id="logoGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFED4E" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Kalasam (sacred pot at peak) ── */}
        <ellipse cx="22" cy="4" rx="2.5" ry="3" fill="url(#logoGreen)" filter="url(#glow)" />
        <rect x="20.5" y="7" width="3" height="2" rx="0.5" fill="url(#logoGreen)" />

        {/* ── Gopuram tiers (getting wider top→bottom) ── */}
        {/* Tier 1 */}
        <rect x="18" y="9" width="8" height="2.5" rx="0.4" fill="url(#logoBlue)" />
        {/* Tier 1 decorative niches */}
        <rect x="19.5" y="9.5" width="1" height="1.5" rx="0.2" fill="rgba(255,255,255,0.25)" />
        <rect x="23.5" y="9.5" width="1" height="1.5" rx="0.2" fill="rgba(255,255,255,0.25)" />

        {/* Tier 2 */}
        <rect x="16" y="11.5" width="12" height="2.5" rx="0.4" fill="url(#logoBlue)" />
        <rect x="17.5" y="12" width="1" height="1.5" rx="0.2" fill="rgba(255,255,255,0.25)" />
        <rect x="21" y="12" width="1" height="1.5" rx="0.2" fill="rgba(255,255,255,0.25)" />
        <rect x="24.5" y="12" width="1" height="1.5" rx="0.2" fill="rgba(255,255,255,0.25)" />

        {/* Tier 3 */}
        <rect x="13.5" y="14" width="17" height="3" rx="0.4" fill="url(#logoBlue)" />
        <rect x="15" y="14.5" width="1" height="2" rx="0.2" fill="rgba(255,255,255,0.25)" />
        <rect x="18.5" y="14.5" width="1" height="2" rx="0.2" fill="rgba(255,255,255,0.25)" />
        <rect x="22" y="14.5" width="1" height="2" rx="0.2" fill="rgba(255,255,255,0.25)" />
        <rect x="25.5" y="14.5" width="1" height="2" rx="0.2" fill="rgba(255,255,255,0.25)" />
        <rect x="28.5" y="14.5" width="1" height="2" rx="0.2" fill="rgba(255,255,255,0.25)" />

        {/* Tier 4 */}
        <rect x="11" y="17" width="22" height="3" rx="0.4" fill="#FF8C00" />
        <rect x="12.5" y="17.5" width="1.5" height="2" rx="0.2" fill="rgba(255,255,255,0.2)" />
        <rect x="16" y="17.5" width="1.5" height="2" rx="0.2" fill="rgba(255,255,255,0.2)" />
        <rect x="21" y="17.5" width="1.5" height="2" rx="0.2" fill="rgba(255,255,255,0.2)" />
        <rect x="25.5" y="17.5" width="1.5" height="2" rx="0.2" fill="rgba(255,255,255,0.2)" />
        <rect x="29.5" y="17.5" width="1.5" height="2" rx="0.2" fill="rgba(255,255,255,0.2)" />

        {/* Main sanctum body */}
        <rect x="9" y="20" width="26" height="5" rx="0.5" fill="#0d3d6b" />
        {/* Sanctum doorway */}
        <rect x="20" y="21" width="4" height="4" rx="0.8" fill="rgba(255,255,255,0.12)" />

        {/* Step platform */}
        <rect x="7" y="25" width="30" height="2" rx="0.5" fill="#E67E22" />
        <rect x="5" y="27" width="34" height="1.5" rx="0.5" fill="#E67E22" />

        {/* ── Eco leaf / green base ── */}
        <path
          d="M14 32 Q22 27.5 30 32 Q22 37 14 32Z"
          fill="url(#logoGreen)"
          opacity="0.95"
        />
        {/* Leaf vein */}
        <path
          d="M18 31.5 Q22 29.5 26 31.5"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="0.7"
          fill="none"
          strokeLinecap="round"
        />
        <line
          x1="22"
          y1="29.5"
          x2="22"
          y2="34.5"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5"
        />

        {/* Recycling dots at leaf tips */}
        <circle cx="14.5" cy="32" r="1" fill="#FFED4E" />
        <circle cx="29.5" cy="32" r="1" fill="#FFED4E" />
        <circle cx="22" cy="36.5" r="1" fill="#FFD700" />
      </svg>

      {showText && (
        <div>
          <h1 className="text-sm font-black tracking-wider bg-gradient-to-r from-civic-blue to-civic-green bg-clip-text text-transparent leading-tight">
            CLEAN MADURAI
          </h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight tracking-wide">
            Smart City Command
          </p>
        </div>
      )}
    </div>
  );
}
