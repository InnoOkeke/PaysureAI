"use client";

import { TrendingUp, Send, FileText, ShieldCheck } from "lucide-react";
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
      tone: "bg-accent-soft text-accent-ink border-accent-border",
    },
    {
      title: "Pending Invoices",
      value: `${pendingInvoicesCount}`,
      sub: `${formatCurrency(pendingVolume)} NEAR awaiting payment`,
      icon: FileText,
      tone: "bg-warning-soft text-warning border-warning-border",
    },
    {
      title: "Verified Payees",
      value: `${verifiedRecipientsCount}`,
      sub: "Confirmation of Payee active",
      icon: ShieldCheck,
      tone: "bg-success-soft text-success border-success-border",
    },
    {
      title: "Settlement Speed",
      value: "~1.1s",
      sub: "Sub-second finality on NEAR",
      icon: TrendingUp,
      tone: "bg-info-soft text-info border-info-border",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-5 surface-card flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-ink-muted whitespace-nowrap">
                {card.title}
              </span>
              <div
                className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${card.tone}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-ink whitespace-nowrap">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-ink-muted truncate">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
