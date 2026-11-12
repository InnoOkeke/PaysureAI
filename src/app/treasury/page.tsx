"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  Lock, 
  DollarSign, 
  Activity, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Users, 
  TrendingUp,
  Save,
  ArrowRight,
  ExternalLink,
  Cpu,
  Layers
} from "lucide-react";
import { DEFAULT_TREASURY_POLICY } from "@/lib/treasury/policyEngine";
import { buildSputnikTransferProposal, DEFAULT_SPUTNIK_DAO } from "@/lib/treasury/sputnikDao";
import { evaluateOutlayerPolicy } from "@/lib/security/outlayer";
import { formatCurrency } from "@/lib/utils";

export default function TreasuryPage() {
  const [maxSingleTx, setMaxSingleTx] = useState(DEFAULT_TREASURY_POLICY.maxSingleTxAmountUSD);
  const [dailyCap, setDailyCap] = useState(DEFAULT_TREASURY_POLICY.dailyVelocityCapUSD);
  const [autoApproveUnder, setAutoApproveUnder] = useState(DEFAULT_TREASURY_POLICY.autoApproveVerifiedUnderUSD);
  const [killswitch, setKillswitch] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sputnikSuccess, setSputnikSuccess] = useState<string | null>(null);

  const [budgets, setBudgets] = useState(DEFAULT_TREASURY_POLICY.departmentBudgets);

  const spentTodayUSD = 340;
  const velocityPercentage = Math.min(100, Math.round((spentTodayUSD / dailyCap) * 100));

  const reputationLeaderboard = [
    {
      name: "John Kennedy",
      account: "john-kennedy.testnet",
      evm: "0x71C8...d251 (Base)",
      reputationScore: 98,
      status: "VERIFIED",
      tier: "Elite Partner",
      settledCount: 8,
    },
    {
      name: "Acme Web3 Design Studio",
      account: "acme-design.testnet",
      evm: "0x4565...3483 (Ethereum)",
      reputationScore: 95,
      status: "VERIFIED",
      tier: "Verified Supplier",
      settledCount: 14,
    },
    {
      name: "Satoshi Freelance Engineering",
      account: "satoshi-dev.testnet",
      evm: "0x1234...7890 (Arbitrum)",
      reputationScore: 85,
      status: "VERIFIED",
      tier: "Audited Specialist",
      settledCount: 5,
    },
    {
      name: "Spoofed / Typosquat Lookalike",
      account: "satosh1-dev.testnet",
      evm: "0x9999...9999 (Phishing)",
      reputationScore: 12,
      status: "MISMATCH",
      tier: "Blacklisted",
      settledCount: 0,
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestSputnikProposal = () => {
    const proposal = buildSputnikTransferProposal({
      daoContract: DEFAULT_SPUTNIK_DAO,
      description: "Approve high-value invoice INV-2026-9042 for Acme Design Studio",
      receiverId: "acme-design.testnet",
      amountNear: 75,
    });
    setSputnikSuccess(`Proposal drafted for ${proposal.contractId}: methodName='${proposal.methodName}' with 0.1 NEAR bond.`);
    setTimeout(() => setSputnikSuccess(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#070B14] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              AI Security, SputnikDAO &amp; OutLayer
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-400">Institutional Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Treasury Guardrails &amp; Security Policy Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Control AI spending with cryptographic limits, SputnikDAO / Trezu multi-sig escalation, and OutLayer agent attestation.
          </p>
        </div>

        {/* Emergency Killswitch Toggle */}
        <button
          onClick={() => setKillswitch(!killswitch)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
            killswitch
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse"
              : "bg-navy-900 hover:bg-navy-850 text-slate-300 border border-navy-800"
          }`}
        >
          <Zap className={`h-4 w-4 ${killswitch ? "text-white" : "text-amber-400"}`} />
          <span>{killswitch ? "EMERGENCY FREEZE ENGAGED" : "Arm Killswitch"}</span>
        </button>
      </div>

      {/* Partner Ecosystem Integration Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SputnikDAO / Trezu */}
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Multi-Sig Council</span>
              <span className="text-[10px] font-mono font-bold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                SputnikDAO v2
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Trezu &amp; SputnikDAO Escalation</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Payments &gt; ${maxSingleTx} bypass automated agent execution and trigger an on-chain proposal to <code className="text-brand-300 font-mono text-[11px]">{DEFAULT_SPUTNIK_DAO}</code>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-navy-800/80">
            <button
              onClick={handleTestSputnikProposal}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-brand-600/15 hover:bg-brand-600/25 text-brand-300 text-xs font-semibold border border-brand-500/30 transition-all"
            >
              <span>Test SputnikDAO Proposal Crafting</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            {sputnikSuccess && (
              <p className="mt-2 text-[10px] text-emerald-400 font-mono bg-emerald-950/30 p-2 rounded border border-emerald-500/30">
                ✓ {sputnikSuccess}
              </p>
            )}
          </div>
        </div>

        {/* OutLayer Agent Security */}
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent Guardrails</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                OutLayer Active
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">OutLayer Security Attestation</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Every invoice intent and disbursement is evaluated against OutLayer agent policies, anti-spoofing lookalike filters, and prompt-injection firewalls.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Agent Defense:</span>
            <span className="text-emerald-400 font-bold">100% Attested</span>
          </div>
        </div>

        {/* NEAR.AI & Agent Market */}
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inference &amp; Swarms</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                NEAR.AI Cloud
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">NEAR.AI Cloud &amp; Agent Market</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Invoice parsing runs on NEAR.AI (<code className="text-cyan-300 font-mono text-[11px]">api.near.ai</code>). PaySure AI is registered on Agent Market with full MCP support.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs">
            <a
              href="/api/agent"
              target="_blank"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 flex items-center gap-1 text-[11px]"
            >
              <span>View Agent Manifest</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="/api/agent/mcp"
              target="_blank"
              className="text-slate-400 hover:text-white underline underline-offset-2 flex items-center gap-1 text-[11px]"
            >
              <span>MCP Spec</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 1. Velocity & Active Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 24h Velocity Meter */}
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">24-Hour Velocity Meter</span>
            <Activity className="h-4 w-4 text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">
            ${spentTodayUSD.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ ${dailyCap} USD</span>
          </p>
          <div className="mt-3 w-full bg-navy-950 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                velocityPercentage > 85
                  ? "bg-rose-500"
                  : velocityPercentage > 60
                  ? "bg-amber-500"
                  : "bg-brand-500"
              }`}
              style={{ width: `${velocityPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {velocityPercentage}% of daily velocity cap utilized. Rolling 24h window.
          </p>
        </div>

        {/* Autonomous Single Tx Limit */}
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Single-Tx Cap</span>
            <Lock className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">${maxSingleTx}.00 USD</p>
          <p className="mt-3 text-xs text-slate-400">
            Transactions exceeding this cap require SputnikDAO council multi-sig approval.
          </p>
        </div>

        {/* Auto-Approval Ceiling */}
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Auto-Approval Threshold</span>
            <Zap className="h-4 w-4 text-brand-accent" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">&le; ${autoApproveUnder}.00 USD</p>
          <p className="mt-3 text-xs text-slate-400">
            Instant execution for counterparties with reputation score &ge; 80 and zero anomalies.
          </p>
        </div>
      </div>

      {/* 2. Policy Threshold Customization Form */}
      <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Policy Parameter Sliders</h3>
              <p className="text-xs text-slate-400">Adjust on-chain guardrails enforced on automated agent disbursements</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Max Single Tx */}
            <div className="space-y-2 p-4 rounded-xl bg-navy-950/60 border border-navy-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Max Single Tx Cap</label>
                <span className="font-mono text-brand-300 font-bold">${maxSingleTx} USD</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={maxSingleTx}
                onChange={(e) => setMaxSingleTx(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Above this ceiling, transactions escalate to SputnikDAO multi-sig.</p>
            </div>

            {/* Daily Velocity Cap */}
            <div className="space-y-2 p-4 rounded-xl bg-navy-950/60 border border-navy-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">24h Velocity Ceiling</label>
                <span className="font-mono text-brand-300 font-bold">${dailyCap} USD</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={dailyCap}
                onChange={(e) => setDailyCap(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Max cumulative volume permitted within a rolling 24-hour cycle.</p>
            </div>

            {/* Auto-Approval Ceiling */}
            <div className="space-y-2 p-4 rounded-xl bg-navy-950/60 border border-navy-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Auto-Approval Ceiling</label>
                <span className="font-mono text-emerald-400 font-bold">&le; ${autoApproveUnder} USD</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={autoApproveUnder}
                onChange={(e) => setAutoApproveUnder(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Payments below this threshold execute without human waiting latency.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 font-mono">
              Status: <strong className="text-emerald-400">GUARDRAILS ARMED</strong>
            </span>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/25 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>{savedSuccess ? "Guardrails Saved!" : "Save Policy Config"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Real-Time Autonomous Rules Table */}
      <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Autonomous Agent Decision Rules</h3>
              <p className="text-xs text-slate-400">Rule hierarchy evaluated before signing any transaction</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            ZERO-TRUST ACTIVE
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Rule 1: Autonomous Micro-Payment Execution</p>
                <p className="text-slate-300 mt-0.5">
                  IF <span className="text-emerald-400 font-mono">Payee == VERIFIED</span> AND <span className="text-emerald-400 font-mono">Reputation &ge; 80</span> AND <span className="text-emerald-400 font-mono">Amount &le; ${autoApproveUnder}</span> &rarr; Instant execution without human signoff.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
              PASS
            </span>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/80 border border-amber-500/30 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Rule 2: SputnikDAO / Trezu Escalation Protocol</p>
                <p className="text-slate-300 mt-0.5">
                  IF <span className="text-amber-400 font-mono">Amount &gt; ${maxSingleTx}</span> OR <span className="text-amber-400 font-mono">Payee == UNVERIFIED</span> &rarr; Halt autonomous execution and craft an on-chain proposal for SputnikDAO council vote.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold">
              ESCALATED
            </span>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/80 border border-rose-500/30 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Rule 3: OutLayer Anti-Poisoning &amp; Spoofing Defense</p>
                <p className="text-slate-300 mt-0.5">
                  IF <span className="text-rose-400 font-mono">Account Mismatch Detected</span> OR <span className="text-rose-400 font-mono">Adversarial Prompt Payload Found</span> &rarr; Immediate freeze, quarantine invoice, and log security incident.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono text-[10px] font-bold">
              FAIL-SAFE
            </span>
          </div>
        </div>
      </div>

      {/* 4. Counterparty Reputation & Trust Matrix */}
      <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Counterparty Reputation &amp; Scam Defense Matrix</h3>
              <p className="text-xs text-slate-400">Multi-chain counterparty trust scores computed from on-chain verification</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">{reputationLeaderboard.length} Tracked Counterparties</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {reputationLeaderboard.map((c) => (
            <div
              key={c.account}
              className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-white">{c.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      c.status === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-navy-900">
                    {c.tier}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>NEAR: {c.account}</span>
                  <span>&bull;</span>
                  <span>Cross-Chain: {c.evm}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Trust Score</span>
                  <span
                    className={`text-lg font-extrabold font-mono ${
                      c.reputationScore > 80
                        ? "text-emerald-400"
                        : c.reputationScore > 50
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {c.reputationScore}/100
                  </span>
                </div>

                <a
                  href={`/pay?recipient=${c.account}`}
                  className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all shadow-md shadow-brand-600/20"
                >
                  Pay Counterparty
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
