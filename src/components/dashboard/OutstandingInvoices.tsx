"use client";

import Link from "next/link";
import { FileText, ArrowRight, Clock } from "lucide-react";
import { formatCurrency, formatAddress } from "@/lib/utils";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  recipientName: string;
  recipientAddress: string;
  amount: number;
  token: string;
  dueDate?: string;
  status: string;
}

export function OutstandingInvoices({ invoices = [] }: { invoices?: InvoiceItem[] }) {
  return (
    <div className="rounded-2xl bg-navy-900/70 border border-white/[0.08] p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-400 shrink-0" />
              <span>Outstanding Invoices</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Invoices pending review or payment execution</p>
          </div>
          <Link
            href="/invoices"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="py-10 px-4 text-center rounded-xl bg-navy-950/60 border border-dashed border-white/[0.08]">
            <FileText className="h-7 w-7 text-slate-500 mx-auto mb-2.5" />
            <p className="text-sm text-slate-200 font-medium">No outstanding invoices</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Upload an invoice to extract line items and verify the payee on-chain.
            </p>
            <Link
              href="/invoices/upload"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition-colors"
            >
              <span>Upload Invoice</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl bg-navy-950/70 border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/[0.15] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-300 whitespace-nowrap">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-slate-600 text-xs">&bull;</span>
                    <span className="text-xs font-medium text-white truncate">{inv.recipientName}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="truncate">To: {formatAddress(inv.recipientAddress)}</span>
                    {inv.dueDate && (
                      <span className="inline-flex items-center gap-1 text-slate-400 whitespace-nowrap">
                        <Clock className="h-3 w-3" /> Due {inv.dueDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block whitespace-nowrap">
                      {formatCurrency(inv.amount)} {inv.token}
                    </span>
                    <span className="inline-block text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      {inv.status}
                    </span>
                  </div>

                  <Link
                    href={`/pay?invoiceId=${inv.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Pay Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
