"use client";

import { 
  FileUp, 
  ScanSearch, 
  ShieldAlert, 
  Send, 
  FileCheck2, 
  Sparkles,
  Wallet,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect Any NEAR Wallet",
      description:
        "Connect securely via the official NEAR Wallet Selector. Seamlessly switch between MyNearWallet, HERE / HOT Wallet, Meteor, Nightly, and Sender.",
      icon: Wallet,
      tag: "Multi-Wallet Standard",
    },
    {
      step: "02",
      title: "Drop Invoice or Speak Intent",
      description:
        "Upload any PDF/image invoice for zero-trust OCR extraction, OR simply type a natural prompt like 'Send $50 to John Kennedy on Base'.",
      icon: Sparkles,
      tag: "Multimodal AI",
    },
    {
      step: "03",
      title: "Confirmation of Payee & Guardrails",
      description:
        "PaySure immediately verifies the recipient account against live NEAR RPC. Policy guardrails evaluate single-tx limits and 24h velocity before funds move.",
      icon: ShieldAlert,
      tag: "Zero-Trust Defense",
    },
    {
      step: "04",
      title: "Sign On-Chain or Cross-Chain MPC",
      description:
        "Review the transparent execution plan. Confirm with your connected wallet for sub-second NEAR settlement or threshold MPC Chain Signatures.",
      icon: Send,
      tag: "Sub-Second Finality",
    },
    {
      step: "05",
      title: "Download Verifiable Audit Receipt",
      description:
        "Receive an immutable, downloadable digital PDF receipt complete with block height, transaction hash, and direct NEARBlocks explorer verification.",
      icon: FileCheck2,
      tag: "Audit-Ready PDF",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-navy-950 fintech-grid border-t border-navy-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Frictionless, Autonomous &amp; Fail-Safe
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            How PaySure AI Works in 5 Clear Steps
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Bridging real-world business invoices, natural language multi-chain intents, and cryptographic certainty.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-navy-900/60 border border-navy-800 flex flex-col justify-between hover:border-brand-500/40 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-mono font-extrabold text-brand-500/50 group-hover:text-brand-400 transition-colors">
                      {item.step}
                    </span>
                    <div className="p-2 rounded-xl bg-navy-800 text-brand-400 group-hover:bg-brand-500/20 transition-all">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-navy-800 text-brand-300 mb-2 border border-navy-700/60">
                    {item.tag}
                  </span>
                  <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center items-center gap-4">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20"
          >
            <span>Scan an Invoice</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/pay"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-navy-900 hover:bg-navy-850 text-slate-200 border border-navy-800 transition-all"
          >
            <span>Try Conversational Intent</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
