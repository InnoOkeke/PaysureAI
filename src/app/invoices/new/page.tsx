"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  Loader2,
  Globe,
  Wallet,
  CheckCircle2
} from "lucide-react";
import { detectChainFromAddress } from "@/lib/recipients";
import { useNearWallet } from "@/context/NearWalletContext";

const SUPPORTED_CHAINS = [
  { id: "near", name: "NEAR Protocol", rail: "Native", badge: "NEAR" },
  { id: "base", name: "Base", rail: "Model A / MPC", badge: "BASE" },
  { id: "ethereum", name: "Ethereum", rail: "Model B / MPC", badge: "ETH" },
  { id: "arbitrum", name: "Arbitrum", rail: "Model A / MPC", badge: "ARB" },
  { id: "bitcoin", name: "Bitcoin", rail: "Native / MPC", badge: "BTC" },
  { id: "solana", name: "Solana", rail: "Model A / Solver", badge: "SOL" },
  { id: "xrp", name: "Ripple (XRP)", rail: "Model A / Solver", badge: "XRP" },
  { id: "cosmos", name: "Cosmos", rail: "Model A / Solver", badge: "ATOM" },
  { id: "stacks", name: "Stacks (L2)", rail: "Model A / Solver", badge: "STX" },
  { id: "stellar", name: "Stellar", rail: "Model A / Solver", badge: "XLM" },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const { isConnected, balance } = useNearWallet();

  const [invoiceNumber, setInvoiceNumber] = useState(
    "INV-" + Math.floor(1000 + Math.random() * 9000)
  );
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedChainId, setSelectedChainId] = useState("near");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("NEAR");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [verification, setVerification] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dynamic balance check
  const numericAmount = parseFloat(amount || "0");
  const numericBalance = isConnected && balance ? parseFloat(balance) : null;
  const isInsufficientBalance = numericBalance !== null && !isNaN(numericAmount) && numericAmount > numericBalance;

  const checkPayee = async (addr: string, name?: string) => {
    if (!addr || addr.trim().length < 3) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/recipients/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr, name }),
      });
      const data = await res.json();
      setVerification(data);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleAddressChange = (addr: string) => {
    setRecipientAddress(addr);
    if (addr.trim().length > 3) {
      const detected = detectChainFromAddress(addr);
      const match = SUPPORTED_CHAINS.find(
        (c) =>
          detected.chain.toLowerCase().includes(c.id) ||
          c.name.toLowerCase() === detected.chain.toLowerCase()
      );
      if (match) setSelectedChainId(match.id);
      checkPayee(addr, recipientName);
    }
  };

  const handleSubmit = async (proceedToPay = false) => {
    if (!invoiceNumber || !recipientName || !recipientAddress || !amount) {
      alert("Please fill in all required fields.");
      return;
    }

    if (recipientAddress.trim().length < 3) {
      alert("Please enter a valid recipient account or multi-chain address.");
      return;
    }

    if (proceedToPay && isInsufficientBalance) {
      alert(`Insufficient funds. Your available balance is ${balance} NEAR.`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          recipientName,
          recipientAddress,
          amount: parseFloat(amount),
          token,
          dueDate,
          description,
        }),
      });

      const data = await res.json();
      if (res.ok && data.invoice) {
        if (proceedToPay) {
          router.push(`/pay?invoiceId=${data.invoice.id}&network=${selectedChainId}`);
        } else {
          router.push("/invoices");
        }
      } else {
        alert(data.error || "Failed to create invoice.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error saving invoice.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Multi-Chain Invoice
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate verifiable invoices payable across NEAR, Base, Stacks, Bitcoin, Solana, and more.
          </p>
        </div>

        <Link
          href="/invoices"
          className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-navy-800 bg-navy-900 transition-colors w-fit"
        >
          &larr; Back to Invoices
        </Link>
      </div>

      <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Destination Blockchain Selector */}
        <div className="space-y-2 pb-2 border-b border-navy-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 block">
              Settlement Blockchain
            </label>
            <span className="text-[10px] font-mono text-cyan-400">
              Model A Solver &amp; Chain Signatures
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SUPPORTED_CHAINS.map((c) => {
              const isSelected = selectedChainId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedChainId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-white text-black font-semibold border-white shadow-md"
                      : "bg-navy-950 text-slate-400 border-navy-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span className="font-mono text-[10px] mr-1.5 opacity-70">{c.badge}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Invoice Identifier
            </label>
            <input
              type="text"
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Recipient Business / Vendor Name
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
                checkPayee(recipientAddress, e.target.value);
              }}
              placeholder="e.g. Acme Web3 Design Studio"
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Recipient Wallet Address / Account ({SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name || "NEAR"})
              </label>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span>{SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.rail}</span>
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={recipientAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder={
                  selectedChainId === "near"
                    ? "e.g. acme-design.testnet or satoshi.near"
                    : selectedChainId === "base" || selectedChainId === "ethereum"
                    ? "e.g. 0x71C8360f... on Base/Ethereum"
                    : selectedChainId === "bitcoin"
                    ? "e.g. tb1qw508d... or bc1... on Bitcoin"
                    : selectedChainId === "stacks"
                    ? "e.g. ST1P72Z... on Stacks (L2)"
                    : selectedChainId === "solana"
                    ? "e.g. 7xKXtg2CW... on Solana"
                    : "e.g. r9cZA1mL... or cosmos1..."
                }
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
              {verifying && (
                <div className="absolute right-3.5 top-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-400" />
                  <span>Verifying...</span>
                </div>
              )}
            </div>
          </div>

          {/* Payee Verification Feedback */}
          {verification && (
            <div
              className={`sm:col-span-2 p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
                verification.status === "VERIFIED"
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                  : "bg-amber-950/20 border-amber-500/40 text-amber-300"
              }`}
            >
              {verification.status === "VERIFIED" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              )}
              <div className="space-y-0.5">
                <span className="font-semibold block">
                  Confirmation of Payee: {verification.status}
                </span>
                <span className="text-slate-300 text-[11px] block">{verification.reason}</span>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Amount Due
              </label>
              {isConnected && (
                <span className="text-[11px] text-slate-400">
                  Wallet Balance:{" "}
                  <strong className={isInsufficientBalance ? "text-rose-400 font-bold" : "text-brand-300"}>
                    {balance} NEAR
                  </strong>
                </span>
              )}
            </div>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full bg-navy-950 border rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:outline-none transition-colors ${
                isInsufficientBalance
                  ? "border-rose-500/70 focus:border-rose-500 bg-rose-950/20 text-rose-200"
                  : "border-navy-800 focus:border-brand-500 text-white"
              }`}
            />
            {isInsufficientBalance && (
              <div className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1 font-medium">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>Amount exceeds available balance ({balance} NEAR).</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Denomination Asset
            </label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="NEAR">NEAR (Native)</option>
              <option value="USDC">USDC (NEP-141)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Service Description / Scope of Work
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide invoice notes or line items summary..."
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-navy-800 flex items-center justify-between gap-4">
          <Link
            href="/invoices"
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(false)}
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 text-xs font-semibold border border-navy-700 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={saving || isInsufficientBalance}
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-white/[0.04] disabled:text-slate-500 disabled:border disabled:border-white/[0.08] disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {isInsufficientBalance
                  ? "Insufficient Balance"
                  : "Save & Proceed to Pay"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
