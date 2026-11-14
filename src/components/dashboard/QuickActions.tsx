"use client";

import Link from "next/link";
import { FileUp, Send, UserCheck, Plus, ArrowUpRight } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Upload & Pay Invoice",
      description: "Extract with AI Agent & verify",
      href: "/invoices/upload",
      icon: FileUp,
      primary: true,
    },
    {
      title: "Send Payment / Intent",
      description: "Direct NEAR / USDC transfer with payee check",
      href: "/pay",
      icon: Send,
    },
    {
      title: "Verify Recipient",
      description: "Check address on-chain before paying",
      href: "/recipients",
      icon: UserCheck,
    },
    {
      title: "Create Invoice",
      description: "Generate payable Web3 invoice",
      href: "/invoices/new",
      icon: Plus,
    },
  ];

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Quick Actions
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between group focus-ring ${
                act.primary
                  ? "bg-accent-soft border-accent-border hover:border-accent text-ink"
                  : "bg-inset border-line-subtle hover:border-line-strong hover:bg-subtle text-ink"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                    act.primary
                      ? "bg-accent text-white shadow-sm"
                      : "bg-subtle text-accent-ink border border-line-subtle"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-ink-subtle group-hover:text-ink transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-ink tracking-tight">{act.title}</h4>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">{act.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
