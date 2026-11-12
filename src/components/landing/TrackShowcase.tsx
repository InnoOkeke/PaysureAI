"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Coins, 
  Lock, 
  Zap, 
  Layers, 
  Download, 
  Eye, 
  Ban 
} from "lucide-react";

export function TrackShowcase() {
  const [activeTab, setActiveTab] = useState<"track1" | "track2" | "track3">("track3");
  const [demoPrompt, setDemoPrompt] = useState("Send $50 to John Kennedy on Base");
  const [isSimulating, setIsSimulating] = useState(false);

  return (
    <section className="py-20 sm:py-28 bg-navy-900/60 border-t border-navy-800 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-3 border border-brand-500/20">
            <Sparkles className="h-4 w-4 text-brand-400" />
            <span>NEAR Protocol "Build Beyond Boundaries" Hackathon Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            3 Core Hackathon Tracks. 1 Unified Solution.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Explore how PaySure AI solves real-world corporate payments, safeguards autonomous agents, and routes conversational multi-chain intents.
          </p>
        </div>

        {/* Track Selection Tabs */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-navy-950 border border-navy-800 shadow-xl max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("track1")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "track1"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Track 1: Real-World Money</span>
            </button>

            <button
              onClick={() => setActiveTab("track2")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "track2"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Track 2: AI Security &amp; Defense</span>
            </button>

            <button
              onClick={() => setActiveTab("track3")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "track3"
                  ? "bg-brand-accent text-white shadow-md shadow-brand-accent/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Track 3: Autonomous Business &amp; Intents</span>
            </button>
          </div>
        </div>

        {/* Tab 1 Content: Real-World Money */}
        {activeTab === "track1" && (
          <div className="mt-10 rounded-2xl bg-navy-950/80 border border-navy-800 p-6 sm:p-10 shadow-2xl animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  Track 1: Real-World Money Focus
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Corporate Invoicing, Multimodal OCR &amp; Verifiable PDF Receipts
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Bridge traditional paper and PDF corporate invoicing to blockchain finality. PaySure AI replaces manual copy-pasting with intelligent multimodal extraction, line-item tax calculation, and instant immutable receipts.
                </p>

                <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Zero-copy OCR parses vendor, items, total, and account ID in seconds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Settlement in native NEAR or NEP-141 USDC stablecoins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Generate audit-ready PDF receipts with NEARBlocks tx hash &amp; block height</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Link
                    href="/invoices"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20"
                  >
                    <span>Try Invoice Scanner</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-navy-900 hover:bg-navy-850 text-slate-300 border border-navy-800 transition-all"
                  >
                    <span>View Financial Dashboard</span>
                  </Link>
                </div>
              </div>

              {/* Visual Invoice Mockup */}
              <div className="lg:col-span-6 bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-xl font-mono text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-navy-800">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand-400" />
                    <span className="font-bold text-white">INV-2026-0894.pdf</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    OCR EXTRACTED
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center py-1 border-b border-navy-800/60">
                    <span className="text-slate-400">Vendor Entity</span>
                    <span className="text-slate-200 font-semibold">Apex Design Studio Ltd</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-navy-800/60">
                    <span className="text-slate-400">Recipient Account</span>
                    <span className="text-brand-300 font-semibold">apex-design.testnet</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-navy-800/60">
                    <span className="text-slate-400">Line Items</span>
                    <span className="text-slate-200">Brand UI System &amp; Design Sprint</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-navy-800/60">
                    <span className="text-slate-400">Subtotal / Tax</span>
                    <span className="text-slate-300">$1,200.00 / 0.00%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-navy-950 px-3 rounded-lg border border-navy-800">
                    <span className="text-slate-300 font-bold">Total Amount Due</span>
                    <span className="text-emerald-400 font-bold text-sm">1,200.00 USDC</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-navy-800">
                  <span>Confirmation of Payee: <strong className="text-emerald-400 font-semibold">VERIFIED</strong></span>
                  <span className="text-brand-300 flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    PDF Receipt Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: AI Security & Defense */}
        {activeTab === "track2" && (
          <div className="mt-10 rounded-2xl bg-navy-950/80 border border-navy-800 p-6 sm:p-10 shadow-2xl animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Track 2: AI Security &amp; Defense Focus
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Confirmation of Payee, Anti-Spoofing &amp; Treasury Guardrails
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Autonomous agents handling digital assets are vulnerable to prompt injections, malicious invoices, and lookalike typosquatting. PaySure AI provides a military-grade security barrier before transactions ever execute.
                </p>

                <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Real-time NEAR RPC verification (view_account) flags non-existent accounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Typosquatting engine catches satosh1.testnet vs satoshi.testnet attacks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Hard velocity caps &amp; one-click emergency killswitch freeze automated payouts</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Link
                    href="/treasury"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20"
                  >
                    <span>Open Treasury Guardrails</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/recipients"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-navy-900 hover:bg-navy-850 text-slate-300 border border-navy-800 transition-all"
                  >
                    <span>Recipient Registry</span>
                  </Link>
                </div>
              </div>

              {/* Visual Security Attack & Defense Panel */}
              <div className="lg:col-span-6 bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-xl font-mono text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                  <span className="font-bold text-white text-xs">Live Defense Interceptor</span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                    THREAT NEUTRALIZED
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                  <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Lookalike Typosquatting Intercepted!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Detected invoice target <span className="text-rose-300 font-bold">"acm3-design.testnet"</span> imitating verified vendor <span className="text-emerald-300 font-bold">"acme-design.testnet"</span> (Levenshtein distance: 1).
                  </p>
                  <div className="mt-2 text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                    &rarr; ACTION: AUTOMATIC SETTLEMENT BLOCKED
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Single-Tx Limit Ceiling:</span>
                    <span className="font-bold text-white">$500.00 USD</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>24h Velocity Meter:</span>
                    <span className="text-brand-300 font-bold">$340.00 / $2,500.00 (13.6%)</span>
                  </div>
                  <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full w-[13.6%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3 Content: Autonomous Business & NEAR Intents */}
        {activeTab === "track3" && (
          <div className="mt-10 rounded-2xl bg-navy-950/80 border border-navy-800 p-6 sm:p-10 shadow-2xl animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent/20 text-brand-300 border border-brand-accent/30">
                  Track 3: Autonomous Business &amp; NEAR Intents Focus
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Conversational Multi-Chain Intents &amp; Chain Signatures (MPC)
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Empower autonomous workflows and business users to express intent in natural language. PaySure AI compiles prompts into verified cross-chain execution without token bridges or wrapping.
                </p>

                <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Conversational NLP parser extracts intent, recipient, token, and chain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>NEAR Chain Signatures threshold MPC (v1.signer-prod.testnet) routes to Base &amp; ETH</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Auto-approval engine permits recurring payments &le; $100 without human latency</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Link
                    href="/pay"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20"
                  >
                    <span>Launch Intent Terminal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/treasury"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-navy-900 hover:bg-navy-850 text-slate-300 border border-navy-800 transition-all"
                  >
                    <span>Configure Auto-Approval Rules</span>
                  </Link>
                </div>
              </div>

              {/* Interactive Intent Simulator Console */}
              <div className="lg:col-span-6 bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-xl font-mono text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-brand-400" />
                    <span className="font-bold text-white text-xs">Interactive Intent Console</span>
                  </div>
                  <span className="text-[10px] bg-brand-500/10 text-brand-300 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                    NEAR INTENTS ENGINE
                  </span>
                </div>

                {/* Quick Prompts */}
                <div className="space-y-2">
                  <span className="text-[11px] text-slate-400 font-sans font-medium">Select a sample intent:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDemoPrompt("Send $50 to John Kennedy on Base")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                        demoPrompt.includes("Base")
                          ? "bg-brand-500/20 border-brand-500 text-white"
                          : "bg-navy-950 border-navy-800 text-slate-400 hover:text-slate-200"
                      } border`}
                    >
                      "Send $50 to John Kennedy on Base"
                    </button>
                    <button
                      onClick={() => setDemoPrompt("Pay Acme Design 75 NEAR for design invoice")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                        demoPrompt.includes("Acme")
                          ? "bg-brand-500/20 border-brand-500 text-white"
                          : "bg-navy-950 border-navy-800 text-slate-400 hover:text-slate-200"
                      } border`}
                    >
                      "Pay Acme Design 75 NEAR"
                    </button>
                  </div>
                </div>

                {/* Input Prompt Box */}
                <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-1">PROMPT:</span>
                  <div className="font-mono text-brand-300">&gt; {demoPrompt}</div>
                </div>

                {/* Resolved Intent Details */}
                <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Action:</span>
                    <span className="text-emerald-400 font-bold">CROSS_CHAIN_PAYMENT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Target Chain &amp; Rail:</span>
                    <span className="text-white font-semibold">
                      {demoPrompt.includes("Base") ? "Base (Chain Signatures MPC)" : "NEAR Testnet Native"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Payee Verification:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      VERIFIED (view_account)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Autonomous Policy Check:</span>
                    <span className="text-emerald-300 font-semibold">APPROVED (&lt; $100 auto-approval)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/pay?recipient=${demoPrompt.includes("Base") ? "john-kennedy.testnet" : "acme-design.testnet"}&amount=${demoPrompt.includes("Base") ? "50" : "75"}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all shadow-md shadow-brand-600/20 text-xs"
                  >
                    <span>Execute Intent on Testnet</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

