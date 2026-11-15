"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Globe,
  Copy,
  Check,
  Lock,
  Pencil,
  History,
  XCircle,
} from "lucide-react";
import { useNearWallet } from "@/context/NearWalletContext";
import { NEAR_CONFIG } from "@/lib/near/config";
import { useToast } from "@/components/ui/ToastProvider";

export default function RecipientsPage() {
  const { accountId, isConnected, connect, signChallengeProof } = useNearWallet();
  const toast = useToast();

  // Search & verification states
  const [searchAddress, setSearchAddress] = useState("");
  const [searchName, setSearchName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // Registration modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regPaymentId, setRegPaymentId] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regWallet, setRegWallet] = useState(accountId || "");
  const [regEvmWallet, setRegEvmWallet] = useState("");
  const [regBtcWallet, setRegBtcWallet] = useState("");
  const [regSolWallet, setRegSolWallet] = useState("");
  const [regXrpWallet, setRegXrpWallet] = useState("");
  const [regCosmosWallet, setRegCosmosWallet] = useState("");
  const [regStacksWallet, setRegStacksWallet] = useState("");
  const [regStellarWallet, setRegStellarWallet] = useState("");
  const [regVendorDomain, setRegVendorDomain] = useState("");
  const [registering, setRegistering] = useState(false);
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Propose Edit modal states
  const [editingTarget, setEditingTarget] = useState<any | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editWallet, setEditWallet] = useState("");
  const [editEvmWallet, setEditEvmWallet] = useState("");
  const [editReason, setEditReason] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Governance & Audit states
  const [recipientsList, setRecipientsList] = useState<any[]>([]);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [sputnikCouncil, setSputnikCouncil] = useState<{
    daoContract: string;
    members: string[];
    source: string;
    error?: string;
  } | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchRecipients = async () => {
    try {
      const res = await fetch("/api/recipients");
      const data = await res.json();
      if (data.recipients) setRecipientsList(data.recipients);
      if (data.pendingChanges) setPendingChanges(data.pendingChanges);
      if (data.auditLog) setAuditLog(data.auditLog);
      if (data.sputnikCouncil) setSputnikCouncil(data.sputnikCouncil);
    } catch (e) {
      console.error("Failed to load recipients:", e);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAddress.trim()) return;

    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch("/api/recipients/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: searchAddress.trim(),
          name: searchName.trim() || undefined,
        }),
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      console.error("Verify recipient error:", err);
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !accountId) {
      toast.warning("Connect your NEAR wallet to submit a payee registration.", "Wallet Required");
      connect();
      return;
    }
    if (!regDisplayName || !regWallet) return;

    setRegistering(true);
    try {
      const authProof = await signChallengeProof(`register:${regWallet.trim().toLowerCase()}`);
      const res = await fetch("/api/recipients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authProof,
          requestedBy: accountId,
          displayName: regDisplayName.trim(),
          paymentId: regPaymentId.trim() || undefined,
          walletAddress: regWallet.trim(),
          evmAddress: regEvmWallet.trim() || undefined,
          bitcoinAddress: regBtcWallet.trim() || undefined,
          solanaAddress: regSolWallet.trim() || undefined,
          xrpAddress: regXrpWallet.trim() || undefined,
          cosmosAddress: regCosmosWallet.trim() || undefined,
          stacksAddress: regStacksWallet.trim() || undefined,
          stellarAddress: regStellarWallet.trim() || undefined,
          vendorDomain: regVendorDomain.trim() || undefined,
          notes: "Submitted for dual-control verification.",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          `Counterparty "${regDisplayName}" queued as UNVERIFIED for second-signer approval.`
        );
        await fetchRecipients();
        setShowRegisterModal(false);
        setRegPaymentId("");
        setRegDisplayName("");
        setRegEvmWallet("");
        setRegBtcWallet("");
        setRegSolWallet("");
        setRegXrpWallet("");
        setRegCosmosWallet("");
        setRegStacksWallet("");
        setRegStellarWallet("");
        setRegVendorDomain("");
      } else {
        toast.error(data.error || "Failed to register recipient", "Registration Blocked");
      }
    } catch (err: any) {
      console.error("Register recipient error:", err);
      toast.error(err?.message || "Failed to register counterparty on server.", "Registration Failed");
    } finally {
      setRegistering(false);
    }
  };

  const openEditModal = (r: any) => {
    if (!isConnected || !accountId) {
      toast.warning("Connect your NEAR wallet to propose a payee update.", "Wallet Required");
      connect();
      return;
    }
    setEditingTarget(r);
    setEditDisplayName(r.displayName || "");
    setEditWallet(r.walletAddress || "");
    setEditEvmWallet(r.evmAddress || "");
    setEditReason("");
  };

  const handleProposeUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget || !accountId) return;

    setSubmittingEdit(true);
    try {
      const authProof = await signChallengeProof(`propose_update:${editingTarget.paymentId}`);
      const res = await fetch("/api/recipients", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authProof,
          requestedBy: accountId,
          paymentId: editingTarget.paymentId,
          reason: editReason.trim() || "Settlement endpoint update",
          proposedValues: {
            displayName: editDisplayName.trim(),
            walletAddress: editWallet.trim(),
            evmAddress: editEvmWallet.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          `Change request queued for "${editingTarget.displayName}". Active verified record remains locked until approved.`
        );
        setEditingTarget(null);
        await fetchRecipients();
      } else {
        toast.error(data.error || "Failed to propose update", "Update Error");
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error proposing payee update.", "Update Failed");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleReviewChange = async (changeId: string, decision: "APPROVE" | "REJECT") => {
    if (!isConnected || !accountId) {
      toast.warning("Connect an authorized second-signer NEAR wallet to review.", "Wallet Required");
      connect();
      return;
    }

    setReviewingId(changeId);
    try {
      const authProof = await signChallengeProof(`review:${decision}:${changeId}`);
      const res = await fetch("/api/recipients/changes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authProof,
          changeId,
          decision,
          approverAccountId: accountId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          decision === "APPROVE"
            ? "Change approved and recorded in the immutable audit log."
            : "Change request rejected; live payee record unchanged."
        );
        await fetchRecipients();
      } else {
        toast.error(data.error || "Review action blocked.", "Dual-Control Policy");
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error submitting review.", "Review Failed");
    } finally {
      setReviewingId(null);
    }
  };

  const handleVerifyDomain = async (paymentId: string, vendorDomain?: string) => {
    setVerifyingDomainId(paymentId);
    try {
      const res = await fetch("/api/recipients/verify-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          domain: vendorDomain,
          actorAccountId: accountId || "operator-dns-check",
        }),
      });
      const data = await res.json();
      if (res.ok && data.attestation?.verified) {
        toast.success(
          `DNS TXT proof verified for ${data.attestation.domain} (${data.attestation.matchedHost}).`,
          "Domain Attested"
        );
        await fetchRecipients();
      } else {
        toast.warning(
          data.attestation?.error || data.error || "DNS TXT record not found yet.",
          "DNS Proof Pending"
        );
      }
    } catch {
      toast.error("Failed to check DNS TXT record.", "Network Error");
    } finally {
      setVerifyingDomainId(null);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-ink">
              Identity Registry
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-ink-subtle" />
            <span className="text-xs text-ink-muted">NEAR Protocol · Multi-Chain Confirmation of Payee</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Confirmation of Payee Directory
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Verify counterparties before paying across NEAR, Base, Bitcoin, Solana, XRP, Cosmos, Stacks, and Stellar.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs w-fit focus-ring"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Payee</span>
        </button>
      </div>

      {/* Verification Tool */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent-ink" />
            <span>Interactive Multi-Chain Payee Verification Engine</span>
          </h3>
          <p className="text-xs text-ink-muted mt-1">
            Test any NEAR Account ID or cross-chain address (EVM, Bitcoin, Solana, XRP, Cosmos, Stacks, Stellar) to screen for fraud.
          </p>
        </div>

        <form onSubmit={handleVerify} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-ink-secondary">Recipient Account / Address</label>
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="e.g. leprof.testnet, 0x71C8..., bc1q..., 7xKX..., or r9cZA..."
              className="input-field px-4 py-2.5 text-xs font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-secondary">Expected Business Name (Optional)</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g. LeProf Consulting"
              className="input-field px-4 py-2.5 text-xs"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={verifying}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs focus-ring"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Multi-Chain Directory...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Run Confirmation of Payee Check</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Verification Result Display */}
        {verifyResult && (
          <div
            className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in ${
              verifyResult.status === "VERIFIED"
                ? "bg-success-soft border-success-border text-success"
                : verifyResult.status === "WARNING"
                ? "bg-warning-soft border-warning-border text-warning"
                : "bg-danger-soft border-danger-border text-danger"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2 rounded-xl mt-0.5 bg-elevated border border-line-subtle ${
                  verifyResult.status === "VERIFIED"
                    ? "text-success"
                    : "text-warning"
                }`}
              >
                {verifyResult.status === "VERIFIED" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold">Verification Result: {verifyResult.status}</span>
                  {verifyResult.displayName && (
                    <span className="text-xs text-ink-secondary">
                      ({verifyResult.displayName})
                    </span>
                  )}
                  {verifyResult.chain && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-info-soft text-info border border-info-border">
                      {verifyResult.chain}
                    </span>
                  )}
                  {verifyResult.settlementRail && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-soft text-accent-ink border border-accent-border">
                      {verifyResult.settlementRail}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed max-w-xl">
                  {verifyResult.reason}
                </p>
              </div>
            </div>

            {verifyResult.status === "VERIFIED" && (
              <a
                href={`/pay?recipient=${verifyResult.walletAddress}`}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success hover:bg-success/90 text-white text-xs font-semibold shadow-surface transition-all self-start sm:self-center focus-ring"
              >
                <span>Pay Verified Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Verified Directory Table */}
      <div className="surface-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <Users className="h-4 w-4 text-accent-ink" />
            <span>Registered Multi-Chain Payee Directory</span>
          </h3>
          <span className="text-xs text-ink-muted">{recipientsList.length} entities registered</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {recipientsList.map((r) => (
            <div
              key={r.id}
              className="surface-inset p-5 rounded-2xl flex flex-col gap-4 hover:border-line-strong transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-base font-bold text-ink">{r.displayName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-soft text-accent-ink border border-accent-border">
                    Handle: {r.paymentId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      r.verificationStatus === "VERIFIED"
                        ? "bg-success-soft text-success border-success-border"
                        : r.verificationStatus === "UNVERIFIED"
                        ? "bg-subtle text-ink-muted border-line"
                        : "bg-warning-soft text-warning border-warning-border"
                    }`}
                  >
                    {r.verificationStatus}
                  </span>
                  {r.vendorDomain && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        r.domainVerified
                          ? "bg-success-soft text-success border-success-border"
                          : "bg-warning-soft text-warning border-warning-border"
                      }`}
                    >
                      {r.domainVerified ? `DNS Verified: ${r.vendorDomain}` : `DNS Pending: ${r.vendorDomain}`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {r.vendorDomain && !r.domainVerified && (
                    <button
                      type="button"
                      disabled={verifyingDomainId === r.paymentId}
                      onClick={() => handleVerifyDomain(r.paymentId, r.vendorDomain)}
                      className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs focus-ring"
                      title={`Verify _paysure.${r.vendorDomain} TXT record`}
                    >
                      {verifyingDomainId === r.paymentId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5 text-warning" />
                      )}
                      <span>Verify DNS</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEditModal(r)}
                    className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs focus-ring"
                    title="Propose address or entity update (requires second-signer approval)"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Propose Edit</span>
                  </button>
                  <a
                    href={`${NEAR_CONFIG.explorerUrl}/address/${r.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary p-2 rounded-lg text-ink-secondary hover:text-ink focus-ring"
                    title="View on NEARBlocks"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={`/pay?recipient=${r.walletAddress}`}
                    className="btn-primary px-3.5 py-1.5 rounded-xl text-xs focus-ring"
                  >
                    Send Payment
                  </a>
                </div>
              </div>

              {/* Multi-Chain Address Badges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
                {/* NEAR */}
                <div className="p-2.5 rounded-xl bg-elevated border border-line-subtle flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-[10px] text-ink-subtle uppercase block font-sans">NEAR Protocol</span>
                    <span className="text-ink truncate block text-[11px]">{r.walletAddress}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(r.walletAddress, `${r.id}-near`)}
                    className="text-ink-subtle hover:text-ink shrink-0 p-1 rounded focus-ring"
                  >
                    {copiedAddress === `${r.id}-near` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* EVM */}
                {r.evmAddress && (
                  <div className="p-2.5 rounded-xl bg-elevated border border-line-subtle flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-info uppercase block font-sans">Base / Ethereum (EVM)</span>
                      <span className="text-ink truncate block text-[11px]">{r.evmAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.evmAddress, `${r.id}-evm`)}
                      className="text-ink-subtle hover:text-ink shrink-0 p-1 rounded focus-ring"
                    >
                      {copiedAddress === `${r.id}-evm` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Solana */}
                {r.solanaAddress && (
                  <div className="p-2.5 rounded-xl bg-elevated border border-line-subtle flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-purple-500 uppercase block font-sans">Solana</span>
                      <span className="text-ink truncate block text-[11px]">{r.solanaAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.solanaAddress, `${r.id}-sol`)}
                      className="text-ink-subtle hover:text-ink shrink-0 p-1 rounded focus-ring"
                    >
                      {copiedAddress === `${r.id}-sol` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Bitcoin */}
                {r.bitcoinAddress && (
                  <div className="p-2.5 rounded-xl bg-elevated border border-line-subtle flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-warning uppercase block font-sans">Bitcoin</span>
                      <span className="text-ink truncate block text-[11px]">{r.bitcoinAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.bitcoinAddress, `${r.id}-btc`)}
                      className="text-ink-subtle hover:text-ink shrink-0 p-1 rounded focus-ring"
                    >
                      {copiedAddress === `${r.id}-btc` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Ripple XRP */}
                {r.xrpAddress && (
                  <div className="p-2.5 rounded-xl bg-elevated border border-line-subtle flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-accent-ink uppercase block font-sans">Ripple (XRP)</span>
                      <span className="text-ink truncate block text-[11px]">{r.xrpAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.xrpAddress, `${r.id}-xrp`)}
                      className="text-ink-subtle hover:text-ink shrink-0 p-1 rounded focus-ring"
                    >
                      {copiedAddress === `${r.id}-xrp` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Cosmos */}
                {r.cosmosAddress && (
                  <div className="p-2.5 rounded-xl bg-elevated border border-line-subtle flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-indigo-500 uppercase block font-sans">Cosmos Hub</span>
                      <span className="text-ink truncate block text-[11px]">{r.cosmosAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.cosmosAddress, `${r.id}-cosmos`)}
                      className="text-ink-subtle hover:text-ink shrink-0 p-1 rounded focus-ring"
                    >
                      {copiedAddress === `${r.id}-cosmos` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Stacks */}
                {r.stacksAddress && (
                  <div className="p-2.5 rounded-xl bg-elevated border border-line-subtle flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-orange-500 uppercase block font-sans">Stacks (Bitcoin L2)</span>
                      <span className="text-ink truncate block text-[11px]">{r.stacksAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.stacksAddress, `${r.id}-stacks`)}
                      className="text-ink-subtle hover:text-ink shrink-0 p-1 rounded focus-ring"
                    >
                      {copiedAddress === `${r.id}-stacks` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Stellar */}
                {r.stellarAddress && (
                  <div className="p-2.5 rounded-xl bg-elevated border border-line-subtle flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-success uppercase block font-sans">Stellar</span>
                      <span className="text-ink truncate block text-[11px]">{r.stellarAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.stellarAddress, `${r.id}-stellar`)}
                      className="text-ink-subtle hover:text-ink shrink-0 p-1 rounded focus-ring"
                    >
                      {copiedAddress === `${r.id}-stellar` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {r.notes && <p className="text-[11px] text-ink-muted font-sans">{r.notes}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Dual-Control Approval Queue & Immutable Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approval Queue */}
        <div className="surface-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Lock className="h-4 w-4 text-accent-ink" />
                <span>Pending Registry Approvals</span>
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Only verified SputnikDAO council members ({sputnikCouncil?.daoContract || "paysure-council.sputnik-dao.testnet"}) other than the requester can approve.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-subtle border border-line-subtle text-ink-secondary">
              {pendingChanges.filter((c) => c.status === "PENDING_APPROVAL").length} Pending
            </span>
          </div>

          {sputnikCouncil && (
            <div className="surface-inset p-3 rounded-xl text-[11px] flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-ink-secondary">
                DAO: <strong className="text-ink">{sputnikCouncil.daoContract}</strong>{" "}
                <span className="text-ink-muted">({sputnikCouncil.source})</span>
              </div>
              <div className="font-mono text-ink-muted">
                {sputnikCouncil.members.length > 0
                  ? `${sputnikCouncil.members.length} Council Member(s)`
                  : "No council members resolved"}
              </div>
            </div>
          )}

          {pendingChanges.length === 0 ? (
            <div className="surface-inset p-6 rounded-xl text-center text-xs text-ink-muted">
              No pending registry changes. All verified payee records are locked.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingChanges.map((chg) => {
                const isSelfRequester =
                  accountId && accountId.toLowerCase() === chg.requestedBy?.toLowerCase();
                const isCouncilMember =
                  accountId &&
                  sputnikCouncil?.members?.includes(accountId.trim().toLowerCase());
                const canApprove = Boolean(isConnected && !isSelfRequester && isCouncilMember);
                const isPending = chg.status === "PENDING_APPROVAL";
                return (
                  <div key={chg.id} className="surface-inset p-4 rounded-xl space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-ink">{chg.displayName}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-soft text-accent-ink border border-accent-border">
                            {chg.changeType === "NEW_REGISTRATION" ? "New Payee" : "Address Update"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              chg.status === "APPROVED"
                                ? "bg-success-soft text-success border-success-border"
                                : chg.status === "REJECTED"
                                ? "bg-danger-soft text-danger border-danger-border"
                                : "bg-warning-soft text-warning border-warning-border"
                            }`}
                          >
                            {chg.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted mt-1 font-mono">
                          Proposed by: <span className="text-ink-secondary">{chg.requestedBy}</span>
                          {chg.approvedBy && (
                            <> · Reviewed by: <span className="text-ink-secondary">{chg.approvedBy}</span></>
                          )}
                        </p>
                      </div>
                    </div>

                    {chg.reason && (
                      <p className="text-xs text-ink-secondary">{chg.reason}</p>
                    )}

                    <div className="text-[11px] font-mono bg-elevated border border-line-subtle rounded-lg p-2.5 space-y-1">
                      {chg.previousValues?.walletAddress &&
                        chg.previousValues.walletAddress !== chg.proposedValues?.walletAddress && (
                          <div className="text-ink-muted truncate">
                            NEAR: <span className="line-through text-danger">{chg.previousValues.walletAddress}</span>{" "}
                            &rarr; <span className="text-success">{chg.proposedValues.walletAddress}</span>
                          </div>
                        )}
                      {chg.previousValues?.evmAddress !== chg.proposedValues?.evmAddress && (
                        <div className="text-ink-muted truncate">
                          EVM: <span className="line-through text-danger">{chg.previousValues?.evmAddress || "none"}</span>{" "}
                          &rarr; <span className="text-success">{chg.proposedValues?.evmAddress || "none"}</span>
                        </div>
                      )}
                      {chg.changeType === "NEW_REGISTRATION" && (
                        <div className="text-ink-secondary truncate">
                          NEAR: {chg.proposedValues?.walletAddress}
                        </div>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        {isSelfRequester ? (
                          <span className="text-[11px] text-warning font-medium">
                            Self-approval blocked (Dual Control: connect another council wallet)
                          </span>
                        ) : isConnected && !isCouncilMember ? (
                          <span className="text-[11px] text-danger font-medium">
                            {accountId} is not a verified {sputnikCouncil?.daoContract || "SputnikDAO"} council member
                          </span>
                        ) : (
                          <span className="text-[11px] text-ink-muted">
                            {isConnected ? `Council signer: ${accountId}` : "Connect a SputnikDAO council wallet to review"}
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={reviewingId === chg.id || (isConnected && !isCouncilMember)}
                            onClick={() => handleReviewChange(chg.id, "REJECT")}
                            className="btn-secondary px-3 py-1.5 rounded-lg text-xs text-danger border-danger-border flex items-center gap-1 focus-ring"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                          <button
                            type="button"
                            disabled={reviewingId === chg.id || (isConnected && !canApprove)}
                            onClick={() => handleReviewChange(chg.id, "APPROVE")}
                            className="btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 focus-ring"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Immutable Audit Trail */}
        <div className="surface-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <History className="h-4 w-4 text-info" />
                <span>Registry Audit Trail</span>
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Append-only log of payee registrations, approvals, rejections, and 24h cooldowns.
              </p>
            </div>
            <span className="text-[11px] font-mono text-ink-muted">{auditLog.length} events</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {auditLog.map((entry) => (
              <div key={entry.id} className="surface-inset p-3.5 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      entry.action === "APPROVED"
                        ? "bg-success-soft text-success border-success-border"
                        : entry.action === "REJECTED"
                        ? "bg-danger-soft text-danger border-danger-border"
                        : entry.action === "COOLDOWN_TRIGGERED"
                        ? "bg-warning-soft text-warning border-warning-border"
                        : "bg-info-soft text-info border-info-border"
                    }`}
                  >
                    {entry.action}
                  </span>
                  <span className="text-[10px] font-mono text-ink-subtle">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-ink-secondary leading-relaxed">{entry.summary}</p>
                <p className="text-[10px] font-mono text-ink-muted">
                  Actor: {entry.actor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-elevated border border-line p-6 sm:p-8 shadow-popover space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-line-subtle">
              <div>
                <h3 className="text-lg font-bold text-ink">Register Multi-Chain Payee</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Link human-readable handles to addresses across NEAR, Base, Bitcoin, Solana, XRP, Cosmos, Stacks, and Stellar.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-ink-subtle hover:text-ink text-sm p-1 rounded-lg focus-ring"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-secondary">Legal or Trading Name *</label>
                  <input
                    type="text"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    placeholder="e.g. Aurora Labs Ltd"
                    className="input-field px-3.5 py-2 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-secondary">Unique Payment Handle *</label>
                  <input
                    type="text"
                    value={regPaymentId}
                    onChange={(e) => setRegPaymentId(e.target.value)}
                    placeholder="e.g. aurora-dev"
                    className="input-field px-3.5 py-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-secondary">Primary NEAR Account ID *</label>
                <input
                  type="text"
                  value={regWallet}
                  onChange={(e) => setRegWallet(e.target.value)}
                  placeholder="e.g. aurora.testnet"
                  className="input-field px-3.5 py-2 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-secondary">
                  Vendor Official Domain (TOFU Cryptographic Proof, Optional)
                </label>
                <input
                  type="text"
                  value={regVendorDomain}
                  onChange={(e) => setRegVendorDomain(e.target.value)}
                  placeholder="e.g. acme-design.com"
                  className="input-field px-3.5 py-2 text-xs font-mono"
                />
                {regVendorDomain.trim() && (
                  <div className="surface-inset p-2.5 rounded-xl text-[10px] font-mono text-ink-muted space-y-1">
                    <div className="text-ink-secondary font-sans font-semibold">
                      Vendor must publish this DNS TXT record to prove day-one domain ownership:
                    </div>
                    <div className="text-accent-ink break-all">
                      _paysure.{regVendorDomain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0]} TXT &quot;paysure-verify={regWallet.trim().toLowerCase() || "<near-account>"}&quot;
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Chain Section */}
              <div className="pt-2 border-t border-line-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-accent-ink" />
                    <span>Multi-Chain Cross-Settlement Endpoints (Optional)</span>
                  </span>
                  <span className="text-[10px] text-ink-subtle font-mono">Model A &amp; Chain Signatures</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-info">Base / Ethereum (EVM)</label>
                    <input
                      type="text"
                      value={regEvmWallet}
                      onChange={(e) => setRegEvmWallet(e.target.value)}
                      placeholder="0x..."
                      className="input-field px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-warning">Bitcoin Native</label>
                    <input
                      type="text"
                      value={regBtcWallet}
                      onChange={(e) => setRegBtcWallet(e.target.value)}
                      placeholder="bc1q..."
                      className="input-field px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-purple-500">Solana</label>
                    <input
                      type="text"
                      value={regSolWallet}
                      onChange={(e) => setRegSolWallet(e.target.value)}
                      placeholder="Base58..."
                      className="input-field px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-accent-ink">Ripple (XRP)</label>
                    <input
                      type="text"
                      value={regXrpWallet}
                      onChange={(e) => setRegXrpWallet(e.target.value)}
                      placeholder="r..."
                      className="input-field px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-indigo-500">Cosmos Hub</label>
                    <input
                      type="text"
                      value={regCosmosWallet}
                      onChange={(e) => setRegCosmosWallet(e.target.value)}
                      placeholder="cosmos1..."
                      className="input-field px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-orange-500">Stacks (Bitcoin L2)</label>
                    <input
                      type="text"
                      value={regStacksWallet}
                      onChange={(e) => setRegStacksWallet(e.target.value)}
                      placeholder="SP..."
                      className="input-field px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-success">Stellar</label>
                    <input
                      type="text"
                      value={regStellarWallet}
                      onChange={(e) => setRegStellarWallet(e.target.value)}
                      placeholder="G..."
                      className="input-field px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-line-subtle">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="btn-secondary px-4 py-2 rounded-xl text-xs focus-ring"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="btn-primary px-6 py-2.5 rounded-xl text-xs focus-ring"
                >
                  {registering ? "Queuing for Approval..." : "Submit for Dual-Control Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Propose Edit Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-elevated border border-line p-6 sm:p-8 shadow-popover space-y-5 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-line-subtle">
              <div>
                <h3 className="text-lg font-bold text-ink">Propose Payee Update</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Active verified record stays locked until a second signer approves. Address edits trigger a 24h WARNING cooldown.
                </p>
              </div>
              <button
                onClick={() => setEditingTarget(null)}
                className="text-ink-subtle hover:text-ink text-sm p-1 rounded-lg focus-ring"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProposeUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-secondary">Legal / Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="input-field px-3.5 py-2 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-secondary">Primary NEAR Account ID</label>
                <input
                  type="text"
                  value={editWallet}
                  onChange={(e) => setEditWallet(e.target.value)}
                  className="input-field px-3.5 py-2 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-info">Base / Ethereum (EVM) Address</label>
                <input
                  type="text"
                  value={editEvmWallet}
                  onChange={(e) => setEditEvmWallet(e.target.value)}
                  placeholder="0x..."
                  className="input-field px-3.5 py-2 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-secondary">Reason for Change *</label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Scheduled corporate key rotation"
                  className="input-field px-3.5 py-2 text-xs"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-line-subtle">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="btn-secondary px-4 py-2 rounded-xl text-xs focus-ring"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs focus-ring"
                >
                  {submittingEdit ? "Submitting..." : "Queue Change Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
