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
  Terminal,
  ChevronDown,
  Info
} from "lucide-react";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";
import { useNearWallet } from "@/context/NearWalletContext";
import { NEAR_CONFIG, isValidNearAccountId } from "@/lib/near/config";
import { isEVMAddress, deriveEVMAddressFromNear } from "@/lib/near/chainSignatures";
import { detectChainFromAddress } from "@/lib/recipients";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

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

  const { accountId, isConnected, balance, connect, sendNearPayment, sendChainSignaturePayment, refreshBalance } = useNearWallet();
  const toast = useToast();

  // Workflow states
  const [recipient, setRecipient] = useState(recipientParam || "");
  const [selectedChainId, setSelectedChainId] = useState<string>(networkParam || "near");
  const [amount, setAmount] = useState(amountParam || "");
  const [tokenSymbol, setTokenSymbol] = useState("NEAR");
  const [invoiceReference, setInvoiceReference] = useState(memoParam || "");
  const [invoiceId, setInvoiceId] = useState(invoiceIdParam || "");

  // Dynamic balance validation
  const numericAmount = parseFloat(amount || "0");
  const numericBalance = isConnected && balance ? parseFloat(balance) : null;
  const isInsufficientBalance = numericBalance !== null && !isNaN(numericAmount) && numericAmount > numericBalance;
  const isAmountValid = !isNaN(numericAmount) && numericAmount > 0 && !isInsufficientBalance;

  // Verification state
  const [verification, setVerification] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  // UI Step state: 1 = Details, 2 = Review & Confirm, 3 = Completed Receipt
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Settlement states
  const [isExecuting, setIsExecuting] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [showCoPDetails, setShowCoPDetails] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);

  // Conversational Intent states
  const [intentInput, setIntentInput] = useState(promptParam || "");
  const [isResolvingIntent, setIsResolvingIntent] = useState(false);
  const [resolvedIntent, setResolvedIntent] = useState<any>(null);
  const [intentError, setIntentError] = useState<string | null>(null);

  const paymentBlocked =
    verification?.status === "MISMATCH" ||
    (resolvedIntent?.policyCheck ? !resolvedIntent.policyCheck.isAllowed : false);

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

  useEffect(() => {
    if (!txHashParam) return;

    const rec = recipientParam || "acme-design.testnet";
    const amt = parseFloat(searchParams.get("amount") || "10");
    const payerAccount =
      searchParams.get("payerAccount") || accountId || "my-near-wallet.testnet";
    const pendingParam = searchParams.get("pendingActionId");

    setRecipient(rec);
    setAmount(amt.toString());
    setStep(3);

    const recordPayment = async () => {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: payerAccount,
          recipientAddress: rec,
          amount: amt,
          tokenAddress: "native.near",
          transactionHash: txHashParam,
          invoiceId: invoiceIdParam || null,
          invoiceReference: invoiceReference || `INV-${Date.now().toString().slice(-4)}`,
          network: "NEAR Testnet",
          chainId: 0,
        }),
      });

      const data = await res.json();
      if (data.payment) {
        setReceiptData(data.payment);
      } else {
        setReceiptData({
          senderAddress: payerAccount,
          recipientAddress: rec,
          amount: amt,
          transactionHash: txHashParam,
          createdAt: new Date().toISOString(),
        });
      }

      if (pendingParam) {
        await fetch(`/api/intents/${pendingParam}/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: payerAccount, txHash: txHashParam }),
        }).catch(() => undefined);
      }

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    };

    recordPayment().catch(console.error);
  }, [txHashParam]);

  const prepareAndConfirmPayment = async (): Promise<string | null> => {
    if (!accountId) {
      throw new Error("Connect your NEAR wallet before approving this payment.");
    }

    const activeChain =
      SUPPORTED_CHAINS.find((chain) => chain.id === selectedChainId) ?? SUPPORTED_CHAINS[0];

    const payload = {
      recipient,
      recipientAddress: recipient,
      amount: parseFloat(amount),
      tokenSymbol,
      invoiceReference: invoiceReference || null,
      invoiceId: invoiceId || null,
      verificationStatus: verification?.status ?? "UNVERIFIED",
      targetChain: resolvedIntent?.targetChain ?? activeChain.name,
      settlementRail:
        resolvedIntent?.settlementExecution?.settlementRail ?? activeChain.rail,
      policyCheck: resolvedIntent?.policyCheck ?? null,
    };

    const prepareRes = await fetch("/api/intents/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId,
        payload,
        quoteSnapshot: resolvedIntent ?? { amount, recipient, tokenSymbol },
        source: "web",
      }),
    });

    if (prepareRes.status === 404) {
      return null;
    }

    const prepared = await prepareRes.json();
    if (!prepareRes.ok || !prepared.id) {
      throw new Error(prepared.error || prepared.message || "Failed to prepare payment approval.");
    }

    const confirmRes = await fetch(`/api/intents/${prepared.id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    });
    const confirmed = await confirmRes.json();
    if (!confirmRes.ok || confirmed.status !== "CONFIRMED") {
      throw new Error(confirmed.error || confirmed.message || "Failed to confirm payment approval.");
    }

    setPendingActionId(prepared.id);
    return prepared.id;
  };

  const cancelPendingPayment = async (actionId: string) => {
    if (!accountId) return;
    await fetch(`/api/intents/${actionId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    }).catch(() => undefined);
  };

  const executePendingPayment = async (actionId: string, txHash: string) => {
    if (!accountId) return;
    await fetch(`/api/intents/${actionId}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, txHash }),
    }).catch(() => undefined);
  };

  const handlePayWithMyNearWallet = async () => {
    if (!recipient || !isValidRecipient(recipient)) {
      toast.error("Please enter a valid destination recipient address or NEAR account.", "Invalid Recipient");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.", "Invalid Amount");
      return;
    }
    if (isInsufficientBalance) {
      toast.warning(`Insufficient funds. Your available balance is ${balance} NEAR.`, "Insufficient Balance");
      return;
    }

    const isCrossChain = selectedChainId !== "near";
    const nearReceiverId = isCrossChain ? "v1.signer-prod.testnet" : recipient;

    setPendingError(null);
    try {
      const actionId = await prepareAndConfirmPayment();
      const currentUrl = typeof window !== "undefined" ? window.location.origin + "/pay" : "";
      const redirectUrl = `${currentUrl}?recipient=${encodeURIComponent(recipient)}&amount=${encodeURIComponent(
        amount
      )}&invoiceId=${encodeURIComponent(invoiceId || "")}&network=${encodeURIComponent(
        selectedChainId
      )}&memo=${encodeURIComponent(invoiceReference || "")}&payerAccount=${encodeURIComponent(
        accountId || ""
      )}&pendingActionId=${encodeURIComponent(actionId || "")}`;

      const walletUrl = `${NEAR_CONFIG.walletUrl}/send-money?recipient=${encodeURIComponent(
        nearReceiverId
      )}&amount=${encodeURIComponent(amount)}&redirect_url=${encodeURIComponent(redirectUrl)}`;

      window.location.href = walletUrl;
    } catch (err: any) {
      const msg = err.message || "Failed to prepare payment approval.";
      setPendingError(msg);
      toast.error(msg, "Payment Approval Error");
    }
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
      toast.error("Please enter a valid recipient account or address.", "Invalid Recipient");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid payment amount.", "Invalid Amount");
      return;
    }
    if (isInsufficientBalance) {
      toast.warning(`Insufficient funds. Your available balance is ${balance} NEAR.`, "Insufficient Balance");
      return;
    }
    setPendingError(null);
    setStep(2);
  };

  const handleExecutePayment = async () => {
    if (!isConnected || !accountId) {
      connect();
      return;
    }
    if (!recipient || !isValidRecipient(recipient)) {
      toast.error("Please enter a valid recipient account or address.", "Invalid Recipient");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid payment amount.", "Invalid Amount");
      return;
    }
    if (paymentBlocked) {
      const msg = "This payment is blocked by the active treasury policy. Resolve the violations or escalate to SputnikDAO before signing.";
      setPendingError(msg);
      toast.error(msg, "Policy Guardrail Block");
      return;
    }
    if (isInsufficientBalance) {
      toast.warning(`Insufficient funds. Your available balance is ${balance} NEAR.`, "Insufficient Balance");
      return;
    }

    setIsExecuting(true);
    setPendingError(null);
    let actionId: string | null = null;

    try {
      actionId = await prepareAndConfirmPayment();
      let txHash = "";
      const isEvm = isEVMAddress(recipient);
      const isBtc = /^(bc1|[13]|tb1)/.test(recipient);

      if (isEvm || isBtc) {
        txHash = await sendChainSignaturePayment(recipient, amount);
      } else if (selectedChainId === "near") {
        txHash = await sendNearPayment(recipient, amount);
      } else {
        txHash = await sendNearPayment("v1.signer-prod.testnet", amount);
      }

      const finalHash = txHash || `NEAR-LIVE-${Date.now()}`;
      const activeChain = SUPPORTED_CHAINS.find((c) => c.id === selectedChainId) || SUPPORTED_CHAINS[0];

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: accountId,
          recipientAddress: recipient,
          amount: parseFloat(amount),
          tokenAddress: tokenSymbol === "NEAR" ? "native.near" : "usdc.fakes.testnet",
          transactionHash: finalHash,
          invoiceId: invoiceId || null,
          invoiceReference: invoiceReference || `INV-${Date.now().toString().slice(-4)}`,
          network: activeChain.name,
          chainId: selectedChainId === "near" ? 0 : 1,
        }),
      });

      const data = await res.json();
      if (actionId) {
        await executePendingPayment(actionId, finalHash);
      }

      setReceiptData(
        data.payment ?? {
          senderAddress: accountId,
          recipientAddress: recipient,
          amount: parseFloat(amount),
          transactionHash: finalHash,
          invoiceReference: invoiceReference || "Direct Transfer",
          createdAt: new Date().toISOString(),
        }
      );
      setStep(3);
      if (refreshBalance) {
        refreshBalance();
        setTimeout(refreshBalance, 1200);
        setTimeout(refreshBalance, 3000);
      }
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      if (actionId) {
        await cancelPendingPayment(actionId);
      }
      console.error("NEAR transaction execution error:", err);
      const msg = err.message || "Failed to execute transaction with connected NEAR wallet.";
      setPendingError(msg);
      toast.error(msg, "Execution Error");
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
    <div className="min-h-screen bg-canvas py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line-subtle">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-ink block mb-1">
            Confirmation of Payee &amp; Multi-Chain Intents
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Send Verified Payment
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Verify recipient identity on-chain and check autonomous treasury guardrails before signing.
          </p>
        </div>

        {/* Segmented Step Indicator */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-subtle border border-line-subtle self-start sm:self-auto whitespace-nowrap">
          <span
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
              step === 1
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted"
            }`}
          >
            1. Details
          </span>
          <span
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
              step === 2
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted"
            }`}
          >
            2. Verify &amp; Sign
          </span>
          <span
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
              step === 3
                ? "bg-success text-white shadow-sm"
                : "text-ink-muted"
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
            <div className="surface-card rounded-3xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-accent-soft border border-accent-border flex items-center justify-center text-accent-ink shrink-0">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">Conversational Intent Resolver</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-subtle border border-line-subtle text-ink-secondary">
                        Chain Signatures MPC
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5">
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
                  className="input-field flex-1 px-4 py-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleResolveIntent()}
                  disabled={isResolvingIntent || !intentInput.trim()}
                  className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs shrink-0 whitespace-nowrap focus-ring"
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
                    className="text-[11px] px-3 py-1 rounded-full bg-subtle hover:bg-hover border border-line-subtle text-ink-secondary hover:text-ink transition-all whitespace-nowrap focus-ring"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Intent Error */}
              {intentError && (
                <div className="p-3.5 rounded-xl bg-danger-soft border border-danger-border text-danger text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
                  <span>{intentError}</span>
                </div>
              )}

              {/* Resolved Intent Preview */}
              {resolvedIntent && (
                <div className="surface-inset rounded-2xl !border-success-border p-4 space-y-3.5 pt-4">
                  <div className="flex items-center justify-between border-b border-line-subtle pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-xs font-semibold text-success">Intent Resolved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-subtle text-ink-secondary">
                        {resolvedIntent.settlementExecution.settlementRail}
                      </span>
                      <button
                        type="button"
                        onClick={() => setResolvedIntent(null)}
                        className="text-ink-muted hover:text-ink text-xs focus-ring rounded px-1"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-elevated p-3 rounded-xl border border-line-subtle">
                      <span className="text-ink-muted block text-[11px]">Target Network</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Globe className="h-3.5 w-3.5 text-accent-ink" />
                        <span className="font-semibold text-ink">{resolvedIntent.targetChain}</span>
                      </div>
                    </div>

                    <div className="bg-elevated p-3 rounded-xl border border-line-subtle">
                      <span className="text-ink-muted block text-[11px]">Parsed Amount</span>
                      <span className="font-mono font-semibold text-success mt-1 block">
                        ${resolvedIntent.extractedAmount.toFixed(2)} {resolvedIntent.extractedCurrency}
                      </span>
                      {numericBalance !== null && resolvedIntent.extractedAmount > numericBalance && (
                        <span className="text-[10px] text-danger font-sans font-medium block mt-0.5">
                          Exceeds balance ({balance} NEAR)
                        </span>
                      )}
                    </div>

                    <div className="bg-elevated p-3 rounded-xl border border-line-subtle">
                      <span className="text-ink-muted block text-[11px]">Resolved Payee</span>
                      <span className="font-semibold text-ink truncate mt-1 block">
                        {resolvedIntent.resolvedPayee.displayName}
                      </span>
                      <span className="text-[10px] font-mono text-ink-muted block truncate">
                        {resolvedIntent.resolvedPayee.accountId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-ink-muted">
                      Trust Score: <strong className="text-ink">{resolvedIntent.resolvedPayee.reputationScore}/100</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyResolvedIntent}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-success hover:bg-success/90 text-white text-xs font-semibold transition-all focus-ring"
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
              className="surface-card rounded-3xl p-6 sm:p-8 space-y-6"
            >
              <div className="border-b border-line-subtle pb-4">
                <h3 className="text-base font-semibold text-ink">Transfer Parameters</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Configure destination network, recipient account or cross-chain address, and settlement amount.
                </p>
              </div>

              {/* Destination Blockchain Selector */}
              <div className="space-y-2 pb-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink-secondary block">
                    Destination Blockchain
                  </label>
                  <span className="text-[10px] font-mono text-accent-ink">
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border focus-ring ${
                          isSelected
                            ? "bg-accent text-white font-semibold border-accent shadow-sm"
                            : "bg-inset text-ink-muted border-line-subtle hover:text-ink hover:border-line-strong"
                        }`}
                      >
                        <span className="font-mono text-[10px] mr-1.5 opacity-75">{c.badge}</span>
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient Account Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-ink-secondary block">
                    Recipient Address / Handle ({SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name || "NEAR"})
                  </label>
                  <span className="text-[10px] font-mono text-info bg-info-soft border border-info-border px-2 py-0.5 rounded-full flex items-center gap-1">
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
                    className="input-field px-4 py-3 text-sm font-mono"
                    required
                  />
                  {verifying && (
                    <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 text-xs text-ink-muted">
                      <Loader2 className="h-4 w-4 animate-spin text-accent-ink" />
                      <span>Verifying...</span>
                    </div>
                  )}
                </div>

                {selectedChainId !== "near" && (
                  <div className="p-3 rounded-xl bg-info-soft border border-info-border text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-info font-medium">
                      <span>Cross-Chain Settlement Rail</span>
                      <span>Target: {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name}</span>
                    </div>
                    <p className="text-[11px] text-ink-muted leading-relaxed font-mono">
                      Routing via{" "}
                      <span className="text-ink font-semibold">
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
                        ? "bg-success-soft border-success-border text-success"
                        : verification.status === "WARNING"
                        ? "bg-warning-soft border-warning-border text-warning"
                        : "bg-danger-soft border-danger-border text-danger"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {verification.status === "VERIFIED" ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-ink">
                          {verification.recipient?.displayName ||
                            (verification.status === "VERIFIED"
                              ? "Identity Matched"
                              : "Unregistered Recipient")}
                        </span>
                        {verification.recipient?.paymentId && (
                          <span className="text-[10px] text-ink-muted ml-1.5 font-mono">
                            ({verification.recipient.paymentId})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-elevated border border-line-subtle uppercase text-ink">
                      {verification.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Amount & Asset */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-ink-secondary">
                      Payment Amount
                    </label>
                    {isConnected && (
                      <span className="text-[11px] text-ink-muted">
                        Available:{" "}
                        <strong
                          className={`font-mono ${
                            isInsufficientBalance ? "text-danger font-bold" : "text-accent-ink"
                          }`}
                        >
                          {balance} NEAR
                        </strong>
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
                    className={`input-field px-4 py-3 text-sm font-mono transition-colors ${
                      isInsufficientBalance
                        ? "!border-danger !bg-danger-soft text-danger"
                        : ""
                    }`}
                    required
                  />
                  {isInsufficientBalance && (
                    <div className="flex items-center gap-1.5 text-danger text-xs mt-1 font-medium animate-in fade-in">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Insufficient balance: You have <strong>{balance} NEAR</strong>, but you entered{" "}
                        <strong>{amount} NEAR</strong>.
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-ink-secondary block">
                    Settlement Asset
                  </label>
                  <select
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    className="input-field px-4 py-3 text-sm"
                  >
                    <option value="NEAR">NEAR (Native)</option>
                    <option value="USDC">USDC (NEP-141)</option>
                  </select>
                </div>
              </div>

              {/* Invoice Reference */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-ink-secondary block">
                  Invoice Reference / Memo (Optional)
                </label>
                <input
                  type="text"
                  value={invoiceReference}
                  onChange={(e) => setInvoiceReference(e.target.value)}
                  placeholder="e.g. INV-2026-9042 or Q4 Retainer"
                  className="input-field px-4 py-3 text-sm"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-line-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs">
                  {isInsufficientBalance && (
                    <span className="text-danger font-medium flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Amount exceeds available wallet balance</span>
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!isAmountValid || !recipient}
                  className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs focus-ring"
                >
                  <span>
                    {isInsufficientBalance
                      ? "Insufficient Balance"
                      : "Review & Verify Recipient"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column (5 Cols): Live Confirmation of Payee & Security Inspector (Sticky) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-fit">
            
            {/* Active Treasury Guardrails Summary */}
            <div className="surface-card rounded-3xl p-5 sm:p-6 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-ink-secondary font-semibold">
                  <Lock className="h-3.5 w-3.5 text-accent-ink" />
                  <span>Settlement Guardrails</span>
                </div>
                <span className="text-[10px] font-mono text-success bg-success-soft px-2 py-0.5 rounded-full border border-success-border">
                  Enforced
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-ink-muted text-[11px]">
                <span>Autonomous Policy Cap</span>
                <span className="font-mono font-semibold text-ink">200.00 NEAR ($500)</span>
              </div>

              {/* Progressive Disclosure Toggle */}
              <button
                type="button"
                onClick={() => setShowSecurityDetails(!showSecurityDetails)}
                aria-expanded={showSecurityDetails}
                className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted hover:text-ink transition-colors pt-1 focus-ring rounded"
              >
                <Info className="h-3 w-3 text-ink-muted" />
                <span>{showSecurityDetails ? "Hide technical specifications" : "View technical specifications"}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showSecurityDetails ? "rotate-180" : ""}`} />
              </button>

              {showSecurityDetails && (
                <div className="pt-2 border-t border-line-subtle space-y-2 font-mono text-[10.5px] text-ink-muted animate-in fade-in duration-150">
                  <div className="flex justify-between py-1 border-b border-line-subtle">
                    <span>Consensus Finality</span>
                    <span className="text-success">~1.1s (Nightshade 2.0)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-line-subtle">
                    <span>Custody Architecture</span>
                    <span className="text-ink-secondary">Non-Custodial Wallet Sign</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>MPC Signer Rail</span>
                    <span className="text-info truncate max-w-[150px]">v1.signer-prod.testnet</span>
                  </div>
                </div>
              )}
            </div>

            {/* Live Payee Verification Panel (Confirmation of Payee) */}
            <div className="surface-card rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <h3 className="text-sm font-semibold text-ink">Confirmation of Payee</h3>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                  Live RPC Check
                </span>
              </div>

              {verification ? (
                <div className="space-y-3">
                  <div
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                      verification.status === "VERIFIED"
                        ? "bg-success-soft border-success-border text-success"
                        : verification.status === "WARNING"
                        ? "bg-warning-soft border-warning-border text-warning"
                        : "bg-danger-soft border-danger-border text-danger"
                    }`}
                  >
                    {verification.status === "VERIFIED" ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">
                          {verification.status === "VERIFIED"
                            ? "Identity Matched & Verified"
                            : verification.status === "WARNING"
                            ? "Security Advisory Flag"
                            : "Unregistered or High Risk"}
                        </span>
                        <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-elevated border border-line-subtle text-ink">
                          {verification.status}
                        </span>
                      </div>
                      {verification.reason && (
                        <p className="text-ink-secondary leading-relaxed text-[11px] pt-0.5">{verification.reason}</p>
                      )}
                    </div>
                  </div>

                  {verification.recipient && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowCoPDetails(!showCoPDetails)}
                        aria-expanded={showCoPDetails}
                        className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted hover:text-ink transition-colors focus-ring rounded"
                      >
                        <Info className="h-3 w-3 text-ink-muted" />
                        <span>{showCoPDetails ? "Hide registry metadata" : "View registry metadata"}</span>
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showCoPDetails ? "rotate-180" : ""}`} />
                      </button>

                      {showCoPDetails && (
                        <div className="surface-inset mt-2.5 p-3 rounded-xl space-y-2 text-[11px] font-mono animate-in fade-in duration-150">
                          <div className="flex justify-between text-ink-muted">
                            <span>Registered Entity</span>
                            <span className="text-ink font-sans font-medium">{verification.recipient.displayName}</span>
                          </div>
                          <div className="flex justify-between text-ink-muted">
                            <span>Payment ID</span>
                            <span className="text-accent-ink">{verification.recipient.paymentId}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Enter a recipient account or multi-chain address to automatically screen on-chain existence and homoglyphs.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowCoPDetails(!showCoPDetails)}
                    aria-expanded={showCoPDetails}
                    className="inline-flex items-center gap-1.5 text-[11px] text-accent-ink hover:opacity-80 transition-opacity focus-ring rounded"
                  >
                    <Info className="h-3 w-3" />
                    <span>{showCoPDetails ? "Hide 4 automated checks" : "View 4 automated checks"}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showCoPDetails ? "rotate-180" : ""}`} />
                  </button>

                  {showCoPDetails && (
                    <div className="space-y-1.5 text-[11px] pt-1 animate-in fade-in duration-150">
                      {[
                        "On-chain account existence check (NEAR RPC)",
                        "Corporate entity name & payment ID attestation",
                        "Levenshtein distance typosquatting defense",
                        "Autonomous treasury velocity compliance"
                      ].map((checkItem) => (
                        <div key={checkItem} className="surface-inset flex items-center gap-2 text-ink-secondary p-2 rounded-lg">
                          <Check className="h-3 w-3 text-success shrink-0" />
                          <span>{checkItem}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* STEP 2: Review & Sign */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto surface-card rounded-3xl p-6 sm:p-9 space-y-6">
          <div className="border-b border-line-subtle pb-4">
            <h3 className="text-lg font-bold text-ink">Review Verified Settlement</h3>
            <p className="text-xs text-ink-muted mt-1">
              Confirm recipient identity and payment parameters before signing with your wallet.
            </p>
          </div>

          {verification?.status === "MISMATCH" && (
            <div className="p-4 rounded-2xl bg-danger-soft border border-danger-border flex items-start gap-3 text-danger text-xs">
              <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
              <div>
                <p className="font-bold">CRITICAL WARNING: Account Mismatch Detected</p>
                <p className="mt-1 text-ink-secondary">
                  The recipient NEAR account does not match the registered legal identity for this invoice.
                </p>
              </div>
            </div>
          )}

          {pendingError && (
            <div className="p-4 rounded-2xl bg-danger-soft border border-danger-border flex items-start gap-3 text-danger text-xs">
              <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
              <p className="leading-relaxed">{pendingError}</p>
            </div>
          )}

          {isInsufficientBalance && (
            <div className="p-4 rounded-2xl bg-danger-soft border border-danger-border flex items-start gap-3 text-danger text-xs">
              <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Insufficient Account Balance</p>
                <p className="mt-1 text-ink-secondary">
                  Your connected wallet has <strong className="text-ink">{balance} NEAR</strong>, but this payment requires <strong className="text-danger">{amount} NEAR</strong>. Please go back to reduce the transfer amount or top up your testnet wallet.
                </p>
              </div>
            </div>
          )}

          {resolvedIntent?.policyCheck?.violations?.length > 0 && (
            <div className="p-4 rounded-2xl bg-warning-soft border border-warning-border text-warning text-xs space-y-1.5">
              <p className="font-bold">Treasury policy violations</p>
              {resolvedIntent.policyCheck.violations.map((violation: string) => (
                <p key={violation} className="text-ink-secondary leading-relaxed">
                  • {violation}
                </p>
              ))}
            </div>
          )}

          {resolvedIntent?.velocity && (
            <div className="surface-inset p-4 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-ink-muted">Rolling 24h treasury velocity</span>
              <span className="font-mono font-semibold text-ink">
                ${resolvedIntent.velocity.spentUSD.toFixed(2)} across{" "}
                {resolvedIntent.velocity.paymentCount} payment(s)
              </span>
            </div>
          )}

          <div className="surface-inset rounded-2xl p-5 space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-line-subtle">
              <span className="text-ink-muted">Recipient Account ID</span>
              <span className="font-mono font-bold text-ink text-sm">{recipient}</span>
            </div>

            {verification?.recipient && (
              <div className="flex justify-between items-center py-1.5 border-b border-line-subtle">
                <span className="text-ink-muted">Verified Legal Name</span>
                <span className="font-semibold text-success">{verification.recipient.displayName}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-1.5 border-b border-line-subtle">
              <span className="text-ink-muted">Total Settlement Amount</span>
              <span className="font-mono font-bold text-accent-ink text-base">
                {formatCurrency(amount)} {tokenSymbol}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-line-subtle">
              <span className="text-ink-muted">Settlement Network</span>
              <span className="font-semibold text-ink">
                {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name || "NEAR Protocol"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-line-subtle">
              <span className="text-ink-muted">Execution Rail</span>
              <span className="font-semibold text-info">
                {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.rail || "Native Settlement"}
              </span>
            </div>

            {(isEVMAddress(recipient) || selectedChainId === "ethereum" || selectedChainId === "base" || selectedChainId === "arbitrum") && (
              <div className="flex justify-between items-center py-1.5 border-b border-line-subtle">
                <span className="text-ink-muted">NEAR MPC EVM Signer</span>
                <span className="font-mono text-[11px] text-accent-ink truncate max-w-[260px]">
                  {deriveEVMAddressFromNear(accountId || "company.testnet")}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-1.5">
              <span className="text-ink-muted">Invoice / Memo Reference</span>
              <span className="font-mono text-ink-secondary">{invoiceReference || "Direct Transfer"}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-line-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-ink-muted hover:text-ink order-2 sm:order-1 focus-ring rounded-lg px-2 py-1"
            >
              &larr; Back to Details
            </button>

            {!isConnected ? (
              <button
                type="button"
                onClick={() => connect()}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs order-1 sm:order-2 focus-ring"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect NEAR Wallet to Sign</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isExecuting || paymentBlocked || isInsufficientBalance}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-success hover:bg-success/90 disabled:bg-subtle disabled:text-ink-subtle disabled:border disabled:border-line-subtle disabled:cursor-not-allowed text-white text-xs font-semibold shadow-surface transition-all focus-ring"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Preparing approval &amp; signing...</span>
                    </>
                  ) : paymentBlocked ? (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Blocked by Treasury Policy</span>
                    </>
                  ) : isInsufficientBalance ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span>Insufficient Balance ({balance} NEAR Available)</span>
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
                  disabled={isInsufficientBalance}
                  className="btn-secondary inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-xs focus-ring"
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
        <div className="max-w-2xl mx-auto surface-card rounded-3xl !border-success-border p-6 sm:p-9 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-success-soft text-success border border-success-border mb-1">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink">Payment Confirmed on NEAR</h2>
            <p className="text-xs text-ink-muted">
              The settlement has been finalized on-chain with a verifiable audit receipt.
            </p>
          </div>

          <div className="surface-inset rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-line-subtle">
              <span className="text-ink-muted">Receipt Number</span>
              <span className="font-mono text-success font-bold">
                {receiptData.receipt?.receiptNumber || receiptData.id}
              </span>
            </div>

            {pendingActionId && (
              <div className="flex justify-between items-center pb-2.5 border-b border-line-subtle">
                <span className="text-ink-muted">Approval Reference</span>
                <span className="font-mono text-[11px] text-ink-secondary">{pendingActionId}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-1">
              <span className="text-ink-muted">Amount Paid</span>
              <span className="font-mono font-bold text-ink text-sm">
                {formatCurrency(receiptData.amount)} {tokenSymbol}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-ink-muted">Recipient Account / Address</span>
              <span className="font-mono text-ink-secondary">{receiptData.recipientAddress}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-ink-muted">Destination Network</span>
              <span className="font-semibold text-accent-ink">
                {receiptData.network || (SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name ?? "NEAR Protocol")}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-ink-muted">Settlement Rail</span>
              <span className="font-mono text-info text-xs">
                {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.rail || "NEAR Nightshade Consensus"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-ink-muted">NEAR Settlement Hash</span>
              <a
                href={`${NEAR_CONFIG.explorerUrl}/txns/${receiptData.transactionHash}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-accent-ink hover:underline inline-flex items-center gap-1 focus-ring rounded"
              >
                <span>{receiptData.transactionHash.slice(0, 16)}...</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={downloadPdfReceipt}
              className="btn-secondary w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs focus-ring"
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
                setPendingActionId(null);
                setPendingError(null);
                setResolvedIntent(null);
              }}
              className="btn-primary w-full sm:w-auto flex-1 px-5 py-3 rounded-full text-xs focus-ring"
            >
              Make Another Payment
            </button>
          </div>
        </div>
      )}

      {/* Awaiting Wallet Confirmation In-Flight Modal */}
      {isExecuting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl bg-elevated border border-line p-6 sm:p-8 space-y-6 text-center shadow-popover">
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-accent-soft border border-accent-border flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-accent-ink animate-spin" />
              <Wallet className="h-5 w-5 text-ink absolute" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-ink tracking-tight">
                {selectedChainId === "near"
                  ? "Confirm in Connected Wallet"
                  : `Authorize Multi-Chain Transfer (${SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name || "Cross-Chain"})`}
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed max-w-xs mx-auto">
                {selectedChainId === "near"
                  ? "Please approve the transaction in your connected NEAR wallet popup (MyNearWallet / Meteor) to finalize settlement."
                  : `Please approve the transaction in your connected NEAR wallet popup to lock funds and dispatch cross-chain settlement to ${SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name}.`}
              </p>
            </div>

            <div className="surface-inset p-4 rounded-2xl text-xs space-y-2.5 font-mono text-left">
              <div className="flex justify-between items-center text-ink-muted">
                <span>Beneficiary:</span>
                <span className="text-ink truncate max-w-[200px] font-medium">{recipient}</span>
              </div>
              <div className="flex justify-between items-center text-ink-muted">
                <span>Target Chain:</span>
                <span className="text-accent-ink font-sans font-semibold">
                  {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name || "NEAR Protocol"}
                </span>
              </div>
              <div className="flex justify-between items-center text-ink-muted">
                <span>Settlement Rail:</span>
                <span className="text-info font-sans font-semibold">
                  {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.rail || "NEAR Protocol (Native)"}
                </span>
              </div>
              <div className="flex justify-between items-center text-ink-muted">
                <span>Signer / Solver:</span>
                <span className="text-ink-secondary">
                  {selectedChainId !== "near" ? "v1.signer-prod.testnet" : (accountId || "Connected Wallet")}
                </span>
              </div>
              <div className="flex justify-between items-center text-ink-muted pt-1 border-t border-line-subtle">
                <span>Total Amount:</span>
                <span className="text-success font-bold text-sm">{amount} {tokenSymbol}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsExecuting(false)}
                className="btn-secondary w-full py-2.5 rounded-full text-xs focus-ring"
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
