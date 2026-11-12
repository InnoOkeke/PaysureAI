"use client";

import { 
  FileUp, 
  ScanSearch, 
  ShieldAlert, 
  Send, 
  FileCheck2, 
  Wallet,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Layers
} from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
  const pipeline = [
    {
      step: "01",
      title: "Authenticated Protocol Ingress",
      description:
        "Connect any standard NEAR wallet (MyNearWallet, HOT Wallet, Meteor, Nightly, Sender). Session establishes cryptographic authorization with zero seed phrase exposure.",
      icon: Wallet,
      tag: "Session Auth",
      badge: "Non-Custodial",
      detail: "ed25519 Account Handshake"
    },
    {
      step: "02",
      title: "Multimodal OCR or NLP Intent",
      description:
        "Drop a vendor invoice (PDF/image) for neural extraction, or provide an intent prompt in plain English. PaySure strips malicious prompt injections instantly.",
      icon: Cpu,
      tag: "Deep OCR & NLP",
      badge: "Zero-Trust",
      detail: "Line-Items & Token Resolver"
    },
    {
      step: "03",
      title: "Confirmation of Payee & Guardrails",
      description:
        "Real-time RPC query verifies counterparty authenticity and runs phonetic typosquatting defense. Treasury limits evaluate single-tx ceilings and 24h velocity.",
      icon: ShieldAlert,
      tag: "Defense Interceptor",
      badge: "Deterministic",
      detail: "4-Tier CoP Match Check"
    },
    {
      step: "04",
      title: "Sub-Second Settlement & PDF Receipt",
      description:
        "Sign directly for NEAR native settlement or trigger cross-chain Chain Signatures to Base or Ethereum. Receive an immutable, cryptographically verifiable PDF audit receipt.",
      icon: Send,
      tag: "Atomic Finality",
      badge: "< 1.2s Nightshade",
      detail: "NEARBlocks Hash & Audit PDF"
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-navy-950 fintech-grid border-t border-navy-800/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-mono font-semibold mb-3 border border-brand-500/20">
            <span>Execution Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white">
            How PaySure Operates in 4 Deterministic Stages.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            From raw invoice document or human speech to cryptographic settlement on NEAR Protocol.
          </p>
        </div>

        {/* 4-Stage Connected Process Pipeline */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {pipeline.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="group relative p-6 rounded-2xl bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-navy-750 hover:border-brand-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Step Eyebrow */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-mono font-extrabold text-brand-400/80 group-hover:text-brand-300 transition-colors">
                      {stage.step}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-navy-950 text-slate-300 border border-navy-800">
                      {stage.badge}
                    </span>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {stage.description}
                  </p>
                </div>

                {/* Bottom Technical Spec Pill */}
                <div className="mt-6 pt-4 border-t border-navy-850 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500">{stage.tag}</span>
                  <span className="text-brand-300 font-semibold">{stage.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-navy-900/90 via-navy-850 to-navy-900/90 border border-navy-750 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-white tracking-tight">
              Ready to automate corporate invoicing safely?
            </h4>
            <p className="text-xs text-slate-300 font-normal">
              Connect your NEAR testnet account to experience zero-spoofing Confirmation of Payee.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-600/30 transition-all border border-brand-400/30 shrink-0"
          >
            <span>Launch Corporate Console</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}