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
    <img
      src="/logo.png"
      alt="PaySure AI"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`rounded-lg object-contain shrink-0 ${className}`}
    />
  );
}

// Backward-compatible aliases
export const LogoAiGateway = PaySureLogo;
export const LogoVerifiedShield = PaySureLogo;
