"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { useNearWallet } from "@/context/NearWalletContext";

export function Hero() {
  const { isConnected, connect, isConnecting } = useNearWallet();
  const [activeView, setActiveView] = useState<"cop" | "intent" | "treasury">("cop");

  return (
    <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36 bg-canvas">
      {/* Semantic Top Radial Illumination */}
      <div className="hero-ambient-glow absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Minimalist Eyebrow Capsule */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-subtle border border-line-subtle text-[12px] text-ink-muted mb-8 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="font-medium text-ink">Verified Payee Settlement on NEAR</span>
          </div>

          {/* Apple-Inspired Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-semibold tracking-[-0.04em] leading-[1.04] hero-headline-gradient">
            Precision settlement for autonomous enterprise.
          </h1>

          {/* Executive Subheadline */}
          <p className="mt-6 text-base sm:text-lg lg:text-[19px] text-ink-muted max-w-2xl font-normal leading-[1.6] tracking-[-0.01em]">
            Cryptographic Confirmation of Payee, autonomous invoice verification, and programmable treasury guardrails built for instant finality.
          </p>

          {/* Unified Pill Action Cluster */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            {isConnected ? (
              <Link href="/dashboard" className="btn-primary px-7 py-3 text-sm">
                <span>Open Console</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => connect()}
                disabled={isConnecting}
                className="btn-primary px-7 py-3 text-sm"
              >
                <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <Link href="/pay" className="btn-secondary px-6 py-3 text-sm">
              <span>Execute Intent</span>
            </Link>

            <Link href="/treasury" className="btn-secondary px-6 py-3 text-sm text-ink-secondary">
              <span>Treasury Policy</span>
            </Link>
          </div>
        </div>

        {/* Interactive Architectural Showcase Window */}
        <div className="mt-16 sm:mt-20">
          <div className="rounded-2xl border border-line bg-elevated shadow-popover overflow-hidden backdrop-blur-2xl">
            {/* Window Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b border-line-subtle bg-inset gap-3">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="flex items-center gap-1.5 mr-2" aria-hidden="true">
                  <div className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                  <div className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                  <div className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                </div>
                <span className="text-xs font-mono text-ink-muted">PaySure Verification Engine</span>
                <span className="text-ink-subtle">&middot;</span>
                <span className="text-[11px] font-mono text-success">Nightshade 2.0</span>
              </div>

              {/* Apple-Style Segmented Control */}
              <div
                role="tablist"
                aria-label="PaySure Verification Modes"
                className="inline-flex items-center p-1 rounded-full bg-subtle border border-line-subtle text-xs whitespace-nowrap self-start sm:self-auto"
              >
                {[
                  { id: "cop" as const, label: "Confirmation of Payee" },
                  { id: "intent" as const, label: "Multi-Chain Intents" },
                  { id: "treasury" as const, label: "Treasury Guardrails" },
                ].map((tab) => {
                  const selected = activeView === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveView(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] transition-all focus-ring ${
                        selected
                          ? "bg-accent text-white font-medium shadow-sm"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Window Content Area with Tactile Transitions */}
            <div className="p-6 sm:p-8 min-h-[220px]">
              <AnimatePresence mode="wait">
                {activeView === "cop" && (
                  <motion.div
                    key="cop"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    {/* Verified Counterparty Card */}
                    <div className="p-6 rounded-xl bg-inset border border-line-subtle flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                            <Check className="h-3.5 w-3.5" />
                            Verified Counterparty
                          </span>
                          <span className="text-[11px] font-mono text-ink-subtle">RPC 200 OK</span>
                        </div>
                        <div className="mb-5">
                          <span className="text-[11px] uppercase tracking-wider text-ink-subtle block mb-1">
                            Resolved Account
                          </span>
                          <p className="text-lg font-mono font-medium text-ink">
                            acme-design.testnet
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-line-subtle text-xs">
                          <div>
                            <span className="text-ink-subtle block">Registered Entity</span>
                            <span className="text-ink-secondary font-medium mt-0.5 block">Acme Design Studio LLC</span>
                          </div>
                          <div>
                            <span className="text-ink-subtle block">Spoofing Risk</span>
                            <span className="text-success font-mono font-medium mt-0.5 block">0.00% &middot; Exact Match</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Intercepted Spoof Attempt Card */}
                    <div className="p-6 rounded-xl bg-danger-soft border border-danger-border flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-danger">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Homoglyph Threat Intercepted
                          </span>
                          <span className="text-[11px] font-mono text-danger">Execution Blocked</span>
                        </div>
                        <div className="mb-5">
                          <span className="text-[11px] uppercase tracking-wider text-ink-subtle block mb-1">
                            Flagged Target
                          </span>
                          <p className="text-lg font-mono font-medium text-danger">
                            acm3-design.testnet
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-danger-border text-xs">
                          <div>
                            <span className="text-ink-subtle block">Edit Distance</span>
                            <span className="text-ink-secondary font-mono font-medium mt-0.5 block">Levenshtein d = 1</span>
                          </div>
                          <div>
                            <span className="text-ink-subtle block">Policy Action</span>
                            <span className="text-danger font-medium mt-0.5 block">Quarantined Pre-Sign</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeView === "intent" && (
                  <motion.div
                    key="intent"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-5"
                  >
                    <div className="p-4 rounded-xl bg-inset border border-line-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-subtle">Intent</span>
                        <span className="text-sm font-mono text-ink">
                          &ldquo;Settle $50.00 to John Kennedy on Base from operational liquidity&rdquo;
                        </span>
                      </div>
                      <Link
                        href="/pay?recipient=john-kennedy.testnet&amount=50"
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent-ink hover:underline whitespace-nowrap rounded-md focus-ring"
                      >
                        <span>Run in Console</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-inset border border-line-subtle">
                        <span className="text-[11px] text-ink-subtle block">Resolved Beneficiary</span>
                        <span className="text-sm font-mono font-medium text-ink mt-1 block">john-kennedy.testnet</span>
                      </div>
                      <div className="p-4 rounded-xl bg-inset border border-line-subtle">
                        <span className="text-[11px] text-ink-subtle block">Settlement Asset</span>
                        <span className="text-sm font-mono font-medium text-ink mt-1 block">50.00 USDC / NEAR</span>
                      </div>
                      <div className="p-4 rounded-xl bg-inset border border-line-subtle">
                        <span className="text-[11px] text-ink-subtle block">Execution Rail</span>
                        <span className="text-sm font-mono font-medium text-ink mt-1 block">Base L2 (MPC Signer)</span>
                      </div>
                      <div className="p-4 rounded-xl bg-inset border border-line-subtle">
                        <span className="text-[11px] text-ink-subtle block">Policy Clearance</span>
                        <span className="text-sm font-mono font-medium text-success mt-1 block">Authorized</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeView === "treasury" && (
                  <motion.div
                    key="treasury"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                  >
                    <div className="p-5 rounded-xl bg-inset border border-line-subtle">
                      <span className="text-xs text-ink-subtle block">Single-Transaction Ceiling</span>
                      <p className="text-2xl font-semibold text-ink mt-2 tracking-tight">200.00 NEAR</p>
                      <span className="text-xs text-ink-muted mt-2 block">Enforced before wallet signature</span>
                    </div>
                    <div className="p-5 rounded-xl bg-inset border border-line-subtle">
                      <span className="text-xs text-ink-subtle block">24-Hour Rolling Velocity</span>
                      <p className="text-2xl font-semibold text-ink mt-2 tracking-tight">14.5% Utilized</p>
                      <div className="w-full bg-subtle h-1.5 rounded-full overflow-hidden mt-3">
                        <div className="bg-success h-full w-[14.5%] rounded-full" />
                      </div>
                    </div>
                    <div className="p-5 rounded-xl bg-inset border border-line-subtle">
                      <span className="text-xs text-ink-subtle block">Multi-Sig Governance</span>
                      <p className="text-2xl font-semibold text-ink mt-2 tracking-tight">2-of-3 Council</p>
                      <span className="text-xs text-ink-muted mt-2 block font-mono">sputnik-dao.testnet</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Subtle Metrics Footer Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-line-subtle bg-inset divide-y sm:divide-y-0 sm:divide-x divide-line-subtle">
              <div className="px-5 py-3.5">
                <span className="text-[11px] text-ink-subtle block">Consensus Finality</span>
                <span className="text-xs font-mono text-ink-secondary mt-0.5 block">~1.1 Seconds</span>
              </div>
              <div className="px-5 py-3.5">
                <span className="text-[11px] text-ink-subtle block">Network Fee</span>
                <span className="text-xs font-mono text-ink-secondary mt-0.5 block">&lt; $0.0001 USD</span>
              </div>
              <div className="px-5 py-3.5">
                <span className="text-[11px] text-ink-subtle block">Identity Assurance</span>
                <span className="text-xs font-mono text-ink-secondary mt-0.5 block">4-Tier On-Chain CoP</span>
              </div>
              <div className="px-5 py-3.5">
                <span className="text-[11px] text-ink-subtle block">Cross-Chain Signing</span>
                <span className="text-xs font-mono text-ink-secondary mt-0.5 block">Threshold MPC (v1.signer)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
