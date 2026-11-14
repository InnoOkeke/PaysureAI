"use client";

import { ShieldCheck, Cpu, Lock, Zap } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-canvas border-t border-line-subtle relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-ink-subtle block mb-3">
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-ink leading-[1.1]">
            Engineered for institutional certainty.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-muted leading-relaxed font-normal">
            Every primitive is designed to eliminate counterparty risk, manual reconciliation errors, and unauthorized capital exposure.
          </p>
        </div>

        {/* Apple-Style Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bento Card 1 (2 Cols): Confirmation of Payee */}
          <div className="lg:col-span-2 p-8 sm:p-10 rounded-3xl surface-card hover:border-line-strong flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-2xl bg-subtle border border-line-subtle flex items-center justify-center text-ink">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-subtle">
                  Identity Layer
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-ink tracking-[-0.02em] mb-3">
                Cryptographic Confirmation of Payee
              </h3>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-xl">
                Resolves recipient account identifiers against NEAR Protocol on-chain state prior to signing. Evaluates character edit distance and homoglyph substitutions to prevent lookalike domain fraud before capital leaves the treasury.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-2xl surface-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-ink">acme-design.testnet</span>
              </div>
              <div className="flex items-center gap-4 text-ink-muted">
                <span>Tier-1 Verified</span>
                <span className="text-ink-subtle">&middot;</span>
                <span className="text-success">0.00% Spoof Risk</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2 (1 Col): Multimodal OCR */}
          <div className="p-8 sm:p-10 rounded-3xl surface-card hover:border-line-strong flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-2xl bg-subtle border border-line-subtle flex items-center justify-center text-ink">
                  <Cpu className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-subtle">
                  Document AI
                </span>
              </div>

              <h3 className="text-xl font-semibold text-ink tracking-[-0.02em] mb-3">
                Zero-Trust Invoice Intelligence
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Extracts line items, tax schedules, and payment terms from PDF and image invoices while neutralizing adversarial prompt-injection payloads.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-2xl surface-inset font-mono text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Schema Filter</span>
                <span className="text-success">Sanitized</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3 (1 Col): Treasury Guardrails */}
          <div className="p-8 sm:p-10 rounded-3xl surface-card hover:border-line-strong flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-2xl bg-subtle border border-line-subtle flex items-center justify-center text-ink">
                  <Lock className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-subtle">
                  Policy Engine
                </span>
              </div>

              <h3 className="text-xl font-semibold text-ink tracking-[-0.02em] mb-3">
                Programmable Treasury Ceilings
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Enforces per-transaction caps, rolling 24-hour velocity thresholds, departmental budgets, and instant circuit-breakers for autonomous agents.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-2xl surface-inset font-mono text-xs space-y-2">
              <div className="flex justify-between text-ink-muted">
                <span>24h Velocity</span>
                <span className="text-ink">$450 / $2,500</span>
              </div>
              <div className="w-full bg-subtle h-1.5 rounded-full overflow-hidden">
                <div className="bg-accent h-full w-[18%] rounded-full" />
              </div>
            </div>
          </div>

          {/* Bento Card 4 (2 Cols): Multi-Chain Intents */}
          <div className="lg:col-span-2 p-8 sm:p-10 rounded-3xl surface-card hover:border-line-strong flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-2xl bg-subtle border border-line-subtle flex items-center justify-center text-ink">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-subtle">
                  Chain Signatures
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-ink tracking-[-0.02em] mb-3">
                Bridge-Free Multi-Chain Execution
              </h3>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-xl">
                Compiles natural language disbursement instructions into deterministic cross-chain payloads. Powered by NEAR threshold MPC (<code className="text-ink font-mono">v1.signer-prod.testnet</code>), enabling direct settlement across Base, Ethereum, and Solana from a single NEAR account.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl surface-inset">
                <span className="text-ink-subtle text-[10px] block uppercase">01. Ingress</span>
                <span className="text-ink-secondary mt-1 block">Natural Intent</span>
              </div>
              <div className="p-3.5 rounded-2xl surface-inset">
                <span className="text-ink-subtle text-[10px] block uppercase">02. Clearance</span>
                <span className="text-ink-secondary mt-1 block">CoP &amp; Policy</span>
              </div>
              <div className="p-3.5 rounded-2xl surface-inset">
                <span className="text-ink-subtle text-[10px] block uppercase">03. Settlement</span>
                <span className="text-ink-secondary mt-1 block">MPC Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
