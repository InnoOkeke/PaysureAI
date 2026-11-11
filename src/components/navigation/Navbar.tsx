"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  Wallet, 
  ExternalLink, 
  CheckCircle2, 
  LogOut,
  ChevronDown,
  Layers,
  FileText,
  Send,
  Users,
  History,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { PaySureLogo } from "@/components/brand/Logos";
import { useNearWallet } from "@/context/NearWalletContext";
import { NEAR_CONFIG } from "@/lib/near/config";

export function Navbar() {
  const pathname = usePathname();
  const { accountId, isConnected, balance, connect, disconnect, isConnecting } = useNearWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customInputOpen, setCustomInputOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: Layers },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Send Payment", href: "/pay", icon: Send },
    { name: "Recipients", href: "/recipients", icon: Users },
    { name: "History", href: "/history", icon: History },
  ];

  const handleCustomConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      connect(customInput.trim());
      setCustomInputOpen(false);
      setCustomInput("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy-800/80 bg-navy-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
              <PaySureLogo size={36} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                PaySure <span className="text-brand-400 font-mono text-xs px-1.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">AI</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isConnected && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-navy-800 text-brand-400 font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-navy-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Action / NEAR Wallet State */}
        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-navy-900 border border-navy-800 text-xs text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-400">NEAR Testnet</span>
              <span className="text-slate-600">|</span>
              <span className="font-semibold text-brand-300 font-mono">
                {balance} NEAR
              </span>
            </div>
          )}

          {/* Wallet Button */}
          {!isConnected ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => connect()}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/25 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Wallet className="h-4 w-4" />
                <span>{isConnecting ? "Connecting NEAR..." : "Connect NEAR Wallet"}</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-850 border border-navy-800 text-sm font-medium text-white transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-xs">{accountId}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-navy-900 border border-navy-800 p-3 shadow-2xl shadow-black/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="p-2 border-b border-navy-800/80 mb-2">
                    <p className="text-xs text-slate-400">Connected NEAR Account</p>
                    <p className="text-sm font-mono text-emerald-400 truncate font-semibold">{accountId}</p>
                  </div>

                  <div className="space-y-2 p-2 bg-navy-950/60 rounded-xl mb-3 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">NEAR Balance</span>
                      <span className="font-mono font-semibold text-brand-400">{balance} NEAR</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">Protocol</span>
                      <span className="text-slate-300">NEAR Protocol (Testnet)</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <a
                      href={`${NEAR_CONFIG.explorerUrl}/address/${accountId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg text-xs text-slate-300 hover:bg-navy-800 hover:text-white transition-colors"
                    >
                      <span>View on NEARBlocks</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </a>

                    <button
                      onClick={() => setCustomInputOpen(!customInputOpen)}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-brand-300 hover:bg-navy-800 transition-colors"
                    >
                      <span>Switch NEAR Account ID</span>
                    </button>

                    {customInputOpen && (
                      <form onSubmit={handleCustomConnect} className="p-2 space-y-1.5">
                        <input
                          type="text"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="e.g. alice.testnet"
                          className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono"
                        />
                        <button
                          type="submit"
                          className="w-full py-1 rounded-md bg-brand-600 text-white text-[11px] font-semibold"
                        >
                          Switch Account
                        </button>
                      </form>
                    )}

                    <button
                      onClick={() => {
                        disconnect();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
