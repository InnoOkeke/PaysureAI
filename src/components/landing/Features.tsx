"use client";

import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Zap
} from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-[#050507] border-t border-white/[0.06] relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-3">
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-white leading-[1.1]">
            Engineered for institutional certainty.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Every primitive is designed to eliminate counterparty risk, manual reconciliation errors, and unauthorized capital exposure.
          </p>
        </div>

        {/* Apple-Style Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Bento Card 1 (2 Cols): Confirmation of Payee */}
          <div className="lg:col-span-2 p-8 sm:p-10 rounded-3xl bg-[#090B10] border border-white/[0.08] hover:border-white/[0.15] transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  Identity Layer
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-white tracking-[-0.02em] mb-3">
                Cryptographic Confirmation of Payee
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                Resolves recipient account identifiers against NEAR Protocol on-chain state prior to signing. Evaluates character edit distance and homoglyph substitutions to prevent lookalike domain fraud before capital leaves the treasury.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-white">acme-design.testnet</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <span>Tier-1 Verified</span>
                <span className="text-zinc-700">·</span>
                <span className="text-emerald-400">0.00% Spoof Risk</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2 (1 Col): Multimodal OCR */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#090B10] border border-white/[0.08] hover:border-white/[0.15] transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                  <Cpu className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  Document AI
                </span>
              </div>

              <h3 className="text-xl font-semibold text-white tracking-[-0.02em] mb-3">
                Zero-Trust Invoice Intelligence
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Extracts line items, tax schedules, and payment terms from PDF and image invoices while neutralizing adversarial prompt-injection payloads.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] font-mono text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Schema Filter</span>
                <span className="text-emerald-400">Sanitized</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3 (1 Col): Treasury Guardrails */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#090B10] border border-white/[0.08] hover:border-white/[0.15] transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                  <Lock className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  Policy Engine
                </span>
              </div>

              <h3 className="text-xl font-semibold text-white tracking-[-0.02em] mb-3">
                Programmable Treasury Ceilings
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Enforces per-transaction caps, rolling 24-hour velocity thresholds, departmental budgets, and instant circuit-breakers for autonomous agents.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] font-mono text-xs space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>24h Velocity</span>
                <span className="text-white">$450 / $2,500</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[18%]" />
              </div>
            </div>
          </div>

          {/* Bento Card 4 (2 Cols): Multi-Chain Intents */}
          <div className="lg:col-span-2 p-8 sm:p-10 rounded-3xl bg-[#090B10] border border-white/[0.08] hover:border-white/[0.15] transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  Chain Signatures
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-white tracking-[-0.02em] mb-3">
                Bridge-Free Multi-Chain Execution
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                Compiles natural language disbursement instructions into deterministic cross-chain payloads. Powered by NEAR threshold MPC (<code className="text-zinc-200 font-mono">v1.signer-prod.testnet</code>), enabling direct settlement across Base, Ethereum, and Solana from a single NEAR account.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-zinc-500 text-[10px] block uppercase">01. Ingress</span>
                <span className="text-zinc-200 mt-1 block">Natural Intent</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-zinc-500 text-[10px] block uppercase">02. Clearance</span>
                <span className="text-zinc-200 mt-1 block">CoP &amp; Policy</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-zinc-500 text-[10px] block uppercase">03. Settlement</span>
                <span className="text-zinc-200 mt-1 block">MPC Signature</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
