import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";
import { PaySureLogo } from "@/components/brand/Logos";

export function Footer() {
  return (
    <footer className="w-full border-t border-navy-800 bg-navy-950 py-10 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <PaySureLogo size={24} />
          <span className="font-semibold text-slate-200 text-sm">PaySure AI</span>
          <span className="text-slate-600">|</span>
          <span>Intelligent Stablecoin Payment Infrastructure</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <a
            href="https://wiki.qday.info/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Aevum Docs</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://faucet.qday.info/en"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>tUSD8 Faucet</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://explorer-test.qday.info/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Explorer (44005)</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://dorahacks.io/hackathon/qday"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Aevum Builder Challenge</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="text-slate-500">
          © {new Date().getFullYear()} PaySure AI. Built on QDay Aevum Testnet.
        </div>
      </div>
    </footer>
  );
}

