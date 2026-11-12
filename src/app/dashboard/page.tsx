"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Wallet, 
  FileUp, 
  Send, 
  Plus, 
  ArrowRight, 
  TrendingUp 
} from "lucide-react";
import Link from "next/link";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { OutstandingInvoices } from "@/components/dashboard/OutstandingInvoices";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useNearWallet } from "@/context/NearWalletContext";

export default function DashboardPage() {
  const { accountId, isConnected, balance, connect, isConnecting } = useNearWallet();
  const [stats, setStats] = useState({
    totalPaymentsCount: 0,
    totalVolume: 0,
    pendingInvoicesCount: 0,
    pendingVolume: 0,
    verifiedRecipientsCount: 0,
  });
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const url = accountId
          ? `/api/dashboard?accountId=${encodeURIComponent(accountId)}`
          : "/api/dashboard";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || {});
          setInvoices(data.invoices || []);
          setPayments(data.payments || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [accountId]);

  return (
    <div className="min-h-screen bg-[#070B14] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              Autonomous Invoicing &amp; Payments
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>NEAR Testnet Active</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isConnected ? (
              <span>
                Connected as <strong className="text-brand-300 font-mono">{accountId}</strong> (Balance: {balance} NEAR). Real testnet transactions and verification.
              </span>
            ) : (
              <span>
                Connect your NEAR wallet to manage payments, verify counterparties with Confirmation of Payee, and track live audit trails.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isConnected ? (
            <button
              onClick={() => connect()}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/20 transition-all"
            >
              <Wallet className="h-4 w-4" />
              <span>{isConnecting ? "Connecting..." : "Connect NEAR Wallet"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/invoices/upload"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/25 transition-all"
              >
                <FileUp className="h-3.5 w-3.5" />
                <span>Upload Invoice</span>
              </Link>
              <Link
                href="/pay"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-semibold transition-all"
              >
                <Send className="h-3.5 w-3.5 text-brand-400" />
                <span>Send Payment</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <OverviewCards {...stats} />

      {/* Quick Actions Row */}
      <QuickActions />

      {/* Main Grid: Outstanding Invoices & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <OutstandingInvoices invoices={invoices} />
        <RecentTransactions payments={payments} />
      </div>
    </div>
  );
}
