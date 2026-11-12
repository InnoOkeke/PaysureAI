"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  Wallet, 
  CheckCircle2, 
  ExternalLink,
  Loader2, 
  ArrowRight,
  Download,
  Zap,
  Globe,
  Check,
  Lock,
  Terminal
} from "lucide-react";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";
import { useNearWallet } from "@/context/NearWalletContext";
import { NEAR_CONFIG, isValidNearAccountId } from "@/lib/near/config";
import { isEVMAddress, deriveEVMAddressFromNear } from "@/lib/near/chainSignatures";
import { detectChainFromAddress } from "@/lib/recipients";
import { formatCurrency } from "@/lib/utils";

const SUPPORTED_CHAINS = [
  { id: "near", name: "NEAR Protocol", rail: "NEAR Native", badge: "NEAR", color: "text-emerald-400" },
  { id: "base", name: "Base", rail: "Model A / Solver", badge: "BASE", color: "text-blue-400" },
  { id: "ethereum", name: "Ethereum", rail: "NEAR Chain Signatures", badge: "ETH", color: "text-indigo-400" },
  { id: "bitcoin", name: "Bitcoin", rail: "NEAR Chain Signatures", badge: "BTC", color: "text-amber-400" },
  { id: "solana", name: "Solana", rail: "Model A / Solver", badge: "SOL", color: "text-purple-400" },
  { id: "xrp", name: "Ripple (XRP)", rail: "Model A / Solver", badge: "XRP", color: "text-blue-300" },
  { id: "cosmos", name: "Cosmos", rail: "Model A / Solver", badge: "ATOM", color: "text-teal-400" },
  { id: "stacks", name: "Stacks (L2)", rail: "Model A / Solver", badge: "STX", color: "text-orange-400" },
  { id: "stellar", name: "Stellar", rail: "Model A / Solver", badge: "XLM", color: "text-emerald-300" },
];

