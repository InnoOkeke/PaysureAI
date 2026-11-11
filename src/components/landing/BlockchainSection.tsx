import { ExternalLink, Layers, Sparkles, CheckCircle2 } from "lucide-react";
import { NEAR_CONFIG } from "@/lib/near/config";

export function BlockchainSection() {
  const specs = [
    { label: "Blockchain Network", value: "NEAR Protocol (Testnet & Mainnet)" },
    { label: "Network ID", value: NEAR_CONFIG.networkId },
    { label: "Native Gas Token", value: "NEAR (24 Decimals)" },
    { label: "Settlement Asset", value: "NEAR & USDC (NEP-141 Standard)" },
    { label: "RPC Endpoint", value: NEAR_CONFIG.nodeUrl },
    { label: "Block Explorer", value: "NEARBlocks (testnet.nearblocks.io)" },
  ];

  return (
    <section className="py-20 sm:py-28 bg-navy-950 border-t border-navy-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold mb-3 border border-brand-500/20">
            <Layers className="h-4 w-4" />
            <span>Infrastructure Integration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Native Settlement on NEAR Protocol
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Engineered natively for NEAR's human-readable account model and high-speed, sub-second finality.
          </p>
        </div>

        <div className="mt-14 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-navy-900/80 border border-navy-800 p-6 sm:p-8 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specs.map((spec) => (
                <div key={spec.label} className="p-4 rounded-xl bg-navy-950/70 border border-navy-800/80">
                  <span className="text-xs text-slate-400 block">{spec.label}</span>
                  <span className="text-sm font-mono font-medium text-slate-200 mt-1 block truncate">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-navy-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Compatible with MyNearWallet, Meteor & NEAR Web Wallets</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://testnet.mynearwallet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  <span>Open Testnet Wallet / Faucet</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href={NEAR_CONFIG.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <span>View NEARBlocks</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
