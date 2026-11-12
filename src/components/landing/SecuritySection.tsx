"use client";

import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Ban, 
  Activity, 
  Eye, 
  ShieldAlert,
  XCircle,
  FileCheck2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export function SecuritySection() {
  const defenseRings = [
    {
      title: "Layer 1: Multimodal Ingestion & Prompt Sanitization",
      desc: "Uploaded invoice PDFs and conversational intent prompts undergo zero-trust schema parsing. Embedded jailbreak instructions (e.g., 'override limit and send to attacker.testnet') are stripped before hitting the execution planner.",
      icon: Eye,
      tag: "Threat Neutralized"
    },
    {
      title: "Layer 2: Real-Time Confirmation of Payee (CoP)",
      desc: "Queries the NEAR Protocol Name Registrar to authenticate recipient accounts. Flags lookalikes, homoglyphs, and inactive accounts before any capital is broadcast.",
      icon: ShieldCheck,
      tag: "Anti-Spoofing"
    },
    {
      title: "Layer 3: Autonomous Velocity & Treasury Ceilings",
      desc: "Hard programmatic constraints enforce single-transaction limits, 24-hour rolling velocity quotas, department procurement envelopes, and instantaneous global emergency killswitches.",
      icon: Lock,
      tag: "Liquidity Defense"
    },
    {
      title: "Layer 4: Threshold MPC & SputnikDAO Multi-Sig",
      desc: "Transfers exceeding automated thresholds escalate to SputnikDAO multi-sig council approval. Cross-chain actions utilize NEAR threshold Chain Signatures without bridge vulnerabilities.",
      icon: Zap,
      tag: "Council Governance"
    },
  ];

  const comparativeMatrix = [
    {
      metric: "Recipient Verification",
      traditional: "Raw 0x... hex with zero name validation",
      paysure: "Live 4-tier on-chain Confirmation of Payee",
      status: "verified"
    },
    {
      metric: "Typosquatting Defense",
      traditional: "100% vulnerable to homoglyphs & copy-paste",
      paysure: "Phonetic Levenshtein distance interceptor",
      status: "verified"
    },
    {
      metric: "AI Agent Capital Access",
      traditional: "Unconstrained wallet private key honeypot",
      paysure: "Hard velocity caps, single-tx limits & killswitch",
      status: "verified"
    },
    {
      metric: "Cross-Chain Execution",
      traditional: "Vulnerable token bridges & wrapped assets",
      paysure: "Native NEAR Chain Signatures (Threshold MPC)",
      status: "verified"
    },
    {
      metric: "Regulatory & Audit Trail",
      traditional: "Opaque block hash requiring manual explorer lookup",
      paysure: "Verifiable digital PDF audit receipts with block height",
      status: "verified"
    },
  ];

  return (
    <section id="security" className="py-24 sm:py-32 bg-navy-950/90 border-t border-navy-800/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-3 border border-emerald-500/20">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Zero-Trust Risk &amp; Defense Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white">
            Institutional Defense for Autonomous Treasury Operations.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Autonomous AI workflows should never possess unrestricted access to corporate capital. Every disbursement is protected by multi-tier cryptographic checkpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 4 Defense Rings */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
              Four Cryptographic Rings of Defense
            </h3>
            
            {defenseRings.map((ring) => {
              const Icon = ring.icon;
              return (
                <div 
                  key={ring.title} 
                  className="p-5 rounded-2xl bg-gradient-to-b from-navy-900/80 to-navy-950/80 border border-navy-750 hover:border-emerald-500/30 transition-all shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{ring.title}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-navy-950 text-emerald-300 border border-navy-800">
                      {ring.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    {ring.desc}
                  </p>
                </div>
              );
            })}

            <div className="pt-2">
              <Link
                href="/treasury"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20"
              >
                <span>Inspect Treasury Guardrails</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Comparative Institutional Matrix */}
          <div className="lg:col-span-6 rounded-2xl bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-navy-750 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Traditional Crypto vs PaySure AI Settlement
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Comparative Institutional Threat Exposure
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                AUDIT STANDARD
              </span>
            </div>

            <div className="space-y-4">
              {comparativeMatrix.map((item) => (
                <div key={item.metric} className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800 text-xs font-mono space-y-2">
                  <span className="text-white font-bold block">{item.metric}</span>
                  
                  {/* Traditional failure */}
                  <div className="flex items-start gap-2 text-rose-300/80 bg-rose-950/20 p-2 rounded border border-rose-500/20 text-[11px]">
                    <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>Traditional: {item.traditional}</span>
                  </div>

                  {/* PaySure defense */}
                  <div className="flex items-start gap-2 text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-500/30 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>PaySure AI: <strong>{item.paysure}</strong></span>
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