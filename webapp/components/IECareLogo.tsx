"use client";

/**
 * IECare Logo Component
 * 
 * A professional healthcare-themed logo combining IE University identity
 * with medical symbolism. Designed for dark backgrounds.
 * 
 * Props:
 *  - size: "sm" (navbar) | "lg" (landing page hero)
 * 
 * TO USE THE OFFICIAL IE UNIVERSITY LOGO:
 * Replace the <IELettermark /> placeholder below with an <Image> or <img>
 * tag pointing to the official IE logo asset, e.g.:
 *   <Image src="/ie-logo-white.svg" alt="IE University" width={28} height={28} />
 */

import { motion } from "framer-motion";

/* ── IE Lettermark placeholder ──────────────────────────────────────────────
   This renders a clean "IE" text mark. Replace with the official IE University
   logo SVG/PNG when available. Keep the same dimensions so layout is preserved.
   ──────────────────────────────────────────────────────────────────────────── */
function IELettermark({ size }: { size: number }) {
  return (
    <text
      x="50%"
      y="52%"
      dominantBaseline="central"
      textAnchor="middle"
      fill="white"
      fontFamily="var(--font-geist-sans), system-ui, sans-serif"
      fontWeight="800"
      fontSize={size}
      letterSpacing="-0.5"
    >
      IE
    </text>
  );
}

export default function IECareLogo({
  size = "sm",
}: {
  size?: "sm" | "lg";
}) {
  const isLarge = size === "lg";
  const badgeSize = isLarge ? 56 : 36;
  const fontSize = isLarge ? "text-2xl" : "text-[17px]";
  const subtitleSize = isLarge ? "text-[11px]" : "text-[8px]";

  return (
    <motion.div
      className="flex items-center gap-3 group select-none"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      role="img"
      aria-label="IECare — Hospital Resource Optimizer"
    >
      {/* ── Badge / Icon ─────────────────────────────────────────────── */}
      <div
        className="relative flex-shrink-0"
        style={{ width: badgeSize, height: badgeSize }}
      >
        <svg
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          <defs>
            {/* Gradient for the badge border */}
            <linearGradient id="badge-gradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            {/* Subtle inner glow */}
            <radialGradient id="inner-glow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#090b12" stopOpacity="0" />
            </radialGradient>
            {/* Outer glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer rounded-square shape */}
          <rect
            x="3"
            y="3"
            width="74"
            height="74"
            rx="20"
            fill="#0c0f18"
            stroke="url(#badge-gradient)"
            strokeWidth="2"
          />

          {/* Inner glow */}
          <rect x="3" y="3" width="74" height="74" rx="20" fill="url(#inner-glow)" />

          {/* Small medical cross — top-right area */}
          <g opacity="0.35">
            <rect x="54" y="13" width="2.5" height="10" rx="1" fill="#38bdf8" />
            <rect x="50.25" y="16.75" width="10" height="2.5" rx="1" fill="#38bdf8" />
          </g>

          {/* ECG / heartbeat line — bottom area */}
          <polyline
            points="10,58 20,58 24,52 28,64 32,55 36,58 42,58"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />

          {/* ── IE Lettermark (replace with official IE logo) ── */}
          <IELettermark size={isLarge ? 28 : 26} />

          {/* Small shield accent — bottom-right */}
          <path
            d="M60 56 C60 52, 66 52, 66 56 C66 60, 63 63, 63 63 C63 63, 60 60, 60 56Z"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            opacity="0.25"
          />
        </svg>

        {/* Animated glow ring on hover */}
        <div className="absolute inset-0 rounded-[28%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: "0 0 20px 2px rgba(56,189,248,0.15), 0 0 40px 4px rgba(59,130,246,0.08)",
          }}
        />
      </div>

      {/* ── Text lockup ──────────────────────────────────────────────── */}
      <div className="flex flex-col justify-center leading-none">
        <span className={`${fontSize} font-bold tracking-tight`}>
          <span className="text-white">IE</span>
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Care
          </span>
        </span>
        {isLarge && (
          <span className={`${subtitleSize} mt-1 font-medium tracking-widest uppercase text-slate-500`}>
            Hospital Resource Optimizer
          </span>
        )}
      </div>
    </motion.div>
  );
}
