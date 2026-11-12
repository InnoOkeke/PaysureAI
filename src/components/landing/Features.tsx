import { 
  ShieldCheck, 
  Cpu, 
  FileCheck2, 
  Receipt, 
  Sparkles, 
  Lock, 
  Search, 
  Coins 
} from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Confirmation of Payee",
      description:
        "Query on-chain identity registers before transferring a single token. Eliminates lookalike typosquatting (satosh1.near vs satoshi.near) with live 4-tier status checks (Verified, Warning, Unverified, Mismatch).",
      icon: ShieldCheck,
      badge: "AI Security & Anti-Spoofing",
    },
    {
      title: "Conversational Multi-Chain Intents",
      description:
        "Execute payments in plain English: 'Send $50 to John Kennedy on Base' or 'Pay Acme Design 75 NEAR'. Translates human prompts into verified, policy-checked cross-chain intents.",
      icon: Sparkles,
      badge: "NEAR Intents Engine",
    },
    {
      title: "Autonomous Treasury Guardrails",
      description:
        "Institutional policy engine with single-tx ceilings, rolling 24-hour velocity caps, department procurement budgets, and instant emergency killswitches for AI disbursements.",
      icon: Lock,
      badge: "Autonomous Governance",
    },
    {
      title: "Multimodal AI Invoicing & OCR",
      description:
        "Upload invoices in PDF, PNG, or JPG. Zero-trust prompt-injection defense extracts line items, due dates, totals, and recipient accounts into editable reconciliation drafts.",
      icon: Cpu,
      badge: "Corporate Invoicing",
    },
    {
      title: "NEAR Chain Signatures (MPC)",
      description:
        "Leverages NEAR's threshold MPC network (v1.signer-prod.testnet) to derive addresses and sign transactions on Base, Ethereum, and Solana without bridging or wrap tokens.",
      icon: Coins,
      badge: "Cross-Chain Rail",
    },
    {
      title: "Universal NEAR Wallet Support",
      description:
        "Native multi-wallet support powered by official NEAR Wallet Selector. Connect effortlessly with MyNearWallet, HERE / HOT Wallet, Nightly, Meteor, and Sender.",
      icon: Receipt,
      badge: "Ecosystem Standard",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-navy-950/90 border-t border-navy-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Engineered for Modern Web3 Commerce
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Everything Needed to Run Stablecoin Payments Safely
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Eliminating the fear, guesswork, and manual reconciliation from crypto business payments.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative p-7 rounded-2xl bg-navy-900/60 hover:bg-navy-900/90 border border-navy-800 hover:border-brand-500/30 transition-all duration-200 shadow-lg shadow-black/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20 group-hover:scale-105 transition-all">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-navy-800 text-slate-300 border border-navy-700">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

