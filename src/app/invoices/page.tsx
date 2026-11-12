"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  FileUp, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Search,
  Filter,
  Globe,
  Bot,
  AlertTriangle,
  Wallet
} from "lucide-react";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { detectChainFromAddress } from "@/lib/recipients";
import { useNearWallet } from "@/context/NearWalletContext";

export default function InvoicesPage() {
  const { isConnected, balance } = useNearWallet();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const numericBalance = isConnected && balance ? parseFloat(balance) : null;

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const url = filter === "ALL" ? "/api/invoices" : `/api/invoices?status=${filter}`;
        const res = await fetch(url);
        const data = await res.json();
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error("Fetch invoices error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [filter]);

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      i.recipientAddress.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handlePayWithCopilot = (inv: any) => {
    window.dispatchEvent(
      new CustomEvent("paysure:open-copilot", {
        detail: {
          prompt: `Pay invoice ${inv.invoiceNumber} for ${inv.amount} ${inv.token || "NEAR"} to ${inv.recipientName}`,
        },
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#050507] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Invoice Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track, verify, and settle multi-chain vendor invoices with Confirmation of Payee.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/invoices/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-white text-xs font-semibold border border-navy-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </Link>
          <Link
            href="/invoices/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all"
          >
            <FileUp className="h-4 w-4" />
            <span>AI Invoice Upload</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-navy-900/60 p-4 rounded-2xl border border-navy-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, recipient, or wallet..."
            className="w-full bg-navy-950 border border-navy-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["ALL", "PENDING", "PAID"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === tab
                  ? "bg-brand-600 text-white"
                  : "bg-navy-950 text-slate-400 hover:text-white border border-navy-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-navy-900/40 border border-dashed border-navy-800">
          <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Invoices Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload an invoice document or create a new multi-chain invoice to get started.
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-white text-xs font-semibold border border-navy-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </Link>
            <Link
              href="/invoices/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition-colors"
            >
              <FileUp className="h-4 w-4" />
              <span>Upload First Invoice</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInvoices.map((inv) => {
            const detected = detectChainFromAddress(inv.recipientAddress);
            const isPending = inv.status === "PENDING";
            const isInsufficient = isPending && numericBalance !== null && inv.amount > numericBalance;

            return (
              <div
                key={inv.id}
                className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-brand-400">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-sm font-semibold text-white">{inv.recipientName}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {inv.status}
                    </span>

                    {/* Chain Badge */}
                    <span className="font-mono text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{detected.chain}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                    <span>Payee Address: {formatAddress(inv.recipientAddress, 6)}</span>
                    {inv.dueDate && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> Due: {inv.dueDate}
                      </span>
                    )}
                    {inv.description && (
                      <span className="text-slate-400 truncate max-w-xs">{inv.description}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-lg font-bold text-white block font-mono">
                      {formatCurrency(inv.amount)} <span className="text-xs font-normal text-brand-300">{inv.token}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Rail: <span className="text-cyan-400">{detected.rail}</span>
                    </span>
                    {isInsufficient && (
                      <span className="text-[10px] text-rose-400 font-medium block mt-0.5">
                        Exceeds Balance ({balance} NEAR available)
                      </span>
                    )}
                  </div>

                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePayWithCopilot(inv)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 hover:text-white text-xs font-medium border border-navy-700 transition-colors"
                        title="Authorize payment with AI Copilot"
                      >
                        <Bot className="h-3.5 w-3.5 text-brand-400" />
                        <span>Copilot</span>
                      </button>

                      <Link
                        href={`/pay?invoiceId=${inv.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Pay Now</span>
                      </Link>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Settled On-Chain</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
