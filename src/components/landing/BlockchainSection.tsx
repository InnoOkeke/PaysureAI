"use client";

import { 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Shield, 
  Zap, 
  Globe2, 
  Cpu, 
  Server, 
  ArrowUpRight 
} from "lucide-react";
import { NEAR_CONFIG } from "@/lib/near/config";

export function BlockchainSection() {
  const specs = [
    { 
      label: "Blockchain Network", 
      value: "NEAR Protocol", 
      detail: "Nightshade Sharded Layer-1",
      badge: "Mainnet & Testnet" 
    },
    { 
      label: "Account Namespace", 
      value: "Human-Readable Named Accounts", 
      detail: "*.near / *.testnet format",
      badge: "Native CoP" 
    },
    { 
      label: "Consensus & Finality", 
      value: "< 1.2s Sub-Second Finality", 
      detail: "Doomslug + Nightshade 2.0",
      badge: "Deterministic" 
    },
    { 
      label: "Average Settlement Cost", 
      value: "< $0.0001 USD per Settlement", 
      detail: "Predictable gas economics",
      badge: "Micro-Fees" 
    },
    { 
      label: "Chain Signatures (MPC)", 
      value: "v1.signer-prod.testnet", 
      detail: "Threshold ECDSA / Ed25519",
      badge: "Base, ETH, SOL" 
    },
    { 
      label: "Official Explorer", 
      value: "NEARBlocks Explorer", 
      detail: "testnet.nearblocks.io",
      badge: "Real-Time Ledger" 
    },
  ];

  const supportedWallets = [
    { name: "MyNearWallet", desc: "Web & Mobile Standard", tier: "Tier-1 Official", icon: "🌐" },
    { name: "HOT Wallet", desc: "Telegram Embedded MPC", tier: "Social & Mobile", icon: "🔥" },
    { name: "Meteor Wallet", desc: "Browser Extension & Web", tier: "DeFi & Staking", icon: "☄️" },
    { name: "Nightly Wallet", desc: "Multi-Chain & Mobile", tier: "Cross-Chain", icon: "🌙" },
    { name: "Sender Wallet", desc: "Fast Non-Custodial", tier: "Security Focused", icon: "🛡️" },
  ];

  return (
    <section id="protocol" className="py-24 sm:py-32 bg-navy-950 border-t border-navy-800/80 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-brand-600/10 blur-[150px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-mono font-semibold mb-3 border border-brand-500/20">
            <Server className="h-3.5 w-3.5" />
            <span>Underlying Distributed Ledger</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white">
            Native Settlement on NEAR Protocol.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Harnessing NEAR's human-readable account model, sharded sub-second finality, and multi-chain threshold signatures.
          </p>
        </div>

        {/* Supported Ecosystem Wallets Grid */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Unified NEAR Wallet Selector (Official Ecosystem Standard)
            </span>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
              5 Connectors Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {supportedWallets.map((wallet) => (
              <div
                key={wallet.name}
                className="group relative p-4 rounded-xl bg-navy-900/70 hover:bg-navy-900 border border-navy-800 hover:border-brand-500/40 transition-all duration-200 text-center shadow-lg"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{wallet.icon}</div>
                <h4 className="text-xs font-bold text-white tracking-tight">{wallet.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{wallet.desc}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-navy-950 text-brand-300 border border-navy-800">
                  {wallet.tier}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Protocol Cockpit Card */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-navy-750 p-6 sm:p-9 shadow-2xl backdrop-blur-xl">
            
            {/* Header Telemetry Row */}
            <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-navy-800/80 gap-3">
              <div className="flex items-center gap-2.5">
                <Globe2 className="h-5 w-5 text-brand-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Protocol Infrastructure &amp; Cryptographic Parameters
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Official Testnet RPC Node • Nightshade 2.0 Shard #0
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  NETWORK: TESTNET ACTIVE
                </span>
                <a
                  href={NEAR_CONFIG.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 text-xs font-mono transition-colors"
                >
                  <span>Explorer</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Spec Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specs.map((spec) => (
                <div 
                  key={spec.label} 
                  className="p-4 rounded-xl bg-navy-950/80 border border-navy-800/80 hover:border-navy-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{spec.label}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-navy-900 text-brand-300 border border-navy-800">
                        {spec.badge}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-white block">
                      {spec.value}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono mt-2 block">
                    {spec.detail}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Proof Strip */}
            <div className="mt-6 pt-5 border-t border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Zero custodial risk — All settlement occurs directly on NEAR smart contracts</span>
              </div>
              <div className="text-slate-500">
                Gas Limit: 300 Tgas &bull; Storage Staking: 1 NEAR / 100 KB
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}