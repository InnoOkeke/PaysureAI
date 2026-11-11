"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X, 
  Minus, 
  MessageSquare, 
  ShieldCheck,
  ChevronDown,
  ArrowUpRight
} from "lucide-react";
import { PaySureLogo } from "@/components/brand/Logos";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function FloatingCopilot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissedTeaser, setHasDismissedTeaser] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your PaySure Autonomous AI Agent. Ask me to verify counterparties, summarize pending invoices, or explain Confirmation of Payee on NEAR Protocol.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic context-aware teaser message based on current route
  const getRouteTeaser = () => {
    if (pathname.includes("/pay")) {
      return {
        title: "Payment Safety Guard",
        prompt: "Need me to verify this counterparty's NEAR account ID before sending funds?",
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
        prompt: "Ask me to explain any payee verification status or safety flags.",
      };
    }
    return {
      title: "PaySure AI Copilot",
      prompt: "Have questions about payments, test tokens, or counterparties? Ask me!",
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
    "Send $50 to John Kennedy on Base",
    "Pay Acme Design 75 NEAR",
    "Show my pending invoices",
    "How does Confirmation of Payee work on NEAR?",
    "Is acme-design.testnet verified?",
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
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
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
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 group-hover:scale-110 transition-transform">
                <Sparkles className="h-4 w-4" />
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
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-none shadow-sm"
                      : "bg-navy-950/90 text-slate-200 border border-navy-800 rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
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
        className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full border shadow-2xl transition-all duration-300 ${
          isOpen
            ? "bg-navy-800 border-navy-700 text-white"
            : "bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-brand-500/40 hover:border-brand-400 text-white hover:scale-105 shadow-brand-600/25"
        }`}
        title="Toggle PaySure AI Copilot"
      >
        <div className="relative flex items-center justify-center">
          <div className="p-1 rounded-lg bg-brand-500/20 text-brand-400 group-hover:rotate-12 transition-transform">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-emerald-400" />
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-tight">AI Copilot</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-brand-500/20 text-brand-300">
              Agent
            </span>
          </div>
        </div>

        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <MessageSquare className="h-3.5 w-3.5 text-brand-400" />
        )}
      </button>
    </div>
  );
}

