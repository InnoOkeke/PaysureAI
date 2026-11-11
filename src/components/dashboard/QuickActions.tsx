"use client";

import Link from "next/link";
import { FileUp, Send, UserCheck, History, Plus } from "lucide-react";

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
      title: "Send Stablecoins",
      description: "Direct tUSD8 transfer with payee check",
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
    <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 shadow-md shadow-black/20">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between group ${
                act.primary
                  ? "bg-brand-600/15 border-brand-500/40 hover:bg-brand-600/25 text-white"
                  : "bg-navy-950/60 border-navy-800 hover:border-slate-700 text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    act.primary
                      ? "bg-brand-500 text-white"
                      : "bg-navy-800 text-brand-400 group-hover:scale-105"
                  } transition-transform`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold">{act.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

