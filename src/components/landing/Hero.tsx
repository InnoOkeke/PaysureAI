"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, Sparkles, FileText, Send, Wallet } from "lucide-react";
import { useNearWallet } from "@/context/NearWalletContext";

export function Hero() {
  const { isConnected, accountId, connect, isConnecting } = useNearWallet();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Track Badges */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-6 border border-brand-500/20 backdrop-blur-sm shadow-sm shadow-brand-500/10">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span>NEAR Hackathon: Real-World Money • AI Security &amp; Defense • Autonomous Business</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Autonomous Invoicing &amp; <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-accent to-emerald-400 bg-clip-text text-transparent">
              Confirmation of Payee
            </span>{" "}
            on NEAR.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
            Eliminate invoice fraud and safeguard AI-controlled capital. PaySure AI pairs on-chain named account verification, conversational multi-chain intents, and institutional treasury guardrails on <span className="text-brand-300 font-semibold">NEAR Protocol</span>.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {isConnected ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all active:scale-[0.98]"
              >
                <span>Launch Dashboard ({accountId})</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => connect()}
                disabled={isConnecting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all active:scale-[0.98]"
              >
                <Wallet className="h-5 w-5" />
                <span>{isConnecting ? "Connecting..." : "Connect NEAR Wallet"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <Link
              href="/pay"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium bg-navy-900/90 hover:bg-navy-850 text-slate-200 border border-navy-800 transition-colors"
            >
              <Send className="h-4 w-4 text-brand-400" />
              <span>Send Payment / Intent</span>
            </Link>

            <Link
              href="/treasury"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium bg-navy-900/90 hover:bg-navy-850 text-slate-200 border border-navy-800 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Treasury Guardrails</span>
            </Link>
          </div>

          {/* Quick Intent Tryouts */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Try Intent:</span>
            <Link
              href="/pay?recipient=john-kennedy.testnet&amount=50"
              className="px-3 py-1 rounded-lg bg-navy-900/80 hover:bg-navy-800 border border-navy-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span className="text-brand-400 font-mono">⚡</span>
              <span>"Send $50 to John Kennedy on Base"</span>
            </Link>
            <Link
              href="/pay?recipient=acme-design.testnet&amount=75"
              className="px-3 py-1 rounded-lg bg-navy-900/80 hover:bg-navy-800 border border-navy-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span className="text-brand-400 font-mono">⚡</span>
              <span>"Pay Acme Design 75 NEAR"</span>
            </Link>
          </div>

          {/* Value Props Pills */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Confirmation of Payee (*.near &amp; *.testnet)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>AI Multimodal Invoicing &amp; OCR</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Autonomous Treasury Guardrails (/treasury)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>NEAR Chain Signatures (MPC) Multi-Chain</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-16 sm:mt-24 relative max-w-6xl mx-auto">
          <div className="relative rounded-2xl p-2 bg-gradient-to-b from-navy-700/50 to-navy-900/50 border border-navy-700/70 shadow-2xl shadow-black/80">
            <div className="rounded-xl bg-navy-950 p-4 sm:p-6 border border-navy-800/80">
              {/* Preview Header */}
              <div className="flex items-center justify-between pb-4 border-b border-navy-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-slate-400">app.paysure.ai &bull; NEAR Protocol (Testnet)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                  Confirmation of Payee Active
                </span>
              </div>

              {/* Preview Cards Grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-800">
                  <span className="text-xs text-slate-400">Total Payments Sent</span>
                  <p className="mt-1 text-2xl font-bold text-white">1,482.50 <span className="text-xs font-normal text-slate-400 font-mono">NEAR</span></p>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +14.2% this month
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-800">
                  <span className="text-xs text-slate-400">Pending Invoices</span>
                  <p className="mt-1 text-2xl font-bold text-brand-400">4 <span className="text-xs font-normal text-slate-400">(245.00 NEAR)</span></p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Awaiting recipient confirmation</span>
                </div>
                <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-800">
                  <span className="text-xs text-slate-400">Verified Counterparties</span>
                  <p className="mt-1 text-2xl font-bold text-emerald-400">100%</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Zero address mismatches detected</span>
                </div>
                <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-800">
                  <span className="text-xs text-slate-400">Average Settlement Time</span>
                  <p className="mt-1 text-2xl font-bold text-white">1.2s</p>
                  <span className="text-[11px] text-emerald-400 mt-1 block">NEAR consensus speed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
