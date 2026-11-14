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
  Send,
  Wallet
} from "lucide-react";
import jsPDF from "jspdf";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { NEAR_CONFIG } from "@/lib/near/config";
import { useNearWallet } from "@/context/NearWalletContext";

export default function HistoryPage() {
  const { accountId, isConnected } = useNearWallet();
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewScope, setViewScope] = useState<"mine" | "all">("mine");

  useEffect(() => {
    async function loadPayments() {
      try {
        setLoading(true);
        let url = "/api/payments";
        if (viewScope === "mine" && accountId) {
          url += `?accountId=${encodeURIComponent(accountId)}`;
        } else if (viewScope === "all") {
          url += `?scope=all`;
        } else if (!accountId) {
          // If no wallet is connected, show empty rather than dumping random accounts
          url += `?accountId=none`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setPayments(data.payments || []);
      } catch (err) {
        console.error("Load payments error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, [accountId, viewScope]);

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
      (p.senderAddress && p.senderAddress.toLowerCase().includes(search.toLowerCase())) ||
      (p.invoiceReference && p.invoiceReference.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-canvas py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line-subtle">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Transaction History &amp; Receipts
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            {isConnected ? (
              <span>Scoped to connected account: <strong className="text-accent-ink font-mono">{accountId}</strong></span>
            ) : (
              <span>Complete verifiable ledger of payments executed on NEAR Protocol.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="flex p-1 rounded-xl bg-subtle border border-line-subtle text-xs">
              <button
                onClick={() => setViewScope("mine")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all focus-ring ${
                  viewScope === "mine"
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                My Transactions
              </button>
              <button
                onClick={() => setViewScope("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all focus-ring ${
                  viewScope === "all"
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                All Network
              </button>
            </div>
          )}

          <Link
            href="/pay"
            className="btn-primary px-4 py-2 rounded-xl text-xs"
          >
            <Send className="h-4 w-4" />
            <span>New Payment</span>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="surface-card p-4 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Tx hash, payee, sender, or ref..."
            aria-label="Search transactions"
            className="input-field pl-10 pr-3 py-2 text-xs font-mono"
          />
        </div>
        <span className="text-xs text-ink-muted font-mono">{filtered.length} records found</span>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="py-20 text-center text-ink-subtle text-xs">Loading ledger...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-elevated border border-dashed border-line">
          <History className="h-10 w-10 text-ink-subtle mx-auto mb-3" />
          <h3 className="text-base font-bold text-ink">No Payments Recorded</h3>
          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
            {isConnected ? (
              <span>Your connected wallet (<strong>{accountId}</strong>) has not executed any payments yet.</span>
            ) : (
              <span>Connect your NEAR wallet to view your personalized payment history and download receipts.</span>
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="p-5 surface-card flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-line-strong"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="font-mono text-xs font-bold text-ink">
                    Payee: {p.recipientAddress}
                  </span>
                  {p.receipt?.receiptNumber && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-soft text-accent-ink border border-accent-border">
                      {p.receipt.receiptNumber}
                    </span>
                  )}
                  {p.invoiceReference && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-subtle text-ink-secondary">
                      Ref: {p.invoiceReference}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted font-mono">
                  <span>Sender: {p.senderAddress}</span>
                  <span>&bull;</span>
                  <span>Tx: {formatAddress(p.transactionHash, 8)}</span>
                  <span>&bull;</span>
                  <span>{new Date(p.createdAt).toLocaleString()}</span>
                  <span>&bull;</span>
                  <span className="text-success">NEAR Protocol</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                <div className="text-right">
                  <span className="text-base font-bold text-ink block">
                    {formatCurrency(p.amount)} <span className="text-xs font-normal text-accent-ink">NEAR</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-success bg-success-soft px-2 py-0.5 rounded-full border border-success-border">
                    Confirmed
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${NEAR_CONFIG.explorerUrl}/txns/${p.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-subtle hover:bg-hover text-ink-secondary hover:text-ink transition-colors focus-ring"
                    title="View on NEARBlocks"
                    aria-label="View on NEARBlocks"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => downloadReceipt(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-soft hover:bg-accent/20 text-accent-ink border border-accent-border text-xs font-semibold transition-colors focus-ring"
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
