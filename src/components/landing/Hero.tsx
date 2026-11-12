"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  Check,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { useNearWallet } from "@/context/NearWalletContext";

export function Hero() {
  const { isConnected, connect, isConnecting } = useNearWallet();
  const [activeView, setActiveView] = useState<"cop" | "intent" | "treasury">("cop");

  return (
    <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36 bg-[#050507]">
      {/* Subtle Apple-style top radial illumination */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255, 255, 255, 0.07) 0%, rgba(59, 130, 246, 0.04) 45%, transparent 80%)"
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Minimalist Eyebrow Capsule */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[12px] text-zinc-400 mb-8 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-medium text-zinc-200">PaySure Core</span>
            <span className="text-zinc-600">·</span>
            <span>Institutional Settlement on NEAR</span>
          </div>

          {/* Apple-Inspired Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-semibold tracking-[-0.04em] leading-[1.04] bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent">
            Precision settlement for autonomous enterprise.
          </h1>

          {/* Executive Subheadline */}
          <p className="mt-6 text-base sm:text-lg lg:text-[19px] text-zinc-400 max-w-2xl font-normal leading-[1.6] tracking-[-0.01em]">
            Cryptographic Confirmation of Payee, zero-trust invoice intelligence, and programmable treasury guardrails — engineered for instant finality.
          </p>

          {/* Clean Pill Action Cluster */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            {isConnected ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <span>Open Console</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => connect()}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <Link
              href="/pay"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-normal bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] transition-all whitespace-nowrap"
            >
              <span>Execute Intent</span>
            </Link>

            <Link
              href="/treasury"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-normal bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] transition-all whitespace-nowrap"
            >
              <span>Treasury Policy</span>
            </Link>
          </div>
        </div>

        {/* Interactive Architectural Showcase Window */}
        <div className="mt-16 sm:mt-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#090B10]/90 shadow-[0_32px_96px_-24px_rgba(0,0,0,0.95)] overflow-hidden backdrop-blur-2xl">
            
            {/* Window Top Bar — Single Line */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.01] gap-3">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
                </div>
                <span className="text-xs font-mono text-zinc-400">PaySure Verification Engine</span>
                <span className="text-zinc-700">·</span>
                <span className="text-[11px] font-mono text-emerald-400">Nightshade 2.0</span>
              </div>

              {/* Apple-Style Segmented Control */}
              <div className="inline-flex items-center p-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs whitespace-nowrap self-start sm:self-auto">
                <button
                  onClick={() => setActiveView("cop")}
                  className={`px-3.5 py-1 rounded-full text-[12px] transition-all ${
                    activeView === "cop"
                      ? "bg-white text-black font-medium shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Confirmation of Payee
                </button>
                <button
                  onClick={() => setActiveView("intent")}
                  className={`px-3.5 py-1 rounded-full text-[12px] transition-all ${
                    activeView === "intent"
                      ? "bg-white text-black font-medium shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Multi-Chain Intents
                </button>
                <button
                  onClick={() => setActiveView("treasury")}
                  className={`px-3.5 py-1 rounded-full text-[12px] transition-all ${
                    activeView === "treasury"
                      ? "bg-white text-black font-medium shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Treasury Guardrails
                </button>
              </div>
            </div>

            {/* Window Content Area */}
            <div className="p-6 sm:p-8">
              {activeView === "cop" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Verified Counterparty Card */}
                  <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.07] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <Check className="h-3.5 w-3.5" />
                          Verified Counterparty
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">RPC 200 OK</span>
                      </div>
                      <div className="mb-5">
                        <span className="text-[11px] uppercase tracking-wider text-zinc-500 block mb-1">
                          Resolved Account
                        </span>
                        <p className="text-lg font-mono font-medium text-white">
                          acme-design.testnet
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.06] text-xs">
                        <div>
                          <span className="text-zinc-500 block">Registered Entity</span>
                          <span className="text-zinc-200 font-medium mt-0.5 block">Acme Design Studio LLC</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Spoofing Risk</span>
                          <span className="text-emerald-400 font-mono font-medium mt-0.5 block">0.00% · Exact Match</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Intercepted Spoof Attempt Card */}
                  <div className="p-6 rounded-xl bg-white/[0.02] border border-rose-500/25 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Homoglyph Threat Intercepted
                        </span>
                        <span className="text-[11px] font-mono text-rose-400/80">Execution Blocked</span>
                      </div>
                      <div className="mb-5">
                        <span className="text-[11px] uppercase tracking-wider text-zinc-500 block mb-1">
                          Flagged Target
                        </span>
                        <p className="text-lg font-mono font-medium text-rose-300">
                          acm3-design.testnet
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.06] text-xs">
                        <div>
                          <span className="text-zinc-500 block">Edit Distance</span>
                          <span className="text-zinc-200 font-mono font-medium mt-0.5 block">Levenshtein d = 1</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Policy Action</span>
                          <span className="text-rose-400 font-medium mt-0.5 block">Quarantined Pre-Sign</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === "intent" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Intent</span>
                      <span className="text-sm font-mono text-white">
                        &ldquo;Settle $50.00 to John Kennedy on Base from operational liquidity&rdquo;
                      </span>
                    </div>
                    <Link
                      href="/pay?recipient=john-kennedy.testnet&amount=50"
                      className="inline-flex items-center gap-1 text-xs font-medium text-white hover:text-zinc-300 whitespace-nowrap"
                    >
                      <span>Run in Console</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[11px] text-zinc-500 block">Resolved Beneficiary</span>
                      <span className="text-sm font-mono font-medium text-white mt-1 block">john-kennedy.testnet</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[11px] text-zinc-500 block">Settlement Asset</span>
                      <span className="text-sm font-mono font-medium text-white mt-1 block">50.00 USDC / NEAR</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[11px] text-zinc-500 block">Execution Rail</span>
                      <span className="text-sm font-mono font-medium text-white mt-1 block">Base L2 (MPC Signer)</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[11px] text-zinc-500 block">Policy Clearance</span>
                      <span className="text-sm font-mono font-medium text-emerald-400 mt-1 block">Authorized</span>
                    </div>
                  </div>
                </div>
              )}

              {activeView === "treasury" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.07]">
                    <span className="text-xs text-zinc-500 block">Single-Transaction Ceiling</span>
                    <p className="text-2xl font-semibold text-white mt-2 tracking-tight">200.00 NEAR</p>
                    <span className="text-xs text-zinc-400 mt-2 block">Enforced before wallet signature</span>
                  </div>
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.07]">
                    <span className="text-xs text-zinc-500 block">24-Hour Rolling Velocity</span>
                    <p className="text-2xl font-semibold text-white mt-2 tracking-tight">14.5% Utilized</p>
                    <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-emerald-400 h-full w-[14.5%]" />
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.07]">
                    <span className="text-xs text-zinc-500 block">Multi-Sig Governance</span>
                    <p className="text-2xl font-semibold text-white mt-2 tracking-tight">2-of-3 Council</p>
                    <span className="text-xs text-zinc-400 mt-2 block font-mono">sputnik-dao.testnet</span>
                  </div>
                </div>
              )}
            </div>

            {/* Subtle Metrics Footer Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/[0.06] bg-white/[0.01] divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
              <div className="px-5 py-3.5">
                <span className="text-[11px] text-zinc-500 block">Consensus Finality</span>
                <span className="text-xs font-mono text-zinc-200 mt-0.5 block">~1.1 Seconds</span>
              </div>
              <div className="px-5 py-3.5">
                <span className="text-[11px] text-zinc-500 block">Network Fee</span>
                <span className="text-xs font-mono text-zinc-200 mt-0.5 block">&lt; $0.0001 USD</span>
              </div>
              <div className="px-5 py-3.5">
                <span className="text-[11px] text-zinc-500 block">Identity Assurance</span>
                <span className="text-xs font-mono text-zinc-200 mt-0.5 block">4-Tier On-Chain CoP</span>
              </div>
              <div className="px-5 py-3.5">
                <span className="text-[11px] text-zinc-500 block">Cross-Chain Signing</span>
                <span className="text-xs font-mono text-zinc-200 mt-0.5 block">Threshold MPC (v1.signer)</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
