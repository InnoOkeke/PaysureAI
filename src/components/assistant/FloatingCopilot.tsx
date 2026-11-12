"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X, 
  Minus, 
  MessageSquare, 
  ShieldCheck,
  ChevronDown,
  ArrowUpRight,
  Globe,
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { PaySureLogo } from "@/components/brand/Logos";
import { useNearWallet } from "@/context/NearWalletContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  intent?: any;
}

export function FloatingCopilot() {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected } = useNearWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissedTeaser, setHasDismissedTeaser] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your PaySure Autonomous AI Agent. Ask me to verify counterparties, summarize pending invoices, or execute cross-chain intents across Stacks, Solana, Bitcoin, Base, and NEAR Protocol.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic context-aware teaser message based on current route
  const getRouteTeaser = () => {
    if (pathname.includes("/pay")) {
      return {
        title: "Multi-Chain Safety Guard",
        prompt: "Need me to verify a counterparty across Stacks, Bitcoin, EVM, or NEAR before transferring?",
      };
    }
    if (pathname.includes("/invoices/upload")) {
      return {
        title: "Smart OCR Assistant",
        prompt: "Upload an invoice and I'll extract the recipient address and amount automatically.",
      };
    }
    if (pathname.includes("/invoices")) {
      return {
        title: "Invoice Management",
        prompt: "Want me to summarize your outstanding invoices due this week?",
      };
    }
    if (pathname.includes("/recipients")) {
      return {
        title: "Directory Intelligence",
        prompt: "Ask me to explain any payee verification status, multichain address, or safety flags.",
      };
    }
    return {
      title: "PaySure AI Copilot",
      prompt: "Send cross-chain transfers or ask questions about counterparties & guardrails!",
    };
  };

  const teaser = getRouteTeaser();

  // Show teaser after 2.5 seconds if chat is closed and not dismissed
  useEffect(() => {
    if (isOpen || hasDismissedTeaser) {
      setShowTeaser(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowTeaser(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [pathname, isOpen, hasDismissedTeaser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const samplePrompts = [
    "Send $50 to LeProf on Stacks",
    "Pay LeProf 20 NEAR on Solana",
    "Send $100 to Satoshi on Bitcoin",
    "Transfer $50 to Acme on Base",
    "Show my pending invoices",
    "How does Confirmation of Payee work on NEAR?",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: data.reply,
            intent: data.intent,
          },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              data.reply ||
              "I encountered an issue querying the agent. Please make sure the AI API key is configured.",
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Network error connecting to AI Agent service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAndPay = (intent: any) => {
    if (!intent) return;
    const targetAddr =
      intent.targetChain !== "NEAR Protocol" && intent.resolvedPayee?.targetChainAddress
        ? intent.resolvedPayee.targetChainAddress
        : intent.resolvedPayee?.accountId || "leprof.testnet";

    let chainParam = "near";
    const tc = (intent.targetChain || "").toLowerCase();
    if (tc.includes("base")) chainParam = "base";
    else if (tc.includes("eth")) chainParam = "ethereum";
    else if (tc.includes("arbitrum")) chainParam = "arbitrum";
    else if (tc.includes("bitcoin") || tc.includes("btc")) chainParam = "bitcoin";
    else if (tc.includes("solana")) chainParam = "solana";
    else if (tc.includes("xrp") || tc.includes("ripple")) chainParam = "xrp";
    else if (tc.includes("cosmos")) chainParam = "cosmos";
    else if (tc.includes("stacks")) chainParam = "stacks";
    else if (tc.includes("stellar")) chainParam = "stellar";

    if (pathname === "/pay") {
      window.dispatchEvent(
        new CustomEvent("paysure:apply-intent", {
          detail: {
            recipient: targetAddr,
            amount: intent.extractedAmount,
            network: chainParam,
            memo: intent.memo,
            name: intent.resolvedPayee?.displayName,
          },
        })
      );
    } else {
      const payUrl = `/pay?recipient=${encodeURIComponent(targetAddr)}&amount=${encodeURIComponent(
        intent.extractedAmount
      )}&network=${encodeURIComponent(chainParam)}&memo=${encodeURIComponent(
        intent.memo || ""
      )}&prompt=${encodeURIComponent(intent.rawPrompt || "")}`;
      router.push(payUrl);
    }

    setIsOpen(false);
  };

  const openWithPrompt = (promptText: string) => {
    setIsOpen(true);
    setShowTeaser(false);
    handleSend(promptText);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* 1. Proactive Floating Teaser Bubble */}
      {!isOpen && showTeaser && (
        <div className="mb-3 max-w-xs sm:max-w-sm rounded-2xl bg-navy-900/95 border border-brand-500/30 p-3.5 shadow-2xl shadow-brand-950/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div 
              onClick={() => {
                setIsOpen(true);
                setShowTeaser(false);
              }}
              className="flex items-start gap-2.5 cursor-pointer group"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-navy-800 text-brand-400 border border-navy-700">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-bold text-white group-hover:text-brand-300 transition-colors">
                    {teaser.title}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {teaser.prompt}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Chat with Agent</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowTeaser(false);
                setHasDismissedTeaser(true);
              }}
              className="text-slate-500 hover:text-white p-1 rounded-lg transition-colors"
              title="Dismiss prompt"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Expanded Floating Chat Modal */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[400px] h-[550px] max-h-[82vh] rounded-3xl bg-navy-900/95 border border-navy-750 shadow-2xl shadow-black/90 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-navy-800 bg-navy-950/60">
            <div className="flex items-center gap-2.5">
              <PaySureLogo size={28} />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">PaySure AI Copilot</h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    Agent
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online &bull; Grounded in NEAR Context</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
                title="Minimize chat"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 ${
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs ${
                    m.role === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-navy-800 border border-navy-700 text-brand-400"
                  }`}
                >
                  {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-none shadow-sm"
                      : "bg-navy-950/90 text-slate-200 border border-navy-800 rounded-tl-none shadow-sm space-y-3"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {m.intent && (
                    <div className="mt-2.5 p-3 rounded-xl bg-black/50 border border-brand-500/30 text-[11px] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                          <Globe className="h-3.5 w-3.5 text-brand-400" />
                          <span>{m.intent.targetChain}</span>
                        </div>
                        <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          {m.intent.settlementExecution?.settlementRail || "Model A Solver"}
                        </span>
                      </div>

                      <div className="space-y-1 font-mono text-[10.5px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Payee:</span>
                          <span className="text-white font-sans font-medium">{m.intent.resolvedPayee.displayName}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Target Address:</span>
                          <span className="text-slate-300 truncate max-w-[140px]">
                            {m.intent.resolvedPayee.targetChainAddress}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Settlement Sum:</span>
                          <span className="text-emerald-400 font-bold font-sans">
                            ${m.intent.extractedAmount.toFixed(2)} {m.intent.extractedCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>CoP Status:</span>
                          <span className={m.intent.resolvedPayee.verificationStatus === "VERIFIED" ? "text-emerald-400" : "text-amber-400"}>
                            {m.intent.resolvedPayee.verificationStatus} ({m.intent.resolvedPayee.reputationScore}/100)
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Guardrail:</span>
                          <span className={m.intent.policyCheck?.autoExecutable ? "text-emerald-400" : "text-amber-400"}>
                            {m.intent.policyCheck?.autoExecutable ? "✓ Policy Approved" : "⚠ Sign-off Required"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyAndPay(m.intent)}
                        className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        <span>Apply &amp; Pay Now</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-400" />
                <span className="italic">AI Copilot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 border-t border-navy-800/80 bg-navy-950/40">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {samplePrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-navy-900 text-slate-300 hover:text-white hover:bg-navy-800 border border-navy-800 hover:border-brand-500/40 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-navy-800 bg-navy-950/90 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask PaySure AI a question..."
              className="flex-1 bg-navy-900 border border-navy-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white shadow-md shadow-brand-600/30 transition-all shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* 3. The Dock Launcher Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTeaser(false);
        }}
        className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border shadow-xl transition-all duration-200 ${
          isOpen
            ? "bg-navy-800 border-navy-700 text-white"
            : "bg-navy-900 hover:bg-navy-850 border-navy-750 hover:border-brand-500/40 text-slate-200 hover:text-white"
        }`}
        title="Toggle Copilot"
      >
        <div className="flex items-center justify-center p-1.5 rounded-xl bg-navy-800 text-brand-400 border border-navy-700">
          <MessageSquare className="h-4 w-4" />
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white tracking-tight">Support Copilot</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-800 text-slate-400 border border-navy-700">
              Online
            </span>
          </div>
        </div>

        {isOpen && (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
        )}
      </button>
    </div>
  );
}

