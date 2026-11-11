import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * PaySure AI Official Brand Logo: "The AI Gateway"
 * Dual convergent fintech chevrons focusing into a bright central AI routing node.
 * Represents lightning-fast AI routing, confident verification, and instant settlement.
 */
export function PaySureLogo({ className = "h-9 w-9", size = 36 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gateGrad1" x1="15" y1="20" x2="65" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="gateGrad2" x1="35" y1="20" x2="85" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      {/* Left Chevron (Verification & Routing) */}
      <path
        d="M24 28L44 48L24 68"
        stroke="url(#gateGrad1)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Chevron (Settlement Execution) */}
      <path
        d="M48 28L68 48L48 68"
        stroke="url(#gateGrad2)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Intelligence Node */}
      <circle cx="78" cy="48" r="5" fill="#38BDF8" />
    </svg>
  );
}

// Backward-compatible aliases
export const LogoAiGateway = PaySureLogo;
export const LogoVerifiedShield = PaySureLogo;
