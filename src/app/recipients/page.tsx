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
  Check
} from "lucide-react";
import { useNearWallet } from "@/context/NearWalletContext";
import { NEAR_CONFIG } from "@/lib/near/config";

export default function RecipientsPage() {
  const { accountId } = useNearWallet();

  // Search & verification states
  const [searchAddress, setSearchAddress] = useState("");
  const [searchName, setSearchName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // Registration modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showMultiChainFields, setShowMultiChainFields] = useState(true);
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
  const [registering, setRegistering] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const [recipientsList, setRecipientsList] = useState<any[]>([]);

  const fetchRecipients = async () => {
    try {
      const res = await fetch("/api/recipients");
      const data = await res.json();
      if (data.recipients) {
        setRecipientsList(data.recipients);
      }
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
    if (!regDisplayName || !regWallet) return;

    setRegistering(true);
    try {
      const res = await fetch("/api/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          notes: "Registered on NEAR Confirmation of Payee Directory.",
          verificationStatus: "VERIFIED",
        }),
      });

      if (res.ok) {
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
      } else {
        const data = await res.json();
        alert(data.error || "Failed to register recipient");
      }
    } catch (err) {
      console.error("Register recipient error:", err);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              Identity Registry
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-400">NEAR Protocol · Multi-Chain Confirmation of Payee</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Confirmation of Payee Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verify counterparties before paying across NEAR, Base, Bitcoin, Solana, XRP, Cosmos, Stacks, and Stellar.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/25 transition-all w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Payee</span>
        </button>
      </div>

      {/* Verification Tool */}
      <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-400" />
            <span>Interactive Multi-Chain Payee Verification Engine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Test any NEAR Account ID or cross-chain address (EVM, Bitcoin, Solana, XRP, Cosmos, Stacks, Stellar) to screen for fraud.
          </p>
        </div>

        <form onSubmit={handleVerify} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-300">Recipient Account / Address</label>
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="e.g. leprof.testnet, 0x71C8..., bc1q..., 7xKX..., or r9cZA..."
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Expected Business Name (Optional)</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g. LeProf Consulting"
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={verifying}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all disabled:opacity-50"
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
                ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                : verifyResult.status === "WARNING"
                ? "bg-amber-950/30 border-amber-500/30 text-amber-200"
                : "bg-rose-950/30 border-rose-500/30 text-rose-200"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  verifyResult.status === "VERIFIED"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
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
                    <span className="text-xs text-slate-300">
                      ({verifyResult.displayName})
                    </span>
                  )}
                  {verifyResult.chain && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {verifyResult.chain}
                    </span>
                  )}
                  {verifyResult.settlementRail && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {verifyResult.settlementRail}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {verifyResult.reason}
                </p>
              </div>
            </div>

            {verifyResult.status === "VERIFIED" && (
              <a
                href={`/pay?recipient=${verifyResult.walletAddress}`}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all self-start sm:self-center"
              >
                <span>Pay Verified Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Verified Directory Table */}
      <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-400" />
            <span>Registered Multi-Chain Payee Directory</span>
          </h3>
          <span className="text-xs text-slate-400">{recipientsList.length} entities registered</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {recipientsList.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-navy-950/60 border border-navy-800 flex flex-col gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-white">{r.displayName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    Handle: {r.paymentId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      r.verificationStatus === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {r.verificationStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${NEAR_CONFIG.explorerUrl}/address/${r.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white transition-colors"
                    title="View on NEARBlocks"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={`/pay?recipient=${r.walletAddress}`}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
                  >
                    Send Payment
                  </a>
                </div>
              </div>

              {/* Multi-Chain Address Badges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
                {/* NEAR */}
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">NEAR Protocol</span>
                    <span className="text-white truncate block text-[11px]">{r.walletAddress}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(r.walletAddress, `${r.id}-near`)}
                    className="text-slate-500 hover:text-white shrink-0 p-1"
                  >
                    {copiedAddress === `${r.id}-near` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* EVM */}
                {r.evmAddress && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-cyan-400 uppercase block font-sans">Base / Ethereum (EVM)</span>
                      <span className="text-white truncate block text-[11px]">{r.evmAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.evmAddress, `${r.id}-evm`)}
                      className="text-slate-500 hover:text-white shrink-0 p-1"
                    >
                      {copiedAddress === `${r.id}-evm` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Solana */}
                {r.solanaAddress && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-purple-400 uppercase block font-sans">Solana</span>
                      <span className="text-white truncate block text-[11px]">{r.solanaAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.solanaAddress, `${r.id}-sol`)}
                      className="text-slate-500 hover:text-white shrink-0 p-1"
                    >
                      {copiedAddress === `${r.id}-sol` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Bitcoin */}
                {r.bitcoinAddress && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-amber-400 uppercase block font-sans">Bitcoin</span>
                      <span className="text-white truncate block text-[11px]">{r.bitcoinAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.bitcoinAddress, `${r.id}-btc`)}
                      className="text-slate-500 hover:text-white shrink-0 p-1"
                    >
                      {copiedAddress === `${r.id}-btc` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Ripple XRP */}
                {r.xrpAddress && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-blue-400 uppercase block font-sans">Ripple (XRP)</span>
                      <span className="text-white truncate block text-[11px]">{r.xrpAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.xrpAddress, `${r.id}-xrp`)}
                      className="text-slate-500 hover:text-white shrink-0 p-1"
                    >
                      {copiedAddress === `${r.id}-xrp` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Cosmos */}
                {r.cosmosAddress && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-indigo-400 uppercase block font-sans">Cosmos Hub</span>
                      <span className="text-white truncate block text-[11px]">{r.cosmosAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.cosmosAddress, `${r.id}-cosmos`)}
                      className="text-slate-500 hover:text-white shrink-0 p-1"
                    >
                      {copiedAddress === `${r.id}-cosmos` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Stacks */}
                {r.stacksAddress && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-orange-400 uppercase block font-sans">Stacks (Bitcoin L2)</span>
                      <span className="text-white truncate block text-[11px]">{r.stacksAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.stacksAddress, `${r.id}-stacks`)}
                      className="text-slate-500 hover:text-white shrink-0 p-1"
                    >
                      {copiedAddress === `${r.id}-stacks` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}

                {/* Stellar */}
                {r.stellarAddress && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-emerald-400 uppercase block font-sans">Stellar</span>
                      <span className="text-white truncate block text-[11px]">{r.stellarAddress}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.stellarAddress, `${r.id}-stellar`)}
                      className="text-slate-500 hover:text-white shrink-0 p-1"
                    >
                      {copiedAddress === `${r.id}-stellar` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {r.notes && <p className="text-[11px] text-slate-400 font-sans">{r.notes}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-navy-900 border border-navy-800 p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <div>
                <h3 className="text-lg font-bold text-white">Register Multi-Chain Payee</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Link human-readable handles to addresses across NEAR, Base, Bitcoin, Solana, XRP, Cosmos, Stacks, and Stellar.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Legal or Trading Name *</label>
                  <input
                    type="text"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    placeholder="e.g. Aurora Labs Ltd"
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Unique Payment Handle *</label>
                  <input
                    type="text"
                    value={regPaymentId}
                    onChange={(e) => setRegPaymentId(e.target.value)}
                    placeholder="e.g. aurora-dev"
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Primary NEAR Account ID *</label>
                <input
                  type="text"
                  value={regWallet}
                  onChange={(e) => setRegWallet(e.target.value)}
                  placeholder="e.g. aurora.testnet"
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              {/* Multi-Chain Section */}
              <div className="pt-2 border-t border-navy-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-brand-400" />
                    <span>Multi-Chain Cross-Settlement Endpoints (Optional)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Model A & Chain Signatures</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-cyan-400">Base / Ethereum (EVM)</label>
                    <input
                      type="text"
                      value={regEvmWallet}
                      onChange={(e) => setRegEvmWallet(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-amber-400">Bitcoin Native</label>
                    <input
                      type="text"
                      value={regBtcWallet}
                      onChange={(e) => setRegBtcWallet(e.target.value)}
                      placeholder="bc1q..."
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-purple-400">Solana</label>
                    <input
                      type="text"
                      value={regSolWallet}
                      onChange={(e) => setRegSolWallet(e.target.value)}
                      placeholder="Base58..."
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-blue-400">Ripple (XRP)</label>
                    <input
                      type="text"
                      value={regXrpWallet}
                      onChange={(e) => setRegXrpWallet(e.target.value)}
                      placeholder="r..."
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-indigo-400">Cosmos Hub</label>
                    <input
                      type="text"
                      value={regCosmosWallet}
                      onChange={(e) => setRegCosmosWallet(e.target.value)}
                      placeholder="cosmos1..."
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-orange-400">Stacks (Bitcoin L2)</label>
                    <input
                      type="text"
                      value={regStacksWallet}
                      onChange={(e) => setRegStacksWallet(e.target.value)}
                      placeholder="SP..."
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-700"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-emerald-400">Stellar</label>
                    <input
                      type="text"
                      value={regStellarWallet}
                      onChange={(e) => setRegStellarWallet(e.target.value)}
                      placeholder="G..."
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/25"
                >
                  {registering ? "Registering Multi-Chain Payee..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
