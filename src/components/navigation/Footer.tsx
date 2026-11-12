import { ArrowUpRight } from "lucide-react";
import { PaySureLogo } from "@/components/brand/Logos";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#050507] py-10 text-zinc-500 text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <PaySureLogo size={20} />
          <span className="font-semibold text-zinc-200 tracking-[-0.01em]">PaySure</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-500">Autonomous Treasury Infrastructure</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
          <a
            href="https://docs.near.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>Documentation</span>
            <ArrowUpRight className="h-3 w-3 text-zinc-600" />
          </a>
          <a
            href="https://testnet.mynearwallet.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>Wallet Selector</span>
            <ArrowUpRight className="h-3 w-3 text-zinc-600" />
          </a>
          <a
            href="https://testnet.nearblocks.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>NEARBlocks</span>
            <ArrowUpRight className="h-3 w-3 text-zinc-600" />
          </a>
          <a
            href="https://near.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>NEAR Protocol</span>
            <ArrowUpRight className="h-3 w-3 text-zinc-600" />
          </a>
        </div>

        <div className="text-zinc-600 whitespace-nowrap">
          © {new Date().getFullYear()} PaySure. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
