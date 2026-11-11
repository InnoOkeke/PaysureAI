import { 
  FileUp, 
  ScanSearch, 
  ShieldAlert, 
  Send, 
  FileCheck2, 
  ArrowRight 
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect & Upload Invoice",
      description:
        "Connect your NEAR wallet (MyNearWallet, Meteor). Drop in any vendor or freelancer invoice (PDF, PNG, JPG).",
      icon: FileUp,
    },
    {
      step: "02",
      title: "AI Agent Extraction",
      description:
        "The AI agent parses all vital parameters: recipient entity, NEAR Account ID, token amount, invoice number, and line items into an editable confirmation draft.",
      icon: ScanSearch,
    },
    {
      step: "03",
      title: "Confirmation of Payee Check",
      description:
        "PaySure immediately verifies the NEAR Account ID against the on-chain Recipient Registry. It flags warnings or spoofed accounts before any tokens move.",
      icon: ShieldAlert,
    },
    {
      step: "04",
      title: "Approve & Execute via NEAR",
      description:
        "Review the transaction details and confirm with your NEAR account. PaySure dispatches settlement with verifiable invoice reference tags and sub-second finality.",
      icon: Send,
    },
    {
      step: "05",
      title: "Instant Verifiable Receipt",
      description:
        "Receive an immutable, downloadable digital PDF receipt complete with transaction hash, block height, and direct NEARBlocks confirmation.",
      icon: FileCheck2,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-navy-950 fintech-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Frictionless & Fail-Safe
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            How PaySure AI Works in 5 Clear Steps
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Transforming vulnerable crypto copy-pasting into a verified, bank-grade settlement workflow.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-navy-900/60 border border-navy-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-mono font-extrabold text-brand-500/50">
                      {item.step}
                    </span>
                    <div className="p-2 rounded-xl bg-navy-800 text-brand-400">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

