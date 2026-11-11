"use client";

import { TrendingUp, Send, FileText, ShieldCheck, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatsProps {
  totalPaymentsCount: number;
  totalVolume: number;
  pendingInvoicesCount: number;
  pendingVolume: number;
  verifiedRecipientsCount: number;
}

export function OverviewCards({
  totalPaymentsCount = 0,
  totalVolume = 0,
  pendingInvoicesCount = 0,
  pendingVolume = 0,
  verifiedRecipientsCount = 0,
}: Partial<StatsProps>) {
  const cards = [
    {
      title: "Total Amount Sent",
      value: `${formatCurrency(totalVolume)} NEAR`,
      sub: `${totalPaymentsCount} transactions settled`,
      icon: Send,
      color: "text-brand-400",
      bg: "bg-brand-500/10",
      border: "border-brand-500/20",
    },
    {
      title: "Pending Invoices",
      value: `${pendingInvoicesCount}`,
      sub: `${formatCurrency(pendingVolume)} NEAR awaiting payment`,
      icon: FileText,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Verified Payees",
      value: `${verifiedRecipientsCount}`,
      sub: "Confirmation of Payee active",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Settlement Network",
      value: "NEAR Protocol",
      sub: "NEAR Testnet (Sub-second finality)",
      icon: TrendingUp,
      color: "text-brand-accent",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-md shadow-black/20 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-white">{card.value}</p>
              <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

