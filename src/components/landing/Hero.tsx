"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Wallet,
  Zap,
  Lock,
  Cpu,
  Layers,
  AlertTriangle,
  ArrowUpRight,
  Terminal,
  Activity,
  Check
} from "lucide-react";
import { useNearWallet } from "@/context/NearWalletContext";

export function Hero() {
  const { isConnected, accountId, connect, isConnecting } = useNearWallet();
  const [terminalTab, setTerminalTab] = useState<"cop" | "intent" | "treasury">("cop");

  return (
    <section className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32 bg-[#070B14]">
      {/* Dynamic Ambient Background Illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-brand-600/15 via-brand-accent/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      
      {/* Background Subtle Geometric Grid Overlay */}
      <div className="absolute inset-0 fintech-grid opacity-30 pointer-events-none -z-10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Institutional Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-navy-900/90 border border-navy-750 text-xs font-mono text-slate-300 shadow-xl mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Institutional Operating System</span>
            <span className="text-slate-600">/</span>
            <span className="text-brand-300 font-semibold">NEAR Protocol Network</span>
          </div>

          {/* Monumental Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] text-white leading-[1.08]">
            Autonomous Invoicing &amp; <br />
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Confirmation of Payee
            </span>{" "}
            Infrastructure.
          </h1>

          {/* Subheadline with high-contrast fintech prose */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
            Eliminate invoice fraud and safeguard AI-controlled capital. PaySure AI unifies real-time named account verification, conversational multi-chain intents, and institutional treasury guardrails on <strong className="text-white font-semibold">NEAR Protocol</strong>.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            {isConnected ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-xl shadow-brand-600/30 hover:shadow-brand-600/40 transition-all active:scale-[0.98] border border-brand-400/30"
              >
                <span>Launch Corporate Console</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => connect()}
                disabled={isConnecting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-xl shadow-brand-600/30 hover:shadow-brand-600/40 transition-all active:scale-[0.98] border border-brand-400/30"
              >
                <Wallet className="h-4 w-4" />
                <span>{isConnecting ? "Connecting..." : "Connect NEAR Wallet"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <Link
              href="/pay"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium bg-navy-900/90 hover:bg-navy-850 text-slate-200 border border-navy-750 hover:border-slate-600 transition-all shadow-sm"
            >
              <Zap className="h-4 w-4 text-brand-400" />
              <span>Multi-Chain Intents</span>
            </Link>

            <Link
              href="/treasury"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium bg-navy-900/90 hover:bg-navy-850 text-slate-200 border border-navy-750 hover:border-slate-600 transition-all shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Treasury Guardrails</span>
            </Link>
          </div>

          {/* Quick Intent Sampler */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Try Natural Intent:</span>
            <Link
              href="/pay?recipient=john-kennedy.testnet&amount=50"
              className="px-3 py-1 rounded-lg bg-navy-900/70 hover:bg-navy-850 border border-navy-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 font-mono text-[11px]"
            >
              <span className="text-brand-400">⚡</span>
              <span>"Send $50 to John Kennedy on Base"</span>
            </Link>
            <Link
              href="/pay?recipient=acme-design.testnet&amount=75"
              className="px-3 py-1 rounded-lg bg-navy-900/70 hover:bg-navy-850 border border-navy-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 font-mono text-[11px]"
            >
              <span className="text-brand-400">⚡</span>
              <span>"Pay Acme Design 75 NEAR"</span>
            </Link>
          </div>
        </div>

        {/* Interactive Multi-Mode Enterprise Terminal Cockpit */}
        <div className="mt-14 sm:mt-20 relative max-w-5xl mx-auto">
          {/* Subtle perimeter glow container */}
          <div className="relative rounded-2xl p-1 bg-gradient-to-b from-navy-700/60 via-navy-800/40 to-navy-950/80 border border-navy-750/80 shadow-2xl shadow-black/90">
            <div className="rounded-xl bg-navy-950/95 overflow-hidden backdrop-blur-xl">
              
              {/* Terminal Chrome Bar */}
              <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-navy-900/90 border-b border-navy-800/80 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="h-4 w-[1px] bg-navy-750 mx-1" />
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
                    <Terminal className="h-3.5 w-3.5 text-brand-400" />
                    <span>paysure-core // enterprise-node v2.1</span>
                  </div>
                </div>

                {/* Interactive Terminal Mode Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-navy-950 border border-navy-800 text-[11px] font-mono">
                  <button
                    onClick={() => setTerminalTab("cop")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      terminalTab === "cop"
                        ? "bg-brand-600 text-white font-semibold shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    1. Confirmation of Payee
                  </button>
                  <button
                    onClick={() => setTerminalTab("intent")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      terminalTab === "intent"
                        ? "bg-brand-accent text-white font-semibold shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    2. Multi-Chain Intents
                  </button>
                  <button
                    onClick={() => setTerminalTab("treasury")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      terminalTab === "treasury"
                        ? "bg-emerald-600 text-white font-semibold shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    3. Treasury Policy
                  </button>
                </div>
              </div>

              {/* Terminal Body Content */}
              <div className="p-5 sm:p-7">
                {/* Mode 1: Confirmation of Payee */}
                {terminalTab === "cop" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-850 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-bold text-white">Live On-Chain Counterparty Verification</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Querying NEAR Protocol Name Registrar for authentic corporate identity before dispatching capital.
                        </p>
                      </div>
                      <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
                        STATUS: ZERO-SPOOFING ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Authentic Account Resolution */}
                      <div className="p-4 rounded-xl bg-navy-900/60 border border-emerald-500/30 font-mono text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" /> VERIFIED RECIPIENT
                          </span>
                          <span className="text-[10px] text-slate-400">NEAR RPC 200 OK</span>
                        </div>
                        <div className="p-2 rounded-lg bg-navy-950 border border-navy-800">
                          <span className="text-slate-400 text-[10px] block">Target Account</span>
                          <span className="text-white font-bold text-sm">acme-design.testnet</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Identity Tier:</span>
                            <span className="text-emerald-300 font-medium">Tier-1 Corporate</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Fraud Risk Score:</span>
                            <span className="text-emerald-400 font-bold">0.00% (SAFE)</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-navy-850">
                          On-chain Public Key: <span className="text-slate-300">ed25519:8XvY...7Kp</span>
                        </div>
                      </div>

                      {/* Intercepted Impersonator */}
                      <div className="p-4 rounded-xl bg-navy-900/60 border border-rose-500/40 font-mono text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-rose-400 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5" /> ATTACK INTERCEPTED
                          </span>
                          <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded">BLOCKED</span>
                        </div>
                        <div className="p-2 rounded-lg bg-navy-950 border border-navy-800">
                          <span className="text-slate-400 text-[10px] block">Lookalike Typosquatting</span>
                          <span className="text-rose-400 font-bold text-sm">acm3-design.testnet</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Levenshtein Distance:</span>
                            <span className="text-rose-300 font-bold">1 (Character Collision)</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Defense Action:</span>
                            <span className="text-rose-400 font-bold">Transfer Aborted</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-navy-850">
                          Threat Signature: <span className="text-rose-300">Homoglyph Substitution</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode 2: Conversational Multi-Chain Intent */}
                {terminalTab === "intent" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-850 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-brand-accent" />
                          <span className="text-sm font-bold text-white">Conversational Intent Resolution Engine</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Translating human prompts into verified on-chain execution with NEAR Chain Signatures MPC.
                        </p>
                      </div>
                      <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-cyan-500/10 text-brand-accent border border-cyan-500/20 text-xs font-mono font-semibold">
                        MPC SIGNER: v1.signer-prod
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 font-mono text-xs space-y-3">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-brand-400 font-bold">&gt; INPUT PROMPT:</span>
                        <span className="bg-navy-950 px-3 py-1.5 rounded-lg border border-navy-800 text-white font-medium">
                          "Send $50 to John Kennedy on Base from corporate operations budget"
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2">
                        <div className="p-3 rounded-lg bg-navy-950 border border-navy-850">
                          <span className="text-slate-500 text-[10px] block">Extracted Target</span>
                          <span className="text-white font-bold">john-kennedy.testnet</span>
                        </div>
                        <div className="p-3 rounded-lg bg-navy-950 border border-navy-850">
                          <span className="text-slate-500 text-[10px] block">Settlement Value</span>
                          <span className="text-brand-300 font-bold">50.00 USD (NEAR)</span>
                        </div>
                        <div className="p-3 rounded-lg bg-navy-950 border border-navy-850">
                          <span className="text-slate-500 text-[10px] block">Target Chain</span>
                          <span className="text-cyan-300 font-bold">Base (Coinbase L2)</span>
                        </div>
                        <div className="p-3 rounded-lg bg-navy-950 border border-navy-850">
                          <span className="text-slate-500 text-[10px] block">Policy Evaluation</span>
                          <span className="text-emerald-400 font-bold">Pre-Approved (&lt; $100)</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-navy-950/70 border border-navy-850 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Route: <strong className="text-slate-300">NEAR Shard #0 &rarr; Threshold MPC &rarr; Base EVM Call</strong></span>
                        <span className="text-emerald-400 font-semibold">Sub-Second Execution</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode 3: Autonomous Treasury Policy */}
                {terminalTab === "treasury" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-850 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-bold text-white">Autonomous Treasury Guardrail State</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Enforcing programmatic ceilings, rolling velocity meters, and SputnikDAO multi-sig escalation.
                        </p>
                      </div>
                      <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
                        POLICY: REINFORCED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800 space-y-1">
                        <span className="text-slate-400 text-[10px] block">Single-Tx Hard Ceiling</span>
                        <p className="text-lg font-bold text-white">200.00 <span className="text-xs text-slate-400">NEAR</span></p>
                        <span className="text-[10px] text-emerald-400 block">&le; $1,000 equivalent</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800 space-y-1">
                        <span className="text-slate-400 text-[10px] block">24h Velocity Meter</span>
                        <p className="text-lg font-bold text-brand-300">145.00 / 1,000 <span className="text-xs text-slate-400">NEAR</span></p>
                        <div className="w-full bg-navy-950 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-brand-500 h-full w-[14.5%]" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800 space-y-1">
                        <span className="text-slate-400 text-[10px] block">Multi-Sig Escalation</span>
                        <p className="text-sm font-bold text-white truncate">sputnik-dao.testnet</p>
                        <span className="text-[10px] text-brand-400 block">Threshold: 2 of 3 Council</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Terminal Bottom Telemetry Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-navy-800/80 bg-navy-900/50 text-xs font-mono divide-y sm:divide-y-0 sm:divide-x divide-navy-800/80">
                <div className="p-3 sm:px-4 sm:py-3">
                  <span className="text-slate-500 text-[10px] block uppercase">Network Latency</span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    1.1s (Nightshade 2.0)
                  </span>
                </div>
                <div className="p-3 sm:px-4 sm:py-3">
                  <span className="text-slate-500 text-[10px] block uppercase">Settlement Cost</span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    &lt; $0.0001 per Tx
                  </span>
                </div>
                <div className="p-3 sm:px-4 sm:py-3">
                  <span className="text-slate-500 text-[10px] block uppercase">Verification Proof</span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    100% Zero Spoofing
                  </span>
                </div>
                <div className="p-3 sm:px-4 sm:py-3">
                  <span className="text-slate-500 text-[10px] block uppercase">Multi-Chain MPC</span>
                  <span className="text-brand-300 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Base, ETH, Solana
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}