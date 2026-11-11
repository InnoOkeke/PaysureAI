"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  Send,
  Loader2
} from "lucide-react";
import { isAddress } from "viem";

export default function NewInvoicePage() {
  const router = useRouter();
  const [invoiceNumber, setInvoiceNumber] = useState(
    "INV-" + Math.floor(1000 + Math.random() * 9000)
  );
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [verification, setVerification] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const checkPayee = async (addr: string, name?: string) => {
    if (!addr || !isAddress(addr)) return;
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
    }
  };

  const handleSubmit = async (proceedToPay = false) => {
    if (!invoiceNumber || !recipientName || !recipientAddress || !amount) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!isAddress(recipientAddress)) {
      alert("Please enter a valid EVM wallet address.");
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
          token: "NEAR",
          dueDate,
          description,
        }),
      });

      const data = await res.json();
      if (res.ok && data.invoice) {
        if (proceedToPay) {
          router.push(`/pay?invoiceId=${data.invoice.id}`);
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
    <div className="min-h-screen bg-[#070B14] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Web3 Invoice
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate a payable invoice with on-chain payee confirmation on NEAR Protocol.
          </p>
        </div>

        <Link
          href="/invoices"
          className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-navy-800 bg-navy-900 transition-colors w-fit"
        >
          &larr; Back to Invoices
        </Link>
      </div>

      <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-7 shadow-xl space-y-6">
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
              Recipient Business / Entity Name
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

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Recipient NEAR Account ID
            </label>
            <input
              type="text"
              required
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value);
                checkPayee(e.target.value, recipientName);
              }}
              placeholder="e.g. acme-design.testnet or satoshi.near"
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            />
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
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Payee Verification: <strong>{verification.status}</strong> &bull; {verification.reason}
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Amount Due (NEAR)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono font-bold"
            />
          </div>

          <div>
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
              disabled={saving}
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save & Proceed to Pay</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

