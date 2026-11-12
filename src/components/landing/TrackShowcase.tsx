"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  Lock, 
  Zap, 
  ArrowUpRight
} from "lucide-react";

export function TrackShowcase() {
  const [activeTab, setActiveTab] = useState<"invoicing" | "security" | "intents">("invoicing");
  const [demoPrompt, setDemoPrompt] = useState("Send $50 to John Kennedy on Base");

  return (
    <section id="architecture" className="py-24 sm:py-32 bg-[#050507] border-t border-white/[0.06] relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-3">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-white leading-[1.1]">
            Three foundational layers. <br />
            <span className="text-zinc-500">One unified financial fabric.</span>
          </h2>
        </div>

        {/* Apple-Style Segmented Pillar Selector */}
        <div className="mt-10 flex items-center border-b border-white/[0.08] gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("invoicing")}
            className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === "invoicing"
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            01. Corporate Invoicing &amp; Settlement
            {activeTab === "invoicing" && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === "security"
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            02. Counterparty Defense &amp; Guardrails
            {activeTab === "security" && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("intents")}
            className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === "intents"
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            03. Conversational Multi-Chain Intents
            {activeTab === "intents" && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white" />
            )}
          </button>
        </div>

        {/* Pillar 1: Corporate Invoicing */}
        {activeTab === "invoicing" && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                Multimodal Ingestion
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-white leading-tight">
                Automated reconciliation from document to ledger.
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Transform unstructured vendor PDFs and commercial invoices into structured, pre-verified payment payloads. Every settlement generates an immutable, cryptographically signed audit receipt.
              </p>

              <ul className="space-y-3 pt-2 text-sm text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Neural extraction of line items, tax rates, and beneficiary IDs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Automatic prompt-injection sanitization on untrusted files</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Exportable PDF settlement certificates with block height</span>
                </li>
              </ul>

              <div className="pt-4 flex items-center gap-3">
                <Link
                  href="/invoices/upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-white text-black hover:bg-zinc-200 transition-all"
                >
                  <span>Upload Invoice</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/invoices"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-normal bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] transition-all"
                >
                  <span>View Receivables</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.06]">
                <div>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Invoice Telemetry
                  </span>
                  <h4 className="text-sm font-medium text-white mt-0.5">INV-2026-089 · Acme Design Studio</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Settled On-Chain
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-white/[0.04] text-zinc-400">
                  <span>Beneficiary Account</span>
                  <span className="text-white">acme-design.testnet</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04] text-zinc-400">
                  <span>Confirmation of Payee</span>
                  <span className="text-emerald-400">Verified Corporate Entity</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04] text-zinc-400">
                  <span>Settlement Amount</span>
                  <span className="text-white font-semibold">75.00 NEAR</span>
                </div>
                <div className="flex justify-between py-2 text-zinc-400">
                  <span>Finality</span>
                  <span className="text-zinc-300">Block #184,920,114 (1.1s)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pillar 2: Counterparty Defense */}
        {activeTab === "security" && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                Pre-Transaction Defense
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-white leading-tight">
                Stop lookalike spoofing and unauthorized outflows.
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Before any transaction reaches a wallet prompt, PaySure validates the counterparty against NEAR on-chain state and enforces deterministic corporate velocity policies.
              </p>

              <ul className="space-y-3 pt-2 text-sm text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Phonetic &amp; Levenshtein distance detection for lookalike domains</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Hard single-transaction ceilings and rolling 24-hour limits</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>SputnikDAO multi-sig council escalation for high-value treasury ops</span>
                </li>
              </ul>

              <div className="pt-4 flex items-center gap-3">
                <Link
                  href="/treasury"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-white text-black hover:bg-zinc-200 transition-all"
                >
                  <span>Configure Guardrails</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/recipients"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-normal bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] transition-all"
                >
                  <span>Counterparty Directory</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-5 font-mono text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <span className="text-zinc-300 font-medium">Real-Time Threat Interceptor</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Spoof Quarantined
                </span>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/[0.04] border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  <span>Homoglyph Substitution Detected</span>
                </div>
                <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                  Invoice beneficiary <code className="text-rose-300 font-mono">acm3-design.testnet</code> closely mimics verified vendor <code className="text-emerald-400 font-mono">acme-design.testnet</code> (edit distance: 1). Execution automatically halted.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-zinc-500 block text-[11px]">Single-Tx Ceiling</span>
                  <span className="text-white font-semibold text-sm mt-1 block">$500.00 Equivalent</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-zinc-500 block text-[11px]">24h Velocity Quota</span>
                  <span className="text-white font-semibold text-sm mt-1 block">$340.00 / $2,500.00</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pillar 3: Multi-Chain Intents */}
        {activeTab === "intents" && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                Chain Abstraction
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-white leading-tight">
                Natural language to multi-chain execution.
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Express treasury instructions in plain English. PaySure resolves named beneficiaries, verifies policy compliance, and signs cross-chain transactions via NEAR MPC without bridges.
              </p>

              <ul className="space-y-3 pt-2 text-sm text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Deterministic intent parsing for amount, asset, and target network</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Threshold MPC signatures across Base, Ethereum, and Solana</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Zero bridge custody risk or synthetic wrapped token exposure</span>
                </li>
              </ul>

              <div className="pt-4">
                <Link
                  href={`/pay?prompt=${encodeURIComponent(demoPrompt)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-white text-black hover:bg-zinc-200 transition-all"
                >
                  <span>Execute Intent in Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono">
                <span className="text-zinc-400">Interactive Intent Compiler</span>
                <span className="text-zinc-500">v1.signer-prod.testnet</span>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                  Select Sample Instruction
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Send $50 to John Kennedy on Base",
                    "Pay Acme Design 75 NEAR",
                    "Transfer 120 USDC to CloudOps on Ethereum"
                  ].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => setDemoPrompt(sample)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                        demoPrompt === sample
                          ? "bg-white text-black font-medium"
                          : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]"
                      }`}
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] font-mono text-xs space-y-2.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Parsed Instruction</span>
                  <span className="text-white">{demoPrompt}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Counterparty Check</span>
                  <span className="text-emerald-400">Verified Registry Match</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Signing Authority</span>
                  <span className="text-zinc-200">NEAR Chain Signatures MPC</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
