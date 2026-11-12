"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  Plus, 
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import { useNearWallet } from "@/context/NearWalletContext";
import { NEAR_CONFIG } from "@/lib/near/config";

export default function RecipientsPage() {
  const { accountId } = useNearWallet();
  const [searchAddress, setSearchAddress] = useState("");
  const [searchName, setSearchName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // Registration modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regPaymentId, setRegPaymentId] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regWallet, setRegWallet] = useState(accountId || "");
  const [registering, setRegistering] = useState(false);

  const [recipientsList, setRecipientsList] = useState<any[]>([
    {
      id: "1",
      displayName: "Acme Web3 Design Studio",
      paymentId: "acme-design",
      walletAddress: "acme-design.testnet",
      verificationStatus: "VERIFIED",
      notes: "Official NEAR Ecosystem Design Partner.",
    },
    {
      id: "2",
      displayName: "Satoshi Freelance Engineering",
      paymentId: "satoshi-dev",
      walletAddress: "satoshi-dev.testnet",
      verificationStatus: "VERIFIED",
      notes: "Smart Contract auditor & Rust / NEAR systems specialist.",
    },
    {
      id: "3",
      displayName: "Apex Media Agency",
      paymentId: "apex-media",
      walletAddress: "apex-media.testnet",
      verificationStatus: "WARNING",
      notes: "Recent key rotation reported by payee. Exercise caution.",
    },
  ]);

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
    if (!regPaymentId || !regDisplayName || !regWallet) return;

    setRegistering(true);
    try {
      const newRecipient = {
        id: Date.now().toString(),
        displayName: regDisplayName,
        paymentId: regPaymentId,
        walletAddress: regWallet,
        verificationStatus: "VERIFIED",
        notes: "Registered on NEAR Confirmation of Payee Directory.",
      };
      setRecipientsList([newRecipient, ...recipientsList]);
      setShowRegisterModal(false);
      setRegPaymentId("");
      setRegDisplayName("");
    } catch (err) {
      console.error(err);
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
            <span className="text-xs text-slate-400">NEAR Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Confirmation of Payee Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verify counterparties before paying. Map human-readable NEAR accounts to legal entities.
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
            <span>Interactive Payee Verification Engine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Test any NEAR Account ID against our on-chain verification registry to detect spoofing.
          </p>
        </div>

        <form onSubmit={handleVerify} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-300">NEAR Account ID</label>
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="e.g. acme-design.testnet or satoshi-dev.testnet"
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
              placeholder="e.g. Acme Web3 Studio"
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={verifying}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/25"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{verifying ? "Querying NEAR Registry..." : "Verify Payee Identity"}</span>
            </button>
          </div>
        </form>

        {/* Verification Output */}
        {verifyResult && (
          <div
            className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in ${
              verifyResult.status === "VERIFIED"
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                : verifyResult.status === "WARNING"
                ? "bg-amber-950/20 border-amber-500/40 text-amber-300"
                : "bg-rose-950/20 border-rose-500/40 text-rose-300"
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
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <span>Verification Result: {verifyResult.status}</span>
                  {verifyResult.displayName && (
                    <span className="font-normal text-xs text-slate-300">
                      ({verifyResult.displayName})
                    </span>
                  )}
                </h4>
                <p className="text-xs mt-1 text-slate-300 leading-relaxed max-w-xl">
                  {verifyResult.reason}
                </p>
              </div>
            </div>

            {verifyResult.status === "VERIFIED" && (
              <a
                href={`/pay?recipient=${verifyResult.walletAddress}`}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
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
            <span>Registered Payee Directory</span>
          </h3>
          <span className="text-xs text-slate-400">{recipientsList.length} entities registered</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {recipientsList.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-white">{r.displayName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    ID: {r.paymentId}
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
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>NEAR Account: {r.walletAddress}</span>
                </div>
                {r.notes && <p className="text-[11px] text-slate-400">{r.notes}</p>}
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
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
                >
                  Send Payment
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-navy-900 border border-navy-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">Register Payee on NEAR</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Legal or Trading Name</label>
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
                <label className="text-xs font-bold text-slate-300">Unique Payment ID / Handle</label>
                <input
                  type="text"
                  value={regPaymentId}
                  onChange={(e) => setRegPaymentId(e.target.value)}
                  placeholder="e.g. aurora-dev"
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">NEAR Account ID</label>
                <input
                  type="text"
                  value={regWallet}
                  onChange={(e) => setRegWallet(e.target.value)}
                  placeholder="e.g. aurora.testnet"
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  required
                />
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
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold"
                >
                  {registering ? "Registering..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
