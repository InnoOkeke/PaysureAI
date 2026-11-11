"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, Sparkles, FileText, Send, Wallet } from "lucide-react";
import { useNearWallet } from "@/context/NearWalletContext";

export function Hero() {
  const { isConnected, connect, isConnecting } = useNearWallet();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Make Every Web3 <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-accent to-emerald-400 bg-clip-text text-transparent">
              Payment Count.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
            AI-powered payment verification and intelligent invoice management on <span className="text-brand-300 font-medium">NEAR Protocol</span>. Verify human-readable accounts instantly, and never send funds blindly again.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {isConnected ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all active:scale-[0.98]"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => connect()}
                disabled={isConnecting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all active:scale-[0.98]"
              >
                <span>{isConnecting ? "Connecting..." : "Get Started • Connect NEAR"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium bg-navy-900/90 hover:bg-navy-850 text-slate-200 border border-navy-800 transition-colors"
            >
              <span>Explore Live App</span>
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
              <span>AI Multimodal Extraction &amp; OCR</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>NEAR Intents &amp; Sub-Second Settlement</span>
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
