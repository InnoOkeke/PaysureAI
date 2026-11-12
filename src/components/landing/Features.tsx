"use client";

import { 
  ShieldCheck, 
  Cpu, 
  FileCheck2, 
  Lock, 
  Coins, 
  Zap, 
  Layers, 
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  FileText
} from "lucide-react";
import Link from "next/link";

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-navy-950/95 border-t border-navy-800/80 relative">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-600/5 blur-[160px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-mono font-semibold mb-3 border border-brand-500/20">
            <span>Enterprise Feature Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white">
            Institutional Infrastructure for Autonomous Finance.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Eliminating human latency, typosquatting fraud, and treasury exploits with cryptographic precision.
          </p>
        </div>

        {/* Bento Grid Architecture */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bento Card 1 (Large - Spans 2 Cols): Confirmation of Payee */}
          <div className="lg:col-span-2 group relative p-7 sm:p-9 rounded-2xl bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-navy-750 hover:border-emerald-500/40 transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Anti-Spoofing Protocol
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Confirmation of Payee (CoP) Engine
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Validates recipient accounts against NEAR's human-readable name registry before any capital is broadcast. Calculates phonetic Levenshtein distance to detect lookalike homoglyphs (<span className="text-rose-400 font-mono">satosh1.near</span> vs <span className="text-emerald-400 font-mono">satoshi.near</span>) with a definitive 4-tier match classification.
              </p>
            </div>

            {/* Visual Micro-Terminal Widget */}
            <div className="mt-8 p-4 rounded-xl bg-navy-950/90 border border-navy-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-navy-850">
                <span className="text-slate-400">Live RPC Identity Resolution</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONFIRMED MATCH
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Query:</span>
                  <span className="text-white font-bold bg-navy-900 px-2.5 py-1 rounded border border-navy-750">
                    acme-design.testnet
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span>Owner: <strong className="text-slate-200">Acme Global Ltd</strong></span>
                  <span>Risk Score: <strong className="text-emerald-400">0.00%</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Multimodal AI Invoicing & OCR */}
          <div className="group relative p-7 sm:p-9 rounded-2xl bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-navy-750 hover:border-brand-500/40 transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 group-hover:scale-105 transition-transform">
                  <Cpu className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  Multimodal OCR
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                Zero-Trust Invoice Extraction
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Upload invoices in PDF, PNG, or JPG. Deep neural OCR extracts line items, quantities, taxes, and recipient accounts while stripping prompt-injection payloads from malicious documents.
              </p>
            </div>

            <div className="mt-8 p-3.5 rounded-xl bg-navy-950/90 border border-navy-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Sanitization Filter</span>
                <span className="text-emerald-400 font-bold">100% CLEANSED</span>
              </div>
              <div className="text-slate-300 text-[11px] truncate">
                &gt; Extracted: Invoice #INV-2026-92 • 75.00 NEAR
              </div>
            </div>
          </div>

          {/* Bento Card 3: Autonomous Treasury Guardrails */}
          <div className="group relative p-7 sm:p-9 rounded-2xl bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-navy-750 hover:border-amber-500/40 transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                  <Lock className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Autonomous Governance
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                Treasury Policy Ceilings
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Institutional policies enforce hard single-tx limits, rolling 24-hour velocity quotas, department procurement budgets, and immediate emergency circuit-breakers for autonomous agent capital.
              </p>
            </div>

            <div className="mt-8 p-3.5 rounded-xl bg-navy-950/90 border border-navy-800 text-xs font-mono space-y-2">
              <div className="flex justify-between text-slate-300">
                <span className="text-[11px] text-slate-400">Velocity Cap</span>
                <span className="font-bold text-white">$450 / $2,500</span>
              </div>
              <div className="w-full bg-navy-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[18%]" />
              </div>
            </div>
          </div>

          {/* Bento Card 4 (Large - Spans 2 Cols): Conversational Multi-Chain Intents */}
          <div className="lg:col-span-2 group relative p-7 sm:p-9 rounded-2xl bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-navy-750 hover:border-cyan-500/40 transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-brand-accent border border-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Chain Signatures MPC
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Conversational Multi-Chain Intents
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Execute cross-chain corporate payouts via natural language: <span className="text-slate-100 font-semibold font-mono">"Send $50 to John Kennedy on Base"</span>. PaySure leverages NEAR threshold MPC (<span className="text-brand-accent font-mono">v1.signer-prod.testnet</span>) to sign transactions on Base, Ethereum, and Solana natively without bridges or wrapped tokens.
              </p>
            </div>

            {/* Visual Intent Pipeline */}
            <div className="mt-8 p-4 rounded-xl bg-navy-950/90 border border-navy-800 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-navy-900/70 border border-navy-800">
                  <span className="text-slate-500 text-[10px] block">1. Natural Input</span>
                  <span className="text-white font-medium text-xs">Plain English Prompt</span>
                </div>
                <div className="p-3 rounded-lg bg-navy-900/70 border border-navy-800">
                  <span className="text-slate-500 text-[10px] block">2. Policy Check</span>
                  <span className="text-emerald-400 font-medium text-xs">CoP &amp; Velocity OK</span>
                </div>
                <div className="p-3 rounded-lg bg-navy-900/70 border border-navy-800">
                  <span className="text-slate-500 text-[10px] block">3. Threshold MPC</span>
                  <span className="text-brand-accent font-medium text-xs">Base / ETH / Solana</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}