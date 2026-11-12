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
    <div className="rounded-2xl bg-navy-900/70 border border-white/[0.08] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
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
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between group ${
                act.primary
                  ? "bg-brand-600/15 border-brand-500/35 hover:border-brand-400/60 hover:bg-brand-600/20 text-white"
                  : "bg-navy-950/70 border-white/[0.07] hover:border-white/[0.16] hover:bg-navy-950 text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                    act.primary
                      ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                      : "bg-white/[0.05] text-brand-400 border border-white/[0.08]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white tracking-tight">{act.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{act.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
