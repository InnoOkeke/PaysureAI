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
  ArrowUpRight,
} from "lucide-react";
import { PaySureLogo } from "@/components/brand/Logos";
import { useNearWallet } from "@/context/NearWalletContext";
import { NEAR_CONFIG } from "@/lib/near/config";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";

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
    refreshBalance,
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
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
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
    <header className="sticky top-0 z-50 w-full bg-canvas/85 backdrop-blur-2xl border-b border-line-subtle shadow-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 whitespace-nowrap group rounded-xl focus-ring">
            <div className="h-9 w-9 rounded-xl bg-subtle border border-line flex items-center justify-center group-hover:border-accent-border transition-all">
              <PaySureLogo size={22} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] font-bold tracking-[-0.02em] text-ink">
                PaySure
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-accent-soft text-accent-ink border border-accent-border leading-none">
                AI
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Segmented Navigation Pill */}
        <nav aria-label="Primary" className="hidden lg:flex items-center justify-center whitespace-nowrap">
          <div className="flex items-center gap-1 p-1 rounded-full bg-subtle border border-line-subtle">
            {isLandingPage ? (
              marketingLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-1.5 rounded-full text-[13px] font-medium text-ink-muted hover:text-ink hover:bg-hover/70 transition-all duration-150 whitespace-nowrap focus-ring"
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
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 whitespace-nowrap focus-ring ${
                      isActive
                        ? "bg-accent text-white shadow-[0_2px_12px_rgba(37,99,235,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                        : "text-ink-muted hover:text-ink hover:bg-hover/70"
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
          <ThemeToggle />

          {isLandingPage ? (
            <>
              <a
                href="https://docs.near.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-full text-[13px] font-medium text-ink-muted hover:text-ink hover:bg-hover/60 transition-all whitespace-nowrap focus-ring"
              >
                Docs
              </a>

              <Link
                href="/dashboard"
                className="btn-primary px-4 py-2 text-[13px]"
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
                  className="btn-primary px-4 py-2 text-[13px]"
                >
                  <span>{isConnecting ? "Connecting..." : "Connect NEAR Wallet"}</span>
                </button>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="menu"
                    className="inline-flex items-center gap-2 min-h-[40px] p-1 pl-3 pr-2.5 rounded-full bg-subtle hover:bg-hover border border-line transition-all text-xs text-ink whitespace-nowrap focus-ring"
                  >
                    <span className="h-2 w-2 rounded-full bg-success shrink-0" />
                    <span className="font-mono text-xs font-medium text-ink-secondary truncate max-w-[120px] sm:max-w-[150px]">
                      {accountId}
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshBalance();
                      }}
                      title="Click to refresh live balance"
                      className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-elevated hover:bg-inset border border-line-subtle font-mono text-[11px] font-semibold text-accent-ink transition-colors cursor-pointer group"
                    >
                      <span>{balance} NEAR</span>
                      <RotateCw
                        className={`h-2.5 w-2.5 text-ink-muted group-hover:text-accent-ink transition-all ${
                          isFetchingBalance ? "animate-spin text-accent-ink" : ""
                        }`}
                      />
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-ink-muted transition-transform duration-150 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2.5 w-72 rounded-2xl bg-elevated/95 border border-line p-3.5 shadow-popover z-50 backdrop-blur-2xl"
                    >
                      <div className="px-2.5 py-2 border-b border-line-subtle mb-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                            Active Account
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-success font-mono">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                            NEAR Testnet
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-ink truncate">
                            {accountId}
                          </span>
                          <button
                            onClick={copyAddress}
                            className="text-ink-muted hover:text-ink p-1.5 rounded-lg hover:bg-hover transition-colors focus-ring"
                            title="Copy account ID"
                            aria-label="Copy account ID"
                          >
                            {copied ? (
                              <Check className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-inset rounded-xl mb-2.5 border border-line-subtle text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-ink-muted">Wallet Balance</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-accent-ink text-xs">
                              {balance} NEAR
                            </span>
                            <button
                              onClick={() => refreshBalance()}
                              disabled={isFetchingBalance}
                              title="Refresh live balance"
                              aria-label="Refresh live balance"
                              className="text-ink-muted hover:text-ink transition-colors p-1 rounded-md hover:bg-hover focus-ring"
                            >
                              <RotateCw
                                className={`h-3 w-3 ${
                                  isFetchingBalance ? "animate-spin text-accent-ink" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <a
                          href={`${NEAR_CONFIG.explorerUrl}/address/${accountId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between px-2.5 py-2 rounded-xl text-ink-secondary hover:bg-hover hover:text-ink transition-colors focus-ring"
                        >
                          <span>View on NEARBlocks</span>
                          <ExternalLink className="h-3.5 w-3.5 text-ink-muted" />
                        </a>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            connect();
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-accent-ink hover:bg-hover transition-colors focus-ring"
                        >
                          <span>Switch Wallet</span>
                          <Wallet className="h-3.5 w-3.5 text-accent-ink" />
                        </button>

                        <button
                          onClick={() => {
                            disconnect();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-danger hover:bg-danger-soft transition-colors focus-ring"
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
            aria-expanded={mobileMenuOpen}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl text-ink-secondary hover:text-ink hover:bg-hover border border-transparent hover:border-line transition-all focus-ring"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-line-subtle bg-elevated/95 px-4 pt-3 pb-5 space-y-1 backdrop-blur-2xl">
          {isLandingPage ? (
            <>
              {marketingLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-xs font-medium text-ink-secondary hover:bg-hover hover:text-ink transition-colors focus-ring"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full px-4 py-2.5 text-xs"
                >
                  <span>Launch App</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          ) : (
            appNavLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors focus-ring ${
                    isActive
                      ? "bg-accent text-white font-semibold"
                      : "text-ink-secondary hover:bg-hover hover:text-ink"
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
