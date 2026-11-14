"use client";

import { useEffect, useState } from "react";
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
  Layers,
  ChevronDown,
  Info
} from "lucide-react";
import { DEFAULT_TREASURY_POLICY } from "@/lib/treasury/policyEngine";
import { buildSputnikTransferProposal, DEFAULT_SPUTNIK_DAO } from "@/lib/treasury/sputnikDao";
import { evaluateOutlayerPolicy } from "@/lib/security/outlayer";
import { formatCurrency } from "@/lib/utils";
import { useNearWallet } from "@/context/NearWalletContext";

export default function TreasuryPage() {
  const { accountId } = useNearWallet();
  const [maxSingleTx, setMaxSingleTx] = useState(DEFAULT_TREASURY_POLICY.maxSingleTxAmountUSD);
  const [dailyCap, setDailyCap] = useState(DEFAULT_TREASURY_POLICY.dailyVelocityCapUSD);
  const [autoApproveUnder, setAutoApproveUnder] = useState(DEFAULT_TREASURY_POLICY.autoApproveVerifiedUnderUSD);
  const [killswitch, setKillswitch] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sputnikSuccess, setSputnikSuccess] = useState<string | null>(null);
  const [spentTodayUSD, setSpentTodayUSD] = useState(340);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

  const [budgets, setBudgets] = useState(DEFAULT_TREASURY_POLICY.departmentBudgets);

  useEffect(() => {
    if (!accountId) return;
    let cancelled = false;

    setPolicyLoading(true);
    fetch(`/api/treasury/policy?accountId=${encodeURIComponent(accountId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.policy) return;
        const policy = data.policy;
        setMaxSingleTx(policy.maxSingleTxAmountUSD);
        setDailyCap(policy.dailyVelocityCapUSD);
        setAutoApproveUnder(policy.autoApproveVerifiedUnderUSD);
        setKillswitch(policy.emergencyKillswitchActive);
        if (Array.isArray(policy.departmentBudgets) && policy.departmentBudgets.length > 0) {
          setBudgets(policy.departmentBudgets);
        }
        if (typeof data.velocity?.spentUSD === "number") {
          setSpentTodayUSD(data.velocity.spentUSD);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setPolicyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accountId]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) {
      setPolicyError("Connect your NEAR wallet to persist treasury policy.");
      return;
    }

    setSavingPolicy(true);
    setPolicyError(null);
    try {
      const res = await fetch("/api/treasury/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          maxSingleTxAmountUSD: maxSingleTx,
          dailyVelocityCapUSD: dailyCap,
          autoApproveVerifiedUnderUSD: autoApproveUnder,
          emergencyKillswitchActive: killswitch,
          departmentBudgets: budgets,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to save treasury policy.");
      }
      const policy = data.policy;
      setMaxSingleTx(policy.maxSingleTxAmountUSD);
      setDailyCap(policy.dailyVelocityCapUSD);
      setAutoApproveUnder(policy.autoApproveVerifiedUnderUSD);
      setKillswitch(policy.emergencyKillswitchActive);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setPolicyError(err.message || "Failed to save treasury policy.");
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleKillswitch = async () => {
    const next = !killswitch;
    setKillswitch(next);
    if (!accountId) {
      setPolicyError("Connect your NEAR wallet to persist the killswitch state.");
      return;
    }

    setPolicyError(null);
    try {
      const res = await fetch("/api/treasury/killswitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, active: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to update killswitch.");
      }
      setKillswitch(data.policy.emergencyKillswitchActive);
    } catch (err: any) {
      setKillswitch(!next);
      setPolicyError(err.message || "Failed to update killswitch.");
    }
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
    <div className="min-h-screen bg-canvas py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-ink">
              AI Security, SputnikDAO &amp; OutLayer
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-ink-subtle" />
            <span className="text-xs text-ink-muted">Institutional Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Treasury Guardrails &amp; Security Policy Engine
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Control AI spending with cryptographic limits, SputnikDAO / Trezu multi-sig escalation, and OutLayer agent attestation.
          </p>
        </div>

        {/* Emergency Killswitch Toggle */}
        <button
          onClick={handleKillswitch}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all focus-ring ${
            killswitch
              ? "bg-danger hover:bg-danger/90 text-white shadow-surface animate-pulse"
              : "btn-secondary text-ink-secondary"
          }`}
        >
          <Zap className={`h-4 w-4 ${killswitch ? "text-white" : "text-warning"}`} />
          <span>{killswitch ? "EMERGENCY FREEZE ENGAGED" : "Arm Killswitch"}</span>
        </button>
      </div>

      {/* Partner Ecosystem Integration Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SputnikDAO / Trezu */}
        <div className="surface-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Multi-Sig Council</span>
              <span className="text-[10px] font-mono font-bold text-accent-ink bg-accent-soft px-2 py-0.5 rounded-full border border-accent-border">
                SputnikDAO v2
              </span>
            </div>
            <h4 className="text-sm font-bold text-ink">Trezu &amp; SputnikDAO Escalation</h4>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Payments &gt; ${maxSingleTx} bypass automated agent execution and trigger an on-chain proposal to <code className="text-accent-ink font-mono text-[11px]">{DEFAULT_SPUTNIK_DAO}</code>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-line-subtle">
            <button
              onClick={handleTestSputnikProposal}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-accent-soft hover:bg-accent/15 text-accent-ink text-xs font-semibold border border-accent-border transition-all focus-ring"
            >
              <span>Test SputnikDAO Proposal Crafting</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            {sputnikSuccess && (
              <p className="mt-2 text-[10px] text-success font-mono bg-success-soft p-2 rounded border border-success-border">
                ✓ {sputnikSuccess}
              </p>
            )}
          </div>
        </div>

        {/* OutLayer Agent Security */}
        <div className="surface-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Agent Guardrails</span>
              <span className="text-[10px] font-mono font-bold text-success bg-success-soft px-2 py-0.5 rounded-full border border-success-border">
                OutLayer Active
              </span>
            </div>
            <h4 className="text-sm font-bold text-ink">OutLayer Security Attestation</h4>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Every invoice intent and disbursement is evaluated against OutLayer agent policies, anti-spoofing lookalike filters, and prompt-injection firewalls.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-line-subtle flex items-center justify-between text-xs font-mono">
            <span className="text-ink-muted">Agent Defense:</span>
            <span className="text-success font-bold">100% Attested</span>
          </div>
        </div>

        {/* NEAR.AI & Agent Market */}
        <div className="surface-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Inference &amp; Swarms</span>
              <span className="text-[10px] font-mono font-bold text-info bg-info-soft px-2 py-0.5 rounded-full border border-info-border">
                NEAR.AI Cloud
              </span>
            </div>
            <h4 className="text-sm font-bold text-ink">NEAR.AI Cloud &amp; Agent Market</h4>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Invoice parsing runs on NEAR.AI (<code className="text-info font-mono text-[11px]">api.near.ai</code>). PaySure AI is registered on Agent Market with full MCP support.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-line-subtle flex items-center justify-between text-xs">
            <a
              href="/api/agent"
              target="_blank"
              className="text-info hover:underline underline-offset-2 flex items-center gap-1 text-[11px] focus-ring rounded"
            >
              <span>View Agent Manifest</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="/api/agent/mcp"
              target="_blank"
              className="text-ink-muted hover:text-ink underline underline-offset-2 flex items-center gap-1 text-[11px] focus-ring rounded"
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
        <div className="surface-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted">24-Hour Velocity Meter</span>
            <Activity className="h-4 w-4 text-accent-ink" />
          </div>
          <p className="text-2xl font-extrabold text-ink font-mono">
            ${spentTodayUSD.toFixed(2)} <span className="text-xs font-normal text-ink-muted">/ ${dailyCap} USD</span>
          </p>
          <div className="mt-3 w-full bg-subtle h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                velocityPercentage > 85
                  ? "bg-danger"
                  : velocityPercentage > 60
                  ? "bg-warning"
                  : "bg-accent"
              }`}
              style={{ width: `${velocityPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">
            {policyLoading
              ? "Syncing rolling 24h velocity from the backend..."
              : `${velocityPercentage}% of daily velocity cap utilized. Rolling 24h window.`}
          </p>
        </div>

        {/* Autonomous Single Tx Limit */}
        <div className="surface-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted">Single-Tx Cap</span>
            <Lock className="h-4 w-4 text-success" />
          </div>
          <p className="text-2xl font-extrabold text-ink font-mono">${maxSingleTx}.00 USD</p>
          <p className="mt-3 text-xs text-ink-muted">
            Transactions exceeding this cap require SputnikDAO council multi-sig approval.
          </p>
        </div>

        {/* Auto-Approval Ceiling */}
        <div className="surface-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted">Auto-Approval Threshold</span>
            <Zap className="h-4 w-4 text-info" />
          </div>
          <p className="text-2xl font-extrabold text-success font-mono">&le; ${autoApproveUnder}.00 USD</p>
          <p className="mt-3 text-xs text-ink-muted">
            Instant execution for counterparties with reputation score &ge; 80 and zero anomalies.
          </p>
        </div>
      </div>

      {/* 2. Policy Threshold Customization Form */}
      <div className="surface-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-line-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent-soft text-accent-ink">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Policy Parameter Sliders</h3>
              <p className="text-xs text-ink-muted">Adjust on-chain guardrails enforced on automated agent disbursements</p>
            </div>
          </div>
        </div>

        {policyError && (
          <div className="mb-5 p-3.5 rounded-xl bg-danger-soft border border-danger-border text-danger text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
            <span>{policyError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Max Single Tx */}
            <div className="surface-inset space-y-2 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-ink-secondary">Max Single Tx Cap</label>
                <span className="font-mono text-accent-ink font-bold">${maxSingleTx} USD</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={maxSingleTx}
                onChange={(e) => setMaxSingleTx(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <p className="text-[11px] text-ink-subtle">Above this ceiling, transactions escalate to SputnikDAO multi-sig.</p>
            </div>

            {/* Daily Velocity Cap */}
            <div className="surface-inset space-y-2 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-ink-secondary">24h Velocity Ceiling</label>
                <span className="font-mono text-accent-ink font-bold">${dailyCap} USD</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={dailyCap}
                onChange={(e) => setDailyCap(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <p className="text-[11px] text-ink-subtle">Max cumulative volume permitted within a rolling 24-hour cycle.</p>
            </div>

            {/* Auto-Approval Ceiling */}
            <div className="surface-inset space-y-2 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-ink-secondary">Auto-Approval Ceiling</label>
                <span className="font-mono text-success font-bold">&le; ${autoApproveUnder} USD</span>
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
              <p className="text-[11px] text-ink-subtle">Payments below this threshold execute without human waiting latency.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 gap-3">
            <span className="text-xs text-ink-muted font-mono">
              {accountId ? (
                <>
                  Account: <strong className="text-accent-ink">{accountId}</strong>
                </>
              ) : (
                <span className="text-warning">Connect wallet to persist policy</span>
              )}
            </span>
            <button
              type="submit"
              disabled={savingPolicy}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs focus-ring"
            >
              <Save className="h-4 w-4" />
              <span>
                {savingPolicy
                  ? "Saving..."
                  : savedSuccess
                    ? "Guardrails Saved!"
                    : "Save Policy Config"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Real-Time Autonomous Rules Table */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-line-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-success-soft text-success">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Autonomous Agent Decision Rules</h3>
              <p className="text-xs text-ink-muted">Rule hierarchy evaluated before signing any transaction</p>
            </div>
          </div>
          <span className="text-xs font-mono text-success bg-success-soft px-2.5 py-1 rounded-full border border-success-border">
            ZERO-TRUST ACTIVE
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="surface-inset p-4 rounded-xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-ink">Rule 1: Autonomous Micro-Payment Execution</p>
                <p className="text-ink-secondary mt-0.5">
                  IF <span className="text-success font-mono">Payee == VERIFIED</span> AND <span className="text-success font-mono">Reputation &ge; 80</span> AND <span className="text-success font-mono">Amount &le; ${autoApproveUnder}</span> &rarr; Instant execution without human signoff.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-success-soft text-success border border-success-border font-mono text-[10px] font-bold">
              PASS
            </span>
          </div>

          <div className="surface-inset p-4 rounded-xl !border-warning-border flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-ink">Rule 2: SputnikDAO / Trezu Escalation Protocol</p>
                <p className="text-ink-secondary mt-0.5">
                  IF <span className="text-warning font-mono">Amount &gt; ${maxSingleTx}</span> OR <span className="text-warning font-mono">Payee == UNVERIFIED</span> &rarr; Halt autonomous execution and craft an on-chain proposal for SputnikDAO council vote.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-warning-soft text-warning border border-warning-border font-mono text-[10px] font-bold">
              ESCALATED
            </span>
          </div>

          <div className="surface-inset p-4 rounded-xl !border-danger-border flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <XCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-ink">Rule 3: OutLayer Anti-Poisoning &amp; Spoofing Defense</p>
                <p className="text-ink-secondary mt-0.5">
                  IF <span className="text-danger font-mono">Account Mismatch Detected</span> OR <span className="text-danger font-mono">Adversarial Prompt Payload Found</span> &rarr; Immediate freeze, quarantine invoice, and log security incident.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-danger-soft text-danger border border-danger-border font-mono text-[10px] font-bold">
              FAIL-SAFE
            </span>
          </div>
        </div>
      </div>

      {/* 4. Counterparty Reputation & Trust Matrix */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-line-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-info-soft text-info">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Counterparty Reputation &amp; Scam Defense Matrix</h3>
              <p className="text-xs text-ink-muted">Multi-chain counterparty trust scores computed from on-chain verification</p>
            </div>
          </div>
          <span className="text-xs font-mono text-ink-muted">{reputationLeaderboard.length} Tracked Counterparties</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {reputationLeaderboard.map((c) => {
            const isExpanded = expandedAccount === c.account;
            return (
              <div
                key={c.account}
                className="surface-inset p-4 rounded-2xl transition-all hover:border-line-strong"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-ink">{c.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.status === "VERIFIED"
                            ? "bg-success-soft text-success border-success-border"
                            : "bg-danger-soft text-danger border-danger-border"
                        }`}
                      >
                        {c.status}
                      </span>
                      <span className="text-[10px] font-mono text-ink-muted px-2 py-0.5 rounded-full bg-subtle border border-line-subtle">
                        {c.tier}
                      </span>
                    </div>

                    {/* Progressive Disclosure Toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedAccount(isExpanded ? null : c.account)}
                      aria-expanded={isExpanded}
                      className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted hover:text-ink transition-colors pt-0.5 focus-ring rounded"
                    >
                      <Info className="h-3 w-3 text-ink-muted" />
                      <span>{isExpanded ? "Hide contract metadata" : "View route & metadata"}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-ink-muted uppercase tracking-wider block">Trust Score</span>
                      <span
                        className={`text-lg font-extrabold font-mono ${
                          c.reputationScore > 80
                            ? "text-success"
                            : c.reputationScore > 50
                            ? "text-warning"
                            : "text-danger"
                        }`}
                      >
                        {c.reputationScore}/100
                      </span>
                    </div>

                    <a
                      href={`/pay?recipient=${c.account}`}
                      className="btn-primary px-4 py-2 rounded-xl text-xs focus-ring"
                    >
                      Pay
                    </a>
                  </div>
                </div>

                {/* Expanded Technical Metadata Popover / Drawer */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3.5 border-t border-line-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-elevated p-3 rounded-xl border border-line-subtle animate-in fade-in duration-150">
                    <div>
                      <span className="block text-[10px] text-ink-subtle uppercase font-sans font-semibold">NEAR Identity</span>
                      <span className="text-ink text-[11px] truncate block">{c.account}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-ink-subtle uppercase font-sans font-semibold">Cross-Chain Route</span>
                      <span className="text-ink-secondary text-[11px] truncate block">{c.evm}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-ink-subtle uppercase font-sans font-semibold">Verified Settlements</span>
                      <span className="text-success font-bold text-[11px]">{c.settledCount} Transactions</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
