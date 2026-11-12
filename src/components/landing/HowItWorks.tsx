"use client";

import { 
  Wallet,
  Cpu,
  ShieldCheck,
  Send,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
  const stages = [
    {
      step: "01",
      title: "Session Authentication",
      description:
        "Connect any non-custodial NEAR wallet via the official Wallet Selector. Establishes an ed25519 session without exposing private keys.",
      icon: Wallet,
      detail: "Non-Custodial Handshake"
    },
    {
      step: "02",
      title: "Payload Ingestion",
      description:
        "Upload a commercial invoice for zero-trust neural extraction or specify a settlement instruction in plain language.",
      icon: Cpu,
      detail: "Multimodal Extraction"
    },
    {
      step: "03",
      title: "Counterparty Clearance",
      description:
        "PaySure verifies the beneficiary on-chain, screens for lookalike typosquatting, and validates the transfer against active treasury limits.",
      icon: ShieldCheck,
      detail: "4-Tier CoP & Policy Check"
    },
    {
      step: "04",
      title: "Deterministic Finality",
      description:
        "Authorize the transaction for sub-second NEAR settlement or cross-chain MPC execution, generating a downloadable PDF audit certificate.",
      icon: Send,
      detail: "~1.1s Settlement & Receipt"
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-[#050507] border-t border-white/[0.06] relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-3">
            Execution Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-white leading-[1.1]">
            From invoice to finality <br />
            <span className="text-zinc-500">in four deterministic steps.</span>
          </h2>
        </div>

        {/* 4-Stage Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="p-7 rounded-3xl bg-[#090B10] border border-white/[0.08] hover:border-white/[0.15] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono text-zinc-500">
                      STAGE {stage.step}
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white tracking-[-0.015em] mb-2.5">
                    {stage.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-zinc-500">
                  {stage.detail}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