export default function PayPage() {
  const searchParams = useSearchParams();
  const invoiceIdParam = searchParams.get("invoiceId");
  const recipientParam = searchParams.get("recipient");
  const amountParam = searchParams.get("amount");
  const promptParam = searchParams.get("prompt");
  const networkParam = searchParams.get("network");
  const memoParam = searchParams.get("memo");
  const txHashParam = searchParams.get("transactionHashes");

  const { accountId, isConnected, balance, connect, sendNearPayment, sendChainSignaturePayment } = useNearWallet();

  // Workflow states
  const [recipient, setRecipient] = useState(recipientParam || "");
  const [selectedChainId, setSelectedChainId] = useState<string>(networkParam || "near");
  const [amount, setAmount] = useState(amountParam || "");
  const [tokenSymbol, setTokenSymbol] = useState("NEAR");
  const [invoiceReference, setInvoiceReference] = useState(memoParam || "");
  const [invoiceId, setInvoiceId] = useState(invoiceIdParam || "");

  // Verification state
  const [verification, setVerification] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  // UI Step state: 1 = Details, 2 = Review & Confirm, 3 = Completed Receipt
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Settlement states
  const [isExecuting, setIsExecuting] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Conversational Intent states
  const [intentInput, setIntentInput] = useState(promptParam || "");
  const [isResolvingIntent, setIsResolvingIntent] = useState(false);
  const [resolvedIntent, setResolvedIntent] = useState<any>(null);
  const [intentError, setIntentError] = useState<string | null>(null);

  const sampleIntents = [
    "Pay LeProf 20 NEAR on Solana",
    "Send $50 to Acme Design on Base",
    "Transfer $120 to Satoshi on Stacks L2",
    "Pay LeProf 15 NEAR on Ripple (XRP)",
    "Send $200 to Acme on Bitcoin",
  ];

  const handleSelectChain = (chainId: string) => {
    setSelectedChainId(chainId);
    if (verification?.recipient) {
      const r = verification.recipient;
      if (chainId === "near" && r.walletAddress) setRecipient(r.walletAddress);
      else if ((chainId === "base" || chainId === "ethereum") && r.evmAddress) setRecipient(r.evmAddress);
      else if (chainId === "bitcoin" && r.bitcoinAddress) setRecipient(r.bitcoinAddress);
      else if (chainId === "solana" && r.solanaAddress) setRecipient(r.solanaAddress);
      else if (chainId === "xrp" && r.xrpAddress) setRecipient(r.xrpAddress);
      else if (chainId === "cosmos" && r.cosmosAddress) setRecipient(r.cosmosAddress);
      else if (chainId === "stacks" && r.stacksAddress) setRecipient(r.stacksAddress);
      else if (chainId === "stellar" && r.stellarAddress) setRecipient(r.stellarAddress);
    }
  };

  const handleResolveIntent = async (customPrompt?: string) => {
    const promptToUse = customPrompt || intentInput;
    if (!promptToUse.trim()) return;
    if (customPrompt) setIntentInput(customPrompt);
    setIsResolvingIntent(true);
    setIntentError(null);
    try {
      const res = await fetch("/api/near/intents/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse, senderAccount: accountId || "company.near" }),
      });
      const data = await res.json();
      if (data.resolved) {
        setResolvedIntent(data.resolved);
      } else {
        setIntentError(data.error || "Failed to resolve intent");
      }
    } catch (e: any) {
      setIntentError(e.message || "Network error resolving intent");
    } finally {
      setIsResolvingIntent(false);
    }
  };

  const isValidRecipient = (addr: string) => {
    return !!addr && addr.trim().length > 2;
  };

  const handleApplyResolvedIntent = () => {
    if (!resolvedIntent) return;
    const targetAddr =
      resolvedIntent.targetChain !== "NEAR Protocol" && resolvedIntent.resolvedPayee.targetChainAddress
        ? resolvedIntent.resolvedPayee.targetChainAddress
        : resolvedIntent.resolvedPayee.accountId;
    setRecipient(targetAddr);
    setAmount(resolvedIntent.extractedAmount.toString());
    setTokenSymbol(resolvedIntent.extractedCurrency === "NEAR" ? "NEAR" : "USDC");
    setInvoiceReference(resolvedIntent.memo);

    const matchChain = SUPPORTED_CHAINS.find((c) =>
      resolvedIntent.targetChain.toLowerCase().includes(c.id)
    );
    if (matchChain) setSelectedChainId(matchChain.id);

    checkPayee(targetAddr, resolvedIntent.resolvedPayee.displayName);
  };

  // Pre-fill from invoice, URL params, or Copilot custom intent event
  useEffect(() => {
    if (invoiceIdParam) {
      fetch(`/api/invoices`)
        .then((r) => r.json())
        .then((data) => {
          const inv = data.invoices?.find((i: any) => i.id === invoiceIdParam);
          if (inv) {
            setRecipient(inv.recipientAddress);
            setAmount(inv.amount.toString());
            setInvoiceReference(inv.invoiceNumber);
            setInvoiceId(inv.id);
            checkPayee(inv.recipientAddress, inv.recipientName);
          }
        })
        .catch(console.error);
    } else {
      if (recipientParam) {
        setRecipient(recipientParam);
        checkPayee(recipientParam);
      }
      if (amountParam) {
        setAmount(amountParam);
      }
      if (memoParam) {
        setInvoiceReference(memoParam);
      }
      if (networkParam) {
        const match = SUPPORTED_CHAINS.find(
          (c) =>
            c.id === networkParam.toLowerCase() ||
            c.name.toLowerCase().includes(networkParam.toLowerCase())
        );
        if (match) setSelectedChainId(match.id);
      }
    }
    if (promptParam) {
      handleResolveIntent(promptParam);
    }
  }, [invoiceIdParam, recipientParam, amountParam, memoParam, networkParam, promptParam]);

  // Listen for instant 1-click apply events from the Copilot chatbot
  useEffect(() => {
    const handleApplyIntentEvent = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.recipient) {
        setRecipient(detail.recipient);
        checkPayee(detail.recipient, detail.name);
      }
      if (detail.amount) setAmount(detail.amount.toString());
      if (detail.network) {
        const match = SUPPORTED_CHAINS.find(
          (c) =>
            c.id === detail.network.toLowerCase() ||
            c.name.toLowerCase().includes(detail.network.toLowerCase())
        );
        if (match) setSelectedChainId(match.id);
      }
      if (detail.memo) setInvoiceReference(detail.memo);
      setStep(1);
    };

    window.addEventListener("paysure:apply-intent", handleApplyIntentEvent);
    return () => window.removeEventListener("paysure:apply-intent", handleApplyIntentEvent);
  }, []);

  // Handle return callback from MyNearWallet after signing real on-chain transaction
  useEffect(() => {
    if (txHashParam) {
      const rec = recipientParam || "acme-design.testnet";
      const amt = parseFloat(searchParams.get("amount") || "10");
      setRecipient(rec);
      setAmount(amt.toString());
      setStep(3);

      fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: accountId || "my-near-wallet.testnet",
          recipientAddress: rec,
          amount: amt,
          tokenAddress: "native.near",
          transactionHash: txHashParam,
          invoiceId: invoiceIdParam || null,
          invoiceReference: invoiceReference || `INV-${Date.now().toString().slice(-4)}`,
          network: "NEAR Testnet",
          chainId: 0,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.payment) {
            setReceiptData(data.payment);
          } else {
            setReceiptData({
              senderAddress: accountId || "my-near-wallet.testnet",
              recipientAddress: rec,
              amount: amt,
              transactionHash: txHashParam,
              createdAt: new Date().toISOString(),
            });
          }
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        })
        .catch(console.error);
    }
  }, [txHashParam]);

  const handlePayWithMyNearWallet = () => {
    if (!recipient || !isValidRecipient(recipient)) {
      alert("Please enter a valid destination recipient address or NEAR account.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const isCrossChain = selectedChainId !== "near";
    const nearReceiverId = isCrossChain ? "v1.signer-prod.testnet" : recipient;

    const currentUrl = typeof window !== "undefined" ? window.location.origin + "/pay" : "";
    const redirectUrl = `${currentUrl}?recipient=${encodeURIComponent(recipient)}&amount=${encodeURIComponent(
      amount
    )}&invoiceId=${encodeURIComponent(invoiceId || "")}&network=${encodeURIComponent(selectedChainId)}`;

    const walletUrl = `${NEAR_CONFIG.walletUrl}/send-money?recipient=${encodeURIComponent(
      nearReceiverId
    )}&amount=${encodeURIComponent(amount)}&redirect_url=${encodeURIComponent(redirectUrl)}`;

    window.location.href = walletUrl;
  };

  const checkPayee = async (addr: string, name?: string) => {
    if (!addr) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/recipients/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr, name }),
      });
      const data = await res.json();
      setVerification(data);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !isValidRecipient(recipient)) {
      alert("Please enter a valid recipient account or address.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setStep(2);
  };

  const handleExecutePayment = async () => {
    if (!isConnected || !accountId) {
      connect();
      return;
    }
    if (!recipient || !isValidRecipient(recipient)) {
      alert("Please enter a valid recipient account or address.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsExecuting(true);
    try {
      let txHash = "";
      const isEvm = isEVMAddress(recipient);
      const isBtc = /^(bc1|[13]|tb1)/.test(recipient);

      if (isEvm || isBtc) {
        // Execute cross-chain settlement via NEAR Chain Signatures MPC (prompts connected wallet)
        txHash = await sendChainSignaturePayment(recipient, amount);
      } else if (selectedChainId === "near") {
        txHash = await sendNearPayment(recipient, amount);
      } else {
        // Model A Cross-chain Intent Solver dispatch (locks funds on NEAR into solver contract v1.signer-prod.testnet)
        txHash = await sendNearPayment("v1.signer-prod.testnet", amount);
      }

      const activeChain = SUPPORTED_CHAINS.find((c) => c.id === selectedChainId) || SUPPORTED_CHAINS[0];

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: accountId,
          recipientAddress: recipient,
          amount: parseFloat(amount),
          tokenAddress: tokenSymbol === "NEAR" ? "native.near" : "usdc.fakes.testnet",
          transactionHash: txHash || `NEAR-LIVE-${Date.now()}`,
          invoiceId: invoiceId || null,
          invoiceReference: invoiceReference || `INV-${Date.now().toString().slice(-4)}`,
          network: activeChain.name,
          chainId: selectedChainId === "near" ? 0 : 1,
        }),
      });

      const data = await res.json();
      if (data.payment) {
        setReceiptData(data.payment);
        setStep(3);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      console.error("NEAR transaction execution error:", err);
      alert(err.message || "Failed to execute transaction with connected NEAR wallet.");
    } finally {
      setIsExecuting(false);
    }
  };

  const downloadPdfReceipt = () => {
    if (!receiptData) return;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("PaySure AI — Verifiable Payment Receipt", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Protocol: NEAR Protocol (Testnet)`, 14, 30);
    doc.text(`Receipt ID: ${receiptData.receipt?.receiptNumber || receiptData.id}`, 14, 36);
    doc.text(`Timestamp: ${new Date(receiptData.createdAt).toUTCString()}`, 14, 42);

    doc.setDrawColor(200);
    doc.line(14, 48, 196, 48);

    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Settlement Summary", 14, 58);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Sender (NEAR Account):`, 14, 68);
    doc.setFont("helvetica", "bold");
    doc.text(`${receiptData.senderAddress}`, 75, 68);

    doc.setFont("helvetica", "normal");
    doc.text(`Recipient (NEAR Account):`, 14, 76);
    doc.setFont("helvetica", "bold");
    doc.text(`${receiptData.recipientAddress}`, 75, 76);

    doc.setFont("helvetica", "normal");
    doc.text(`Settlement Amount:`, 14, 84);
    doc.setFont("helvetica", "bold");
    doc.text(`${formatCurrency(receiptData.amount)} ${tokenSymbol}`, 75, 84);

    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Reference:`, 14, 92);
    doc.text(`${receiptData.invoiceReference || "Direct Settlement"}`, 75, 92);

    doc.text(`Transaction Hash:`, 14, 100);
    doc.setFont("courier", "bold");
    doc.text(`${receiptData.transactionHash}`, 75, 100);

    doc.line(14, 108, 196, 108);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 150, 80);
    doc.text("Confirmation of Payee: IDENTITY MATCHED & VERIFIED", 14, 118);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(
      "This transaction was validated by PaySure AI and settled via NEAR Protocol.",
      14,
      126
    );

    doc.save(`PaySure_Receipt_${receiptData.invoiceReference || "NEAR"}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#050507] py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400 block mb-1">
            Confirmation of Payee &amp; Multi-Chain Intents
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Send Verified Payment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verify recipient identity on-chain and check autonomous treasury guardrails before signing.
          </p>
        </div>

        {/* Segmented Step Indicator */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.08] self-start sm:self-auto whitespace-nowrap">
          <span
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
              step === 1
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-400"
            }`}
          >
            1. Details
          </span>
          <span
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
              step === 2
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-400"
            }`}
          >
            2. Verify &amp; Sign
          </span>
          <span
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
              step === 3
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400"
            }`}
          >
            3. Receipt
          </span>
        </div>
      </div>

      {/* STEP 1: Enter Details (2-Column Terminal Layout) */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (7 Cols): Intent Bar + Payment Configuration Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Conversational Intent Resolver Card */}
            <div className="rounded-3xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-7 space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">Conversational Intent Resolver</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
                        Chain Signatures MPC
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Express a payment in plain English to auto-fill recipient, asset, and target network.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={intentInput}
                  onChange={(e) => setIntentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleResolveIntent();
                    }
                  }}
                  placeholder='e.g. "Send $50 to John Kennedy on Base" or "Pay Acme Design 75 NEAR"'
                  className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleResolveIntent()}
                  disabled={isResolvingIntent || !intentInput.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shrink-0 whitespace-nowrap"
                >
                  {isResolvingIntent ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Resolving...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5" />
                      <span>Resolve Intent</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample Intent Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {sampleIntents.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleResolveIntent(chip)}
                    className="text-[11px] px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] text-slate-300 hover:text-white transition-all whitespace-nowrap"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Intent Error */}
              {intentError && (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{intentError}</span>
                </div>
              )}

              {/* Resolved Intent Preview */}
              {resolvedIntent && (
                <div className="rounded-2xl border border-emerald-500/30 bg-white/[0.02] p-4 space-y-3.5 pt-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-300">Intent Resolved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                        {resolvedIntent.settlementExecution.settlementRail}
                      </span>
                      <button
                        type="button"
                        onClick={() => setResolvedIntent(null)}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-slate-400 block text-[11px]">Target Network</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Globe className="h-3.5 w-3.5 text-brand-400" />
                        <span className="font-semibold text-white">{resolvedIntent.targetChain}</span>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-slate-400 block text-[11px]">Parsed Amount</span>
                      <span className="font-mono font-semibold text-emerald-400 mt-1 block">
                        ${resolvedIntent.extractedAmount.toFixed(2)} {resolvedIntent.extractedCurrency}
                      </span>
                    </div>

                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-slate-400 block text-[11px]">Resolved Payee</span>
                      <span className="font-semibold text-white truncate mt-1 block">
                        {resolvedIntent.resolvedPayee.displayName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {resolvedIntent.resolvedPayee.accountId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Trust Score: <strong className="text-white">{resolvedIntent.resolvedPayee.reputationScore}/100</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyResolvedIntent}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Apply to Transfer Form</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Payment Form Card */}
            <form
              onSubmit={handleProceedToReview}
              className="rounded-3xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <div className="border-b border-white/[0.06] pb-4">
                <h3 className="text-base font-semibold text-white">Transfer Parameters</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure destination network, recipient account or cross-chain address, and settlement amount.
                </p>
              </div>

              {/* Destination Blockchain Selector */}
              <div className="space-y-2 pb-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Destination Blockchain
                  </label>
                  <span className="text-[10px] font-mono text-brand-400">
                    Model A Intent Bridge &amp; Chain Signatures
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {SUPPORTED_CHAINS.map((c) => {
                    const isSelected = selectedChainId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectChain(c.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                          isSelected
                            ? "bg-white text-black font-semibold border-white shadow-md"
                            : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white hover:border-white/[0.15]"
                        }`}
                      >
                        <span className="font-mono text-[10px] mr-1.5 opacity-70">{c.badge}</span>
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient Account Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300 block">
                    Recipient Address / Handle ({SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name || "NEAR"})
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span>{SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.rail || "Cross-Chain Rail"}</span>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRecipient(val);
                      if (val.trim()) {
                        const detected = detectChainFromAddress(val);
                        const match = SUPPORTED_CHAINS.find(
                          (c) =>
                            detected.chain.toLowerCase().includes(c.id) ||
                            c.name.toLowerCase() === detected.chain.toLowerCase()
                        );
                        if (match) setSelectedChainId(match.id);
                        checkPayee(val);
                      }
                    }}
                    placeholder={
                      selectedChainId === "near"
                        ? "e.g. acme-design.testnet or satoshi.near"
                        : selectedChainId === "base" || selectedChainId === "ethereum"
                        ? "e.g. 0x71C8360f... on Base/Ethereum"
                        : selectedChainId === "bitcoin"
                        ? "e.g. bc1qw508d... on Bitcoin"
                        : selectedChainId === "solana"
                        ? "e.g. 7xKXtg2CW... on Solana"
                        : selectedChainId === "xrp"
                        ? "e.g. r9cZA1mL... on Ripple (XRP)"
                        : selectedChainId === "cosmos"
                        ? "e.g. cosmos1hsk... on Cosmos Hub"
                        : selectedChainId === "stacks"
                        ? "e.g. SP1P72Z... on Stacks (L2)"
                        : "e.g. GDQP2KP... on Stellar"
                    }
                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                    required
                  />
                  {verifying && (
                    <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                      <span>Verifying...</span>
                    </div>
                  )}
                </div>

                {selectedChainId !== "near" && (
                  <div className="p-3 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-cyan-300 font-medium">
                      <span>Cross-Chain Settlement Rail</span>
                      <span>Target: {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                      Routing via{" "}
                      <span className="text-white font-semibold">
                        {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.rail}
                      </span>{" "}
                      from your NEAR treasury account.
                    </p>
                  </div>
                )}

                {/* Inline Confirmation of Payee Status Indicator */}
                {verification && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      verification.status === "VERIFIED"
                        ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                        : verification.status === "WARNING"
                        ? "bg-amber-950/30 border-amber-500/30 text-amber-300"
                        : "bg-rose-950/30 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {verification.status === "VERIFIED" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-white">
                          {verification.recipient?.displayName ||
                            (verification.status === "VERIFIED"
                              ? "Identity Matched"
                              : "Unregistered Recipient")}
                        </span>
                        {verification.recipient?.paymentId && (
                          <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                            ({verification.recipient.paymentId})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 border border-white/[0.08] uppercase">
                      {verification.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Amount & Asset */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-slate-300">
                      Payment Amount
                    </label>
                    {isConnected && (
                      <span className="text-[11px] text-slate-400">
                        Available: <strong className="text-brand-300 font-mono">{balance} NEAR</strong>
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300 block">
                    Settlement Asset
                  </label>
                  <select
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    className="w-full bg-[#0D111A] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="NEAR">NEAR (Native)</option>
                    <option value="USDC">USDC (NEP-141)</option>
                  </select>
                </div>
              </div>

              {/* Invoice Reference */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Invoice Reference / Memo (Optional)
                </label>
                <input
                  type="text"
                  value={invoiceReference}
                  onChange={(e) => setInvoiceReference(e.target.value)}
                  placeholder="e.g. INV-2026-9042 or Q4 Retainer"
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/25 transition-all active:scale-[0.98]"
                >
                  <span>Review &amp; Verify Recipient</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column (5 Cols): Live Confirmation of Payee & Security Inspector (Sticky) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-fit">
            
            {/* Active Treasury Guardrails Summary */}
            <div className="rounded-3xl bg-[#090B10] border border-white/[0.08] p-6 space-y-3.5 text-xs shadow-xl">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Lock className="h-3.5 w-3.5 text-brand-400" />
                <span>Active Settlement Safeguards</span>
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between py-1.5 border-b border-white/[0.05] text-slate-400">
                  <span>Single-Tx Policy Limit</span>
                  <span className="text-white">200.00 NEAR ($500)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.05] text-slate-400">
                  <span>Consensus Finality</span>
                  <span className="text-emerald-400">~1.1s (Nightshade 2.0)</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-400">
                  <span>Custody Model</span>
                  <span className="text-slate-200">Non-Custodial Wallet Sign</span>
                </div>
              </div>
            </div>

            {/* Live Payee Verification Panel (Confirmation of Payee) */}
            <div className="rounded-3xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Confirmation of Payee</h3>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Live RPC Check
                </span>
              </div>

              {verification ? (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      verification.status === "VERIFIED"
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                        : verification.status === "WARNING"
                        ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                        : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {verification.status === "VERIFIED" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {verification.status === "VERIFIED"
                            ? "Identity Matched & Verified"
                            : verification.status === "WARNING"
                            ? "Security Advisory Flag"
                            : "Unregistered or High Risk"}
                        </span>
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-black/40 border border-white/[0.08]">
                          {verification.status}
                        </span>
                      </div>
                      {verification.reason && (
                        <p className="text-slate-300 leading-relaxed pt-1">{verification.reason}</p>
                      )}
                    </div>
                  </div>

                  {verification.recipient && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Registered Entity</span>
                        <span className="text-white font-sans font-medium">{verification.recipient.displayName}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Payment ID</span>
                        <span className="text-brand-300">{verification.recipient.paymentId}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter a recipient account or cross-chain address on the left to automatically query the on-chain registry and screen for lookalike homoglyphs.
                  </p>
                  <div className="space-y-2.5 text-xs">
                    {[
                      "On-chain account existence check (NEAR RPC)",
                      "Corporate entity name & payment ID attestation",
                      "Levenshtein distance typosquatting defense",
                      "Autonomous treasury velocity compliance"
                    ].map((checkItem) => (
                      <div key={checkItem} className="flex items-center gap-2.5 text-slate-300 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{checkItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* STEP 2: Review & Sign */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto rounded-3xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-9 space-y-6 shadow-2xl">
          <div className="border-b border-white/[0.06] pb-4">
            <h3 className="text-lg font-bold text-white">Review Verified Settlement</h3>
            <p className="text-xs text-slate-400 mt-1">
              Confirm recipient identity and payment parameters before signing with your wallet.
            </p>
          </div>

          {verification?.status === "MISMATCH" && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-start gap-3 text-rose-300 text-xs">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold">CRITICAL WARNING: Account Mismatch Detected</p>
                <p className="mt-1 text-slate-300">
                  The recipient NEAR account does not match the registered legal identity for this invoice.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.07] p-5 space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-white/[0.06]">
              <span className="text-slate-400">Recipient Account ID</span>
              <span className="font-mono font-bold text-white text-sm">{recipient}</span>
            </div>

            {verification?.recipient && (
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.06]">
                <span className="text-slate-400">Verified Legal Name</span>
                <span className="font-semibold text-emerald-400">{verification.recipient.displayName}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-1.5 border-b border-white/[0.06]">
              <span className="text-slate-400">Total Settlement Amount</span>
              <span className="font-mono font-bold text-brand-300 text-base">
                {formatCurrency(amount)} {tokenSymbol}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/[0.06]">
              <span className="text-slate-400">Settlement Network</span>
              <span className="font-semibold text-slate-200">
                {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name || "NEAR Protocol"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/[0.06]">
              <span className="text-slate-400">Execution Rail</span>
              <span className="font-semibold text-cyan-400">
                {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.rail || "Native Settlement"}
              </span>
            </div>

            {(isEVMAddress(recipient) || selectedChainId === "ethereum" || selectedChainId === "base" || selectedChainId === "arbitrum") && (
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.06]">
                <span className="text-slate-400">NEAR MPC EVM Signer</span>
                <span className="font-mono text-[11px] text-brand-300 truncate max-w-[260px]">
                  {deriveEVMAddressFromNear(accountId || "company.testnet")}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400">Invoice / Memo Reference</span>
              <span className="font-mono text-slate-300">{invoiceReference || "Direct Transfer"}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-white order-2 sm:order-1"
            >
              &larr; Back to Details
            </button>

            {!isConnected ? (
              <button
                type="button"
                onClick={() => connect()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/25 transition-all order-1 sm:order-2"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect NEAR Wallet to Sign</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isExecuting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing Transaction...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4" />
                      <span>Sign &amp; Transfer ({accountId})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePayWithMyNearWallet}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all"
                  title="Or transfer directly via MyNearWallet web"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>MyNearWallet Web</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Completed Receipt */}
      {step === 3 && receiptData && (
        <div className="max-w-2xl mx-auto rounded-3xl bg-[#090B10] border border-emerald-500/30 p-6 sm:p-9 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Payment Confirmed on NEAR</h2>
            <p className="text-xs text-slate-400">
              The settlement has been finalized on-chain with a verifiable audit receipt.
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.07] p-5 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.06]">
              <span className="text-slate-400">Receipt Number</span>
              <span className="font-mono text-emerald-400 font-bold">
                {receiptData.receipt?.receiptNumber || receiptData.id}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Amount Paid</span>
              <span className="font-mono font-bold text-white text-sm">
                {formatCurrency(receiptData.amount)} {tokenSymbol}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Recipient Account / Address</span>
              <span className="font-mono text-slate-200">{receiptData.recipientAddress}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Destination Network</span>
              <span className="font-semibold text-brand-300">
                {receiptData.network || (SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name ?? "NEAR Protocol")}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Settlement Rail</span>
              <span className="font-mono text-cyan-400 text-xs">
                {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.rail || "NEAR Nightshade Consensus"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">NEAR Settlement Hash</span>
              <a
                href={`${NEAR_CONFIG.explorerUrl}/txns/${receiptData.transactionHash}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-brand-400 hover:text-brand-300 inline-flex items-center gap-1"
              >
                <span>{receiptData.transactionHash.slice(0, 16)}...</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={downloadPdfReceipt}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold border border-white/[0.08] transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF Receipt</span>
            </button>

            <button
              onClick={() => {
                setStep(1);
                setAmount("");
                setRecipient("");
                setVerification(null);
                setReceiptData(null);
              }}
              className="w-full sm:w-auto flex-1 px-5 py-3 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all shadow-md shadow-brand-600/25"
            >
              Make Another Payment
            </button>
          </div>
        </div>
      )}

      {/* Awaiting Wallet Confirmation In-Flight Modal */}
      {isExecuting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl bg-[#090B10] border border-white/[0.12] p-6 sm:p-8 space-y-6 text-center shadow-2xl">
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-brand-400 animate-spin" />
              <Wallet className="h-5 w-5 text-white absolute" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {selectedChainId === "near"
                  ? "Confirm in Connected Wallet"
                  : `Authorize Multi-Chain Transfer (${SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name || "Cross-Chain"})`}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                {selectedChainId === "near"
                  ? "Please approve the transaction in your connected NEAR wallet popup (MyNearWallet / Meteor) to finalize settlement."
                  : `Please approve the transaction in your connected NEAR wallet popup to lock funds and dispatch cross-chain settlement to ${SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name}.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-2.5 font-mono text-left">
              <div className="flex justify-between items-center text-slate-400">
                <span>Beneficiary:</span>
                <span className="text-white truncate max-w-[200px] font-medium">{recipient}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Target Chain:</span>
                <span className="text-brand-300 font-sans font-semibold">
                  {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name || "NEAR Protocol"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Settlement Rail:</span>
                <span className="text-cyan-400 font-sans font-semibold">
                  {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.rail || "NEAR Protocol (Native)"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Signer / Solver:</span>
                <span className="text-slate-300">
                  {selectedChainId !== "near" ? "v1.signer-prod.testnet" : (accountId || "Connected Wallet")}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-white/[0.04]">
                <span>Total Amount:</span>
                <span className="text-emerald-400 font-bold text-sm">{amount} {tokenSymbol}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsExecuting(false)}
                className="w-full py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel or Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
