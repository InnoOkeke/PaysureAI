"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  FileUp, 
  Send
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
    <div className="min-h-screen bg-[#050507] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400 block mb-1">
            Autonomous Invoicing &amp; Payments
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
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

        <div className="flex items-center gap-3 shrink-0">
          {!isConnected ? (
            <button
              onClick={() => connect()}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/20 transition-all whitespace-nowrap"
            >
              <Wallet className="h-4 w-4" />
              <span>{isConnecting ? "Connecting..." : "Connect NEAR Wallet"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/invoices/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/25 transition-all whitespace-nowrap"
              >
                <FileUp className="h-3.5 w-3.5" />
                <span>Upload Invoice</span>
              </Link>
              <Link
                href="/pay"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-semibold transition-all whitespace-nowrap"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OutstandingInvoices invoices={invoices} />
        <RecentTransactions payments={payments} />
      </div>
    </div>
  );
}
