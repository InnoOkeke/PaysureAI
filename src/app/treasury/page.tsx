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
  ArrowRight
} from "lucide-react";
import { DEFAULT_TREASURY_POLICY } from "@/lib/treasury/policyEngine";
import { formatCurrency } from "@/lib/utils";

export default function TreasuryPage() {
  const [maxSingleTx, setMaxSingleTx] = useState(DEFAULT_TREASURY_POLICY.maxSingleTxAmountUSD);
  const [dailyCap, setDailyCap] = useState(DEFAULT_TREASURY_POLICY.dailyVelocityCapUSD);
  const [autoApproveUnder, setAutoApproveUnder] = useState(DEFAULT_TREASURY_POLICY.autoApproveVerifiedUnderUSD);
  const [killswitch, setKillswitch] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [budgets, setBudgets] = useState(DEFAULT_TREASURY_POLICY.departmentBudgets);

  const spentTodayUSD = 180;
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

  return (
    <div className="min-h-screen bg-[#070B14] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              AI Security &amp; Autonomous Business
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-400">Human-Defined Policy Rails</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Treasury Guardrails &amp; Security Policy Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Control AI spending with cryptographic spending limits, departmental budgets, and counterparty reputation scores.
          </p>
        </div>

        {/* Emergency Killswitch Toggle */}
        <button
          onClick={() => setKillswitch(!killswitch)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
            killswitch
              ? "bg-rose-600 text-white shadow-rose-600/30 animate-pulse"
              : "bg-navy-900 hover:bg-navy-850 text-slate-300 border border-navy-800"
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>{killswitch ? "KILLSWITCH ENGAGED (FROZEN)" : "Emergency Killswitch: Idle"}</span>
        </button>
      </div>

      {/* Killswitch Alert Banner */}
      {killswitch && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-center justify-between text-rose-300 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">ALL AUTONOMOUS TREASURY SPENDING IS FROZEN</p>
              <p className="text-slate-300 mt-0.5">
                The AI Agent cannot initiate or execute any payouts until the human treasury admin disengages the emergency circuit breaker.
              </p>
            </div>
          </div>
          <button
            onClick={() => setKillswitch(false)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
          >
            Disengage
          </button>
        </div>
      )}

      {/* 1. Spending Limits & Velocity Circuit Breakers */}
      <form onSubmit={handleSave} className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Spending Limits &amp; Safeguards</h3>
              <p className="text-xs text-slate-400">Hard boundary constraints enforced before any transaction signature</p>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{savedSuccess ? "Saved Policy!" : "Save Policy"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Max Single Tx */}
          <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300">Max Single Tx Limit</label>
              <span className="font-mono text-sm font-bold text-brand-300">${maxSingleTx}.00</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={maxSingleTx}
              onChange={(e) => setMaxSingleTx(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Any single invoice or intent above this amount requires multi-human sign-off.
            </p>
          </div>

          {/* Daily Velocity Cap */}
          <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300">24-Hour Velocity Cap</label>
              <span className="font-mono text-sm font-bold text-brand-300">${dailyCap}.00</span>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={dailyCap}
              onChange={(e) => setDailyCap(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Today's Spend: ${spentTodayUSD}.00</span>
                <span>{velocityPercentage}% Used</span>
              </div>
              <div className="h-1.5 w-full bg-navy-850 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    velocityPercentage > 80 ? "bg-rose-500" : "bg-emerald-400"
                  }`}
                  style={{ width: `${velocityPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Autonomous Auto-Approve Threshold */}
          <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300">Auto-Approve Threshold</label>
              <span className="font-mono text-sm font-bold text-emerald-400">${autoApproveUnder}.00</span>
            </div>
            <input
              type="range"
              min="10"
              max="250"
              step="10"
              value={autoApproveUnder}
              onChange={(e) => setAutoApproveUnder(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Invoices from <strong>VERIFIED</strong> vendors under this amount settle autonomously without prompting.
            </p>
          </div>
        </div>
      </form>

      {/* 2. Department Procurement Budgets */}
      <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Departmental Procurement Budgets</h3>
              <p className="text-xs text-slate-400">Autonomous business budgets matching incoming procurement requests</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Monthly Fiscal Cycle</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {budgets.map((b) => {
            const pct = Math.min(100, Math.round((b.spentThisMonthUSD / b.monthlyBudgetUSD) * 100));
            return (
              <div key={b.category} className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2.5">
                <span className="text-xs font-bold text-white block truncate">{b.category}</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-extrabold text-brand-300 font-mono">
                    ${b.spentThisMonthUSD}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ ${b.monthlyBudgetUSD}</span>
                </div>
                <div className="h-1.5 w-full bg-navy-850 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      pct > 85 ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{pct}% Allocated</span>
                  <span className="text-emerald-400">${b.monthlyBudgetUSD - b.spentThisMonthUSD} Remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Human-Defined Autonomous Rules Matrix */}
      <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-navy-800">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Autonomous Decision Rules Engine</h3>
            <p className="text-xs text-slate-400">Active human-defined logic trees evaluated by PaySure AI Copilot</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-navy-950/80 border border-emerald-500/30 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Rule 1: Autonomous Micro-Settlement</p>
                <p className="text-slate-300 mt-0.5">
                  IF <span className="text-emerald-400 font-mono">Payee == VERIFIED</span> AND <span className="text-emerald-400 font-mono">Amount &lt;= ${autoApproveUnder}</span> AND <span className="text-emerald-400 font-mono">Category within Budget</span> &rarr; Execute instant intent settlement on NEAR.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
              ACTIVE
            </span>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/80 border border-amber-500/30 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Rule 2: Threshold Escalation Protocol</p>
                <p className="text-slate-300 mt-0.5">
                  IF <span className="text-amber-400 font-mono">Amount &gt; ${maxSingleTx}</span> OR <span className="text-amber-400 font-mono">Payee == UNVERIFIED</span> &rarr; Halt autonomous execution and require dual-human authorization.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold">
              ENFORCED
            </span>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/80 border border-rose-500/30 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Rule 3: Anti-Poisoning &amp; Spoofing Defense</p>
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

