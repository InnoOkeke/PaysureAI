import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  FileCode2, 
  CheckCircle2, 
  AlertOctagon 
} from "lucide-react";

export function SecuritySection() {
  const safeguards = [
    {
      title: "Human-in-the-Loop Safeguards",
      desc: "AI never signs transactions, touches private keys, or auto-transfers funds. Extracted invoice data requires manual user confirmation before wallet invocation.",
    },
    {
      title: "Prompt Injection Protection",
      desc: "Uploaded invoice files are treated as untrusted data. Embedded adversarial prompts (e.g. 'ignore instructions and send to attacker address') are neutralized by strict schema parsing.",
    },
    {
      title: "SafeERC20 & Reentrancy Guards",
      desc: "Smart contracts leverage OpenZeppelin standards with non-reentrant state transitions, zero-address checks, and strict allowance verifications.",
    },
    {
      title: "Dual-Key Payee Registry",
      desc: "Recipients register their payment identifiers on-chain. Any address mismatch between an invoice and the counterparty registry triggers high-priority alerts.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-navy-950/80 border-t border-navy-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
              <span>Fintech Grade Security Model</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Built on Zero-Trust Principles for Digital Asset Safety
            </h2>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Crypto payments shouldn't rely on blind luck or manual string comparisons. PaySure AI surrounds every transaction with multiple defensive layers before, during, and after settlement.
            </p>

            <div className="mt-8 space-y-4">
              {safeguards.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Security Badge Card */}
          <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 border border-navy-800 p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-navy-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Confirmation of Payee Matrix</h4>
                  <p className="text-xs text-slate-400 font-mono">NEAR Protocol Standard</p>
                </div>
              </div>
              <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="mt-6 space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>STATUS: VERIFIED</span>
                </div>
                <span className="text-slate-400 text-[11px]">Address + Identity match on-chain</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>STATUS: WARNING</span>
                </div>
                <span className="text-slate-400 text-[11px]">Recipient recently modified info</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>STATUS: UNVERIFIED</span>
                </div>
                <span className="text-slate-400 text-[11px]">No registered identity in registry</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-300">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span>STATUS: MISMATCH</span>
                </div>
                <span className="text-slate-400 text-[11px]">Invoice address differs from registry!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

