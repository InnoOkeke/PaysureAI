"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const { 
    accountId, 
    isConnected, 
    balance, 
    connect, 
    disconnect, 
    refreshBalance, 
    isConnecting, 
    isFetchingBalance 
  } = useNearWallet();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: Layers },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Send Payment", href: "/pay", icon: Send },
    { name: "Treasury", href: "/treasury", icon: ShieldCheck },
    { name: "Payees", href: "/recipients", icon: Users },
    { name: "Ledger", href: "/history", icon: History },
  ];

  const copyAddress = () => {
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy-800/60 bg-navy-950/85 backdrop-blur-xl shadow-lg shadow-black/30">
      {/* Top subtle ambient glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent pointer-events-none" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
              <PaySureLogo size={32} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                PaySure
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-brand-600/30 to-brand-400/20 text-brand-300 border border-brand-500/30">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-navy-850 text-white font-semibold shadow-sm border border-navy-750"
                      : "text-slate-400 hover:text-white hover:bg-navy-900/60"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-brand-400" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Network Status & Wallet */}
        <div className="flex items-center gap-3">
          {/* Network Pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-900/90 border border-navy-800 text-[11px] text-slate-300 font-mono">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">NEAR Testnet</span>
          </div>

          {/* Wallet Actions */}
          {!isConnected ? (
            <button
              onClick={() => connect()}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>{isConnecting ? "Connecting..." : "Connect NEAR Wallet"}</span>
            </button>
          ) : (
            <div className="relative">
              {/* Connected Account Capsule Button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900/90 hover:bg-navy-850 border border-navy-800 hover:border-slate-700 transition-all text-xs font-medium text-white shadow-sm"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-xs font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-[180px]">
                  {accountId}
                </span>
                <span className="hidden sm:inline-block text-slate-600">|</span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-brand-300 font-semibold">
                  {balance} NEAR
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Account Dropdown Drawer */}
              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2.5 w-72 rounded-2xl bg-navy-900/95 border border-navy-750 p-3.5 shadow-2xl shadow-black/90 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  {/* Account Header */}
                  <div className="p-2 border-b border-navy-800/80 mb-2.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                      Connected Account
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-white truncate">
                        {accountId}
                      </span>
                      <button
                        onClick={copyAddress}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors"
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

                  {/* Live Balance Card */}
                  <div className="p-2.5 bg-navy-950/70 rounded-xl mb-3 border border-navy-800/80 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-[11px] text-slate-400">Available Balance</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-brand-300 text-xs">
                          {balance} NEAR
                        </span>
                        <button
                          onClick={() => refreshBalance()}
                          disabled={isFetchingBalance}
                          title="Refresh live testnet balance"
                          className="text-slate-500 hover:text-brand-300 transition-colors p-0.5"
                        >
                          <RotateCw className={`h-3 w-3 ${isFetchingBalance ? "animate-spin text-brand-400" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Dropdown Actions */}
                  <div className="space-y-1 text-xs">
                    <a
                      href={`${NEAR_CONFIG.explorerUrl}/address/${accountId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2 rounded-xl text-slate-300 hover:bg-navy-800 hover:text-white transition-colors"
                    >
                      <span>View on NEARBlocks</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </a>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        connect();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-brand-300 hover:bg-navy-800 transition-colors"
                    >
                      <span>Switch / Connect Another Wallet</span>
                      <Wallet className="h-3.5 w-3.5 text-brand-400" />
                    </button>

                    <button
                      onClick={() => {
                        disconnect();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-900 border border-navy-800 transition-colors"
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-navy-800 bg-navy-950/95 px-4 pt-3 pb-5 space-y-1 backdrop-blur-xl animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-navy-850 text-brand-400 font-semibold border border-navy-750"
                    : "text-slate-300 hover:bg-navy-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
