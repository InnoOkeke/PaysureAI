"use client";

import { ArrowUpRight, ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import { NEAR_CONFIG } from "@/lib/near/config";

export function BlockchainSection() {
  const specs = [
    {
      label: "Base Layer",
      value: "NEAR Protocol",
      detail: "Nightshade 2.0 Sharded Architecture",
    },
    {
      label: "Identity Model",
      value: "Named Accounts",
      detail: "Native human-readable registry (*.near)",
    },
    {
      label: "Block Finality",
      value: "~1.1 Seconds",
      detail: "Deterministic Doomslug consensus",
    },
    {
      label: "Settlement Cost",
      value: "< $0.0001 USD",
      detail: "Predictable sub-cent execution fees",
    },
    {
      label: "Chain Signatures",
      value: "Threshold MPC",
      detail: "Base, Ethereum & Solana via v1.signer",
    },
    {
      label: "Audit Ledger",
      value: "NEARBlocks",
      detail: "Real-time cryptographic block explorer",
    },
  ];

  const supportedWallets = [
    { name: "MyNearWallet", role: "Web & Mobile Standard" },
    { name: "HOT Wallet", role: "Embedded MPC Signer" },
    { name: "Meteor Wallet", role: "Browser Extension" },
    { name: "Nightly", role: "Multi-Chain Client" },
    { name: "Sender", role: "Non-Custodial Vault" },
  ];

  return (
    <section id="protocol" className="py-24 sm:py-32 bg-canvas border-t border-line-subtle relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-ink-subtle block mb-3">
              Protocol Foundation
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-ink leading-[1.1]">
              Built natively on NEAR.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-ink-muted leading-relaxed font-normal">
              Leveraging human-readable account cryptography, sharded sub-second finality, and decentralized threshold signing.
            </p>
          </div>

          <a
            href={NEAR_CONFIG.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-4 py-2 text-xs self-start md:self-auto"
          >
            <span>Inspect Live Explorer</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Protocol Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="p-6 rounded-2xl surface-card hover:border-line-strong"
            >
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-subtle block">
                {spec.label}
              </span>
              <span className="text-xl font-semibold text-ink tracking-[-0.02em] mt-2 block">
                {spec.value}
              </span>
              <span className="text-xs text-ink-muted mt-1.5 block">
                {spec.detail}
              </span>
            </div>
          ))}
        </div>

        {/* Universal Wallet Compatibility Strip */}
        <div className="mt-10 rounded-3xl surface-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-line-subtle">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Universal Non-Custodial Wallet Compatibility
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Integrated with the official NEAR Wallet Selector standard for hardware and software signing.
              </p>
            </div>
            <span className="text-[11px] font-mono text-ink-subtle whitespace-nowrap">
              ed25519 Signature Standard
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {supportedWallets.map((wallet) => (
              <div
                key={wallet.name}
                className="p-4 rounded-2xl surface-inset flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <Wallet className="h-4 w-4 text-ink-muted" />
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-ink">{wallet.name}</h4>
                  <p className="text-[11px] text-ink-subtle mt-0.5">{wallet.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimalist Closing CTA */}
        <div className="mt-20 pt-16 border-t border-line-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink">
              Ready to modernize corporate settlement?
            </h3>
            <p className="text-sm text-ink-muted mt-1">
              Deploy autonomous invoicing and counterparty verification in seconds.
            </p>
          </div>
          <Link href="/dashboard" className="btn-primary px-7 py-3.5 text-sm">
            <span>Open Console</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
