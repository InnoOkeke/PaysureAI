import { ArrowUpRight } from "lucide-react";
import { PaySureLogo } from "@/components/brand/Logos";

export function Footer() {
  return (
    <footer className="w-full border-t border-line-subtle bg-canvas py-10 text-ink-subtle text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <PaySureLogo size={20} />
          <span className="font-semibold text-ink tracking-[-0.01em]">PaySure</span>
          <span className="text-ink-subtle/60">&middot;</span>
          <span className="text-ink-muted">Autonomous Treasury Infrastructure</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-ink-muted">
          <a
            href="https://docs.near.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors inline-flex items-center gap-1 whitespace-nowrap rounded-md focus-ring"
          >
            <span>Documentation</span>
            <ArrowUpRight className="h-3 w-3 text-ink-subtle" />
          </a>
          <a
            href="https://testnet.mynearwallet.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors inline-flex items-center gap-1 whitespace-nowrap rounded-md focus-ring"
          >
            <span>Wallet Selector</span>
            <ArrowUpRight className="h-3 w-3 text-ink-subtle" />
          </a>
          <a
            href="https://testnet.nearblocks.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors inline-flex items-center gap-1 whitespace-nowrap rounded-md focus-ring"
          >
            <span>NEARBlocks</span>
            <ArrowUpRight className="h-3 w-3 text-ink-subtle" />
          </a>
          <a
            href="https://near.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors inline-flex items-center gap-1 whitespace-nowrap rounded-md focus-ring"
          >
            <span>NEAR Protocol</span>
            <ArrowUpRight className="h-3 w-3 text-ink-subtle" />
          </a>
        </div>

        <div className="text-ink-subtle whitespace-nowrap">
          &copy; {new Date().getFullYear()} PaySure. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
