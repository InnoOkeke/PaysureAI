"use client";

import Link from "next/link";
import { History, ArrowRight, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatAddress, formatCurrency } from "@/lib/utils";

interface PaymentItem {
  id: string;
  transactionHash: string;
  senderAddress: string;
  recipientAddress: string;
  amount: number;
  invoiceReference?: string;
  status: string;
  createdAt: string;
}

export function RecentTransactions({ payments = [] }: { payments?: PaymentItem[] }) {
  return (
    <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 shadow-md shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="h-4 w-4 text-brand-400" />
            <span>Recent Transactions</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">On-chain payments executed on NEAR Protocol</p>
        </div>
        <Link
          href="/history"
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="py-10 text-center rounded-xl bg-navy-950/60 border border-dashed border-navy-800">
          <History className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-medium">No transactions recorded yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed NEAR & USDC payments will appear here with live explorer receipts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.slice(0, 4).map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-xl bg-navy-950/60 border border-navy-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-mono text-xs font-semibold text-white">
                    {tx.recipientAddress}
                  </span>
                  {tx.invoiceReference && (
                    <span className="text-[11px] font-mono text-slate-400 px-1.5 py-0.5 bg-navy-800 rounded">
                      Ref: {tx.invoiceReference}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span>Tx: {formatAddress(tx.transactionHash, 6)}</span>
                  <span>&bull;</span>
                  <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <span className="text-sm font-bold text-white block">
                    {formatCurrency(tx.amount)} NEAR
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    {tx.status}
                  </span>
                </div>

                <a
                  href={`https://testnet.nearblocks.io/txns/${tx.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition-colors"
                  title="View on NEARBlocks"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

