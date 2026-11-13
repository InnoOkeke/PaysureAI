"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { 
  Wallet, 
  ExternalLink, 
  LogOut,
  ChevronDown,
  RotateCw,
  Copy,
  Check,
  Menu,
  X,
  ArrowUpRight
} from "lucide-react";
import { PaySureLogo } from "@/components/brand/Logos";
import { useNearWallet } from "@/context/NearWalletContext";
import { NEAR_CONFIG } from "@/lib/near/config";

export function Navbar() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const { 
    accountId, 
    isConnected, 
    isConnecting, 
    balance, 
    isFetchingBalance, 
    connect, 
    disconnect, 
    refreshBalance 
  } = useNearWallet();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const appNavLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Invoices", href: "/invoices" },
    { name: "Send Payment", href: "/pay" },
    { name: "Treasury", href: "/treasury" },
    { name: "Recipients", href: "/recipients" },
    { name: "Ledger", href: "/history" },
  ];

  const marketingLinks = [
    { name: "Architecture", href: "/#architecture" },
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Knowledge Base", href: "/#knowledge-base" },
    { name: "Security", href: "/#security" },
    { name: "Protocol", href: "/#protocol" },
  ];

  const copyAddress = () => {
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#05070B]/80 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      {/* Subtle top specular highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 whitespace-nowrap group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.1] flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] group-hover:border-brand-400/40 transition-all">
              <PaySureLogo size={22} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] font-bold tracking-[-0.02em] text-white">
                PaySure
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-brand-500/15 text-brand-300 border border-brand-400/25 leading-none">
                AI
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Clean Segmented Navigation Pill (No Icons) */}
        <nav className="hidden lg:flex items-center justify-center whitespace-nowrap">
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            {isLandingPage ? (
              marketingLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-1.5 rounded-full text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all duration-150 whitespace-nowrap"
                >
                  {link.name}
                </a>
              ))
            ) : (
              appNavLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/dashboard" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_2px_12px_rgba(37,99,235,0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)]"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })
            )}
          </div>
        </nav>

        {/* Right: Session & Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
          {isLandingPage ? (
            <>
              <a
                href="https://docs.near.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all whitespace-nowrap"
              >
                Docs
              </a>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-gradient-to-b from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <span>Launch App</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <>
              {!isConnected ? (
                <button
                  onClick={() => connect()}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold bg-gradient-to-b from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] transition-all active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
                >
                  <span>{isConnecting ? "Connecting..." : "Connect NEAR Wallet"}</span>
                </button>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="inline-flex items-center gap-2 p-1 pl-3 pr-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.09] transition-all text-xs text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] whitespace-nowrap"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
                    <span className="font-mono text-xs font-medium text-slate-200 truncate max-w-[120px] sm:max-w-[150px]">
                      {accountId}
                    </span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshBalance();
                      }}
                      title="Click to refresh live balance"
                      className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] font-mono text-[11px] font-semibold text-brand-300 transition-colors cursor-pointer group"
                    >
                      <span>{balance} NEAR</span>
                      <RotateCw className={`h-2.5 w-2.5 text-slate-400 group-hover:text-brand-300 transition-all ${isFetchingBalance ? "animate-spin text-brand-400" : ""}`} />
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-72 rounded-2xl bg-[#0A0E17]/95 border border-white/[0.1] p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.08)] z-50 backdrop-blur-2xl">
                      <div className="px-2.5 py-2 border-b border-white/[0.07] mb-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            Active Account
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            NEAR Testnet
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-white truncate">
                            {accountId}
                          </span>
                          <button
                            onClick={copyAddress}
                            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/[0.06] transition-colors"
                            title="Copy account ID"
                          >
                            {copied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-white/[0.03] rounded-xl mb-2.5 border border-white/[0.06] text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-slate-400">Wallet Balance</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-brand-300 text-xs">
                              {balance} NEAR
                            </span>
                            <button
                              onClick={() => refreshBalance()}
                              disabled={isFetchingBalance}
                              title="Refresh live balance"
                              className="text-slate-400 hover:text-white transition-colors p-0.5"
                            >
                              <RotateCw className={`h-3 w-3 ${isFetchingBalance ? "animate-spin text-brand-400" : ""}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <a
                          href={`${NEAR_CONFIG.explorerUrl}/address/${accountId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                        >
                          <span>View on NEARBlocks</span>
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                        </a>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            connect();
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-brand-300 hover:bg-white/[0.06] transition-colors"
                        >
                          <span>Switch Wallet</span>
                          <Wallet className="h-3.5 w-3.5 text-brand-400" />
                        </button>

                        <button
                          onClick={() => {
                            disconnect();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Disconnect Wallet</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#05070B]/95 px-4 pt-3 pb-5 space-y-1 backdrop-blur-2xl">
          {isLandingPage ? (
            <>
              {marketingLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-md"
                >
                  <span>Launch App</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          ) : (
            appNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-brand-600 text-white font-semibold"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })
          )}
        </div>
      )}
    </header>
  );
}
