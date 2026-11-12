"use client";

import { ExternalLink, Layers, Sparkles, CheckCircle2, Shield, Zap, Globe2 } from "lucide-react";
import { NEAR_CONFIG } from "@/lib/near/config";

export function BlockchainSection() {
  const specs = [
    { label: "Blockchain Network", value: "NEAR Protocol (Testnet & Mainnet)" },
    { label: "Account ID Model", value: "Human-Readable Named Accounts (*.testnet, *.near)" },
    { label: "Consensus & Finality", value: "Nightshade 2.0 (Sub-Second < 1.2s Finality)" },
    { label: "Average Transaction Cost", value: "< $0.0001 USD per Settlement" },
    { label: "Settlement Assets", value: "Native NEAR & NEP-141 USDC" },
    { label: "Chain Signatures (MPC)", value: "v1.signer-prod.testnet (Base, ETH, Solana)" },
    { label: "RPC Node Provider", value: "Official NEAR Testnet RPC (Fast & Redundant)" },
    { label: "Block Explorer", value: "NEARBlocks (testnet.nearblocks.io)" },
  ];

  const supportedWallets = [
    { name: "MyNearWallet", desc: "Official Web & Mobile", badge: "Live" },
    { name: "HOT Wallet", desc: "Telegram Embedded MPC", badge: "Live" },
    { name: "Meteor Wallet", desc: "Browser Extension & Web", badge: "Live" },
    { name: "Nightly Wallet", desc: "Multi-Chain & Mobile", badge: "Live" },
    { name: "Sender Wallet", desc: "Fast Non-Custodial", badge: "Live" },
  ];

  return (
    <section className="py-20 sm:py-28 bg-navy-950 border-t border-navy-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold mb-3 border border-brand-500/20">
            <Layers className="h-4 w-4" />
            <span>Infrastructure &amp; Wallets</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Native Settlement on NEAR Protocol
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Engineered natively for NEAR's human-readable account namespace, sub-second finality, and cross-chain Chain Signatures.
          </p>
        </div>

        {/* Supported Wallets Row */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="text-center mb-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Powered by Official NEAR Wallet Selector
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {supportedWallets.map((wallet) => (
              <div
                key={wallet.name}
                className="p-4 rounded-xl bg-navy-900/80 border border-navy-800 text-center hover:border-brand-500/40 transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                    {wallet.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{wallet.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{wallet.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specs Card */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-brand-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Testnet Protocol Parameters
                </span>
              </div>
              <span className="text-xs font-mono text-brand-300 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                Network: testnet
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specs.map((spec) => (
                <div key={spec.label} className="p-4 rounded-xl bg-navy-950/70 border border-navy-800/80">
                  <span className="text-xs text-slate-400 block">{spec.label}</span>
                  <span className="text-xs sm:text-sm font-mono font-medium text-slate-200 mt-1 block truncate">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-navy-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Zero fallbacks, zero mock hashes &mdash; 100% live on NEAR Testnet</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://testnet.mynearwallet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  <span>Testnet Faucet / Wallet</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href={NEAR_CONFIG.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <span>NEARBlocks Explorer</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://docs.near.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <span>NEAR Docs</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
