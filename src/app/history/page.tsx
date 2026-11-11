"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  History, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Filter, 
  Search, 
  FileText,
  Send
} from "lucide-react";
import jsPDF from "jspdf";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { NEAR_CONFIG } from "@/lib/near/config";

export default function HistoryPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch("/api/payments");
        const data = await res.json();
        setPayments(data.payments || []);
      } catch (err) {
        console.error("Load payments error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const downloadReceipt = (p: any) => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("PaySure AI — Payment Receipt", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt #: ${p.receipt?.receiptNumber || "RCP-NEAR"}`, 14, 32);
    doc.text(`Date: ${new Date(p.createdAt).toUTCString()}`, 14, 38);
    doc.text(`Network: NEAR Protocol (Testnet)`, 14, 44);

    doc.line(14, 48, 196, 48);

    doc.setFont("helvetica", "bold");
    doc.text("Payment Audit Details", 14, 56);

    doc.setFont("helvetica", "normal");
    doc.text(`Sender (NEAR Account): ${p.senderAddress}`, 14, 66);
    doc.text(`Recipient (NEAR Account): ${p.recipientAddress}`, 14, 74);
    doc.text(`Amount: ${formatCurrency(p.amount)} NEAR`, 14, 82);
    doc.text(`Invoice Ref: ${p.invoiceReference || "Direct Transfer"}`, 14, 90);
    doc.text(`Transaction Hash: ${p.transactionHash}`, 14, 98);
    doc.text(`Explorer: ${NEAR_CONFIG.explorerUrl}/txns/${p.transactionHash}`, 14, 106);

    doc.line(14, 114, 196, 114);
    doc.text("Validated by PaySure AI Confirmation of Payee and settled on NEAR Protocol.", 14, 124);

    doc.save(`Receipt_${p.receipt?.receiptNumber || p.transactionHash.slice(0, 8)}.pdf`);
  };

  const filtered = payments.filter((p) => {
    return (
      p.transactionHash.toLowerCase().includes(search.toLowerCase()) ||
      p.recipientAddress.toLowerCase().includes(search.toLowerCase()) ||
      (p.invoiceReference && p.invoiceReference.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-[#070B14] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Transaction History & Receipts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete verifiable ledger of all payments executed on NEAR Protocol.
          </p>
        </div>

        <Link
          href="/pay"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all w-fit"
        >
          <Send className="h-4 w-4" />
          <span>New Payment</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-navy-900/60 p-4 rounded-2xl border border-navy-800 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Tx hash, payee, or invoice reference..."
            className="w-full bg-navy-950 border border-navy-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">{filtered.length} records found</span>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading ledger...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-navy-900/40 border border-dashed border-navy-800">
          <History className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Payments Recorded</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Once you execute a payment on NEAR Testnet, confirmed records and PDF receipts will be listed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-mono text-xs font-bold text-white">
                    Payee: {p.recipientAddress}
                  </span>
                  {p.receipt?.receiptNumber && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {p.receipt.receiptNumber}
                    </span>
                  )}
                  {p.invoiceReference && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-800 text-slate-300">
                      Ref: {p.invoiceReference}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>Tx: {formatAddress(p.transactionHash, 8)}</span>
                  <span>&bull;</span>
                  <span>{new Date(p.createdAt).toLocaleString()}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400">NEAR Protocol</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                <div className="text-right">
                  <span className="text-base font-bold text-white block">
                    {formatCurrency(p.amount)} <span className="text-xs font-normal text-brand-300">NEAR</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    Confirmed
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${NEAR_CONFIG.explorerUrl}/txns/${p.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white transition-colors"
                    title="View on NEARBlocks"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => downloadReceipt(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/15 hover:bg-brand-600/25 text-brand-300 border border-brand-500/30 text-xs font-semibold transition-colors"
                    title="Download Receipt"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
