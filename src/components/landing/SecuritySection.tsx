"use client";

import { 
  ShieldCheck, 
  Lock, 
  Check, 
  Zap, 
  Eye, 
  ArrowRight,
  X
} from "lucide-react";
import Link from "next/link";

export function SecuritySection() {
  const defenseRings = [
    {
      title: "01. Multimodal Prompt Sanitization",
      desc: "Uploaded invoice documents and natural language instructions undergo strict schema isolation, neutralizing embedded jailbreak payloads before execution planning.",
      icon: Eye,
    },
    {
      title: "02. On-Chain Confirmation of Payee",
      desc: "Queries the NEAR account registry in real time to authenticate counterparties and quarantine lookalike homoglyph domains prior to signature generation.",
      icon: ShieldCheck,
    },
    {
      title: "03. Deterministic Velocity Ceilings",
      desc: "Enforces hard single-transaction limits, rolling 24-hour liquidity quotas, and an instantaneous emergency circuit-breaker across autonomous workflows.",
      icon: Lock,
    },
    {
      title: "04. Council Multi-Sig & MPC Signing",
      desc: "High-value disbursements automatically escalate to SputnikDAO multi-sig governance, while cross-chain settlement executes via threshold MPC without bridge custody.",
      icon: Zap,
    },
  ];

  const comparativeRows = [
    {
      dimension: "Counterparty Identity",
      legacy: "Unverified raw hexadecimal strings",
      paysure: "4-tier on-chain Confirmation of Payee",
    },
    {
      dimension: "Lookalike Domain Defense",
      legacy: "Vulnerable to character substitution",
      paysure: "Automated Levenshtein distance quarantine",
    },
    {
      dimension: "Agent Liquidity Access",
      legacy: "Unconstrained private key exposure",
      paysure: "Programmatic velocity caps & killswitch",
    },
    {
      dimension: "Cross-Chain Settlement",
      legacy: "Custodial bridges & wrapped tokens",
      paysure: "Native NEAR Chain Signatures (Threshold MPC)",
    },
    {
      dimension: "Compliance & Audit",
      legacy: "Manual block explorer reconciliation",
      paysure: "Cryptographic PDF settlement certificates",
    },
  ];

  return (
    <section id="security" className="py-24 sm:py-32 bg-[#050507] border-t border-white/[0.06] relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-3">
            Defense Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-white leading-[1.1]">
            Zero-trust security for autonomous capital.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Autonomous agents should never hold unconstrained access to corporate liquidity. Every instruction passes through four cryptographic checkpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 4 Defense Rings */}
          <div className="lg:col-span-5 space-y-4">
            {defenseRings.map((ring) => {
              const Icon = ring.icon;
              return (
                <div 
                  key={ring.title} 
                  className="p-6 rounded-2xl bg-[#090B10] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white tracking-[-0.01em]">
                      {ring.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {ring.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Clean Apple-Style Comparison Table */}
          <div className="lg:col-span-7 rounded-3xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/[0.06]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                  Risk Posture Comparison
                </span>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  Legacy Web3 Transfers vs. PaySure Settlement
                </h3>
              </div>
              <Link
                href="/treasury"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-zinc-300 transition-colors"
              >
                <span>Inspect Policy</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {comparativeRows.map((row) => (
                <div key={row.dimension} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center text-xs">
                  <div className="sm:col-span-4 font-medium text-zinc-200">
                    {row.dimension}
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-2 text-zinc-500">
                    <X className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                    <span>{row.legacy}</span>
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-2 text-white font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{row.paysure}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
