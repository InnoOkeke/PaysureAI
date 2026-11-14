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
import { useToast } from "@/components/ui/ToastProvider";

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
  const toast = useToast();
  const { isConnected, balance } = useNearWallet();
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormError(null);

    if (!invoiceNumber || !recipientName || !recipientAddress || !amount) {
      const msg = "Please fill in all required fields.";
      setFormError(msg);
      toast.error(msg, "Validation Error");
      return;
    }

    if (recipientAddress.trim().length < 3) {
      const msg = "Please enter a valid recipient account or multi-chain address.";
      setFormError(msg);
      toast.error(msg, "Invalid Address");
      return;
    }

    if (proceedToPay && isInsufficientBalance) {
      const msg = `Insufficient funds. Your available balance is ${balance} NEAR.`;
      setFormError(msg);
      toast.warning(msg, "Balance Warning");
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
        toast.success(`Invoice ${data.invoice.invoiceNumber} created successfully!`);
        if (proceedToPay) {
          router.push(`/pay?invoiceId=${data.invoice.id}&network=${selectedChainId}`);
        } else {
          router.push("/invoices");
        }
      } else {
        const err = data.error || "Failed to create invoice.";
        setFormError(err);
        toast.error(err, "Creation Failed");
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = "Error saving invoice to database.";
      setFormError(errorMsg);
      toast.error(errorMsg, "Server Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line-subtle">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Create Multi-Chain Invoice
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Generate verifiable invoices payable across NEAR, Base, Stacks, Bitcoin, Solana, and more.
          </p>
        </div>

        <Link
          href="/invoices"
          className="btn-secondary px-3 py-1.5 rounded-xl text-xs w-fit focus-ring"
        >
          &larr; Back to Invoices
        </Link>
      </div>

      <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Destination Blockchain Selector */}
        <div className="space-y-2 pb-2 border-b border-line-subtle">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-ink-secondary block">
              Settlement Blockchain
            </label>
            <span className="text-[10px] font-mono text-info">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border focus-ring ${
                    isSelected
                      ? "bg-accent text-white font-semibold border-accent shadow-sm"
                      : "bg-inset text-ink-muted border-line-subtle hover:text-ink hover:border-line-strong"
                  }`}
                >
                  <span className="font-mono text-[10px] mr-1.5 opacity-75">{c.badge}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
              Invoice Identifier
            </label>
            <input
              type="text"
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="input-field px-4 py-2.5 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
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
              className="input-field px-4 py-2.5 text-xs"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink-secondary block">
                Recipient Wallet Address / Account ({SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name || "NEAR"})
              </label>
              <span className="text-[10px] font-mono text-info bg-info-soft border border-info-border px-2 py-0.5 rounded-full flex items-center gap-1">
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
                className="input-field px-4 py-2.5 text-xs font-mono"
              />
              {verifying && (
                <div className="absolute right-3.5 top-2.5 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-ink" />
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
                  ? "bg-success-soft border-success-border text-success"
                  : "bg-warning-soft border-warning-border text-warning"
              }`}
            >
              {verification.status === "VERIFIED" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
              )}
              <div className="space-y-0.5">
                <span className="font-semibold block">
                  Confirmation of Payee: {verification.status}
                </span>
                <span className="text-ink-secondary text-[11px] block">{verification.reason}</span>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-ink-secondary">
                Amount Due
              </label>
              {isConnected && (
                <span className="text-[11px] text-ink-muted">
                  Wallet Balance:{" "}
                  <strong className={isInsufficientBalance ? "text-danger font-bold" : "text-accent-ink"}>
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
              className={`input-field px-4 py-2.5 text-xs font-mono font-bold transition-colors ${
                isInsufficientBalance
                  ? "!border-danger !bg-danger-soft text-danger"
                  : ""
              }`}
            />
            {isInsufficientBalance && (
              <div className="flex items-center gap-1.5 text-danger text-[11px] mt-1 font-medium">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>Amount exceeds available balance ({balance} NEAR).</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
              Denomination Asset
            </label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="input-field px-4 py-2.5 text-xs"
            >
              <option value="NEAR">NEAR (Native)</option>
              <option value="USDC">USDC (NEP-141)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field px-4 py-2.5 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
              Service Description / Scope of Work
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide invoice notes or line items summary..."
              className="input-field px-4 py-2 text-xs"
            />
          </div>
        </div>

        {formError && (
          <div className="p-3.5 rounded-xl bg-danger-soft border border-danger-border text-danger text-xs flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
            <span>{formError}</span>
          </div>
        )}

        <div className="pt-4 border-t border-line-subtle flex items-center justify-between gap-4">
          <Link
            href="/invoices"
            className="text-xs text-ink-muted hover:text-ink transition-colors focus-ring rounded-lg px-2 py-1"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(false)}
              className="btn-secondary px-4 py-2.5 rounded-xl text-xs focus-ring"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={saving || isInsufficientBalance}
              onClick={() => handleSubmit(true)}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs focus-ring"
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
