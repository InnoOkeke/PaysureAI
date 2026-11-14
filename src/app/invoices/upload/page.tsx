"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileUp, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  FileText,
  RefreshCw,
  Coins,
  Bot
} from "lucide-react";
import Link from "next/link";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

export default function InvoiceUploadPage() {
  const router = useRouter();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form fields (editable by user)
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSampleSelect = (type: "agency" | "dev" | "mismatch") => {
    let sampleText = "";
    if (type === "agency") {
      sampleText = `INVOICE #INV-2026-9042
Issued To: PaySure AI Client
From: Acme Web3 Design Studio
Recipient Wallet Address: acme-design.testnet
Due Date: 2026-11-20
Description: UI/UX Brand Design & Frontend Systems
Amount Due: 75.00 NEAR`;
    } else if (type === "dev") {
      sampleText = `INVOICE #INV-2026-8812
Issued To: Global Fintech Corp
From: Satoshi Freelance Engineering
Recipient Wallet Address: satoshi-dev.testnet
Due Date: 2026-11-25
Description: NEAR Smart Contract Rust Security Audit
Amount Due: 120.00 NEAR`;
    } else {
      sampleText = `INVOICE #INV-2026-WARN
Issued To: PaySure User
From: Acme Web3 Design Studio
Recipient Wallet Address: spoofed-acme.testnet
Due Date: 2026-11-30
Description: Urgent Rush Security Consultancy
Amount Due: 320.00 NEAR
ATTENTION: Notice account address change!`;
    }

    triggerExtraction(null, sampleText);
  };

  const triggerExtraction = async (fileObj: File | null, rawText?: string) => {
    setExtracting(true);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      if (fileObj) formData.append("file", fileObj);
      if (rawText) formData.append("rawText", rawText);

      const res = await fetch("/api/ai/extract-invoice", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.data) {
        const d = json.data;
        setExtractedData(d);
        setInvoiceNumber(d.invoiceNumber || "");
        setRecipientName(d.recipientName || "");
        setRecipientAddress(d.recipientAddress || "");
        setAmount(d.amount ? d.amount.toString() : "");
        setDueDate(d.dueDate || "");
        setDescription(d.description || "");

        // Immediately run Confirmation of Payee verification
        if (d.recipientAddress) {
          verifyRecipient(d.recipientAddress, d.recipientName);
        }
      }
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setExtracting(false);
    }
  };

  const verifyRecipient = async (addr: string, name: string) => {
    setVerifying(true);
    try {
      const res = await fetch("/api/recipients/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr, name }),
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveInvoice = async (proceedToPay = false) => {
    if (!invoiceNumber || !recipientName || !recipientAddress || !amount) {
      toast.error("Please ensure all mandatory fields are completed.", "Incomplete Fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          recipientName,
          recipientAddress,
          amount: parseFloat(amount),
          dueDate,
          description,
          extractedJson: extractedData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.invoice) {
        toast.success(`Invoice ${data.invoice.invoiceNumber} saved!`);
        if (proceedToPay) {
          router.push(`/pay?invoiceId=${data.invoice.id}`);
        } else {
          router.push("/invoices");
        }
      } else {
        toast.error(data.error || "Failed to save invoice.", "Error");
      }
    } catch (err) {
      console.error("Save invoice error:", err);
      toast.error("Failed to connect to invoice storage server.", "Network Error");
    } finally {
      setSaving(false);
    }
  };

  const handlePayWithCopilotAfterSave = async () => {
    if (!invoiceNumber || !recipientName || !recipientAddress || !amount) {
      toast.error("Please ensure all mandatory fields are completed.", "Incomplete Fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          recipientName,
          recipientAddress,
          amount: parseFloat(amount),
          dueDate,
          description,
          extractedJson: extractedData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.invoice) {
        toast.success("Invoice saved! Handing off to AI Copilot...");
        window.dispatchEvent(
          new CustomEvent("paysure:open-copilot", {
            detail: {
              prompt: `Pay invoice ${invoiceNumber} for ${amount} NEAR to ${recipientName}`,
            },
          })
        );
      } else {
        toast.error(data.error || "Failed to save invoice.", "Error");
      }
    } catch (err) {
      console.error("Save invoice error:", err);
      toast.error("Error saving invoice for Copilot payment.", "Network Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-ink">
              Intelligent AI Pipeline
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-ink-subtle" />
            <span className="text-xs text-ink-muted">Multimodal Document OCR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Upload &amp; Verify Invoice
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Upload any vendor invoice. AI extracts payment details; our on-chain engine verifies the payee.
          </p>
        </div>

        <Link
          href="/invoices"
          className="btn-secondary px-3 py-1.5 rounded-xl text-xs w-fit focus-ring"
        >
          &larr; Back to Invoices
        </Link>
      </div>

      {/* Upload Dropzone */}
      <div className="p-8 rounded-2xl bg-elevated border-2 border-dashed border-line hover:border-accent transition-all text-center relative group">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setFile(f);
              triggerExtraction(f);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="p-4 rounded-2xl bg-accent-soft text-accent-ink group-hover:scale-105 transition-transform mb-3">
            <FileUp className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-ink">
            {file ? file.name : "Drop your invoice document here, or browse"}
          </h3>
          <p className="text-xs text-ink-muted mt-1 max-w-md">
            Supports PDF, PNG, JPG, JPEG. AI extracts payee info with prompt-injection defense.
          </p>

          {/* Preset Demo Invoices */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-line-subtle relative z-10">
            <span className="text-[11px] text-ink-muted font-medium">Or test with live samples:</span>
            <button
              type="button"
              onClick={() => handleSampleSelect("agency")}
              className="btn-secondary text-xs px-2.5 py-1 rounded-lg text-accent-ink focus-ring"
            >
              Acme Design Invoice (75 NEAR)
            </button>
            <button
              type="button"
              onClick={() => handleSampleSelect("dev")}
              className="btn-secondary text-xs px-2.5 py-1 rounded-lg text-accent-ink focus-ring"
            >
              Security Audit Invoice (120 NEAR)
            </button>
            <button
              type="button"
              onClick={() => handleSampleSelect("mismatch")}
              className="text-xs px-2.5 py-1 rounded-lg bg-danger-soft hover:bg-danger/20 text-danger border border-danger-border transition-colors focus-ring"
            >
              Simulate Address Mismatch!
            </button>
          </div>
        </div>
      </div>

      {/* Loading Extraction State */}
      {extracting && (
        <div className="surface-card p-8 rounded-2xl text-center space-y-3 animate-in fade-in">
          <Loader2 className="h-8 w-8 text-accent-ink animate-spin mx-auto" />
          <h4 className="text-base font-bold text-ink">AI Agent is Processing Invoice...</h4>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            Extracting invoice number, wallet address, amount, due date, and evaluating security flags.
          </p>
        </div>
      )}

      {/* Extracted & Editable Confirmation Form */}
      {extractedData && !extracting && (
        <div className="space-y-6">
          {/* Verification Status Alert */}
          {verificationResult && (
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                verificationResult.status === "VERIFIED"
                  ? "bg-success-soft border-success-border text-success"
                  : verificationResult.status === "MISMATCH"
                  ? "bg-danger-soft border-danger-border text-danger"
                  : "bg-warning-soft border-warning-border text-warning"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 bg-elevated border border-line-subtle ${
                    verificationResult.status === "VERIFIED"
                      ? "text-success"
                      : verificationResult.status === "MISMATCH"
                      ? "text-danger"
                      : "text-warning"
                  }`}
                >
                  {verificationResult.status === "VERIFIED" ? (
                    <ShieldCheck className="h-6 w-6" />
                  ) : (
                    <AlertTriangle className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <span>Confirmation of Payee: {verificationResult.status}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-elevated border border-line-subtle text-ink">
                      {verificationResult.status === "VERIFIED" ? "Passed" : "Action Required"}
                    </span>
                  </h4>
                  <p className="text-xs mt-1 text-ink-secondary leading-relaxed">
                    {verificationResult.reason}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => verifyRecipient(recipientAddress, recipientName)}
                className="btn-secondary shrink-0 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 focus-ring"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${verifying ? "animate-spin" : ""}`} />
                <span>Re-verify</span>
              </button>
            </div>
          )}

          {/* Form */}
          <div className="surface-card p-7 rounded-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-line-subtle">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent-ink" />
                <span>Review &amp; Confirm Extracted Details</span>
              </h3>
              <span className="text-xs text-ink-muted">
                Confidence: <strong className="text-success">{extractedData.confidenceScore}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="input-field px-3.5 py-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
                  Recipient Name / Business
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    verifyRecipient(recipientAddress, e.target.value);
                  }}
                  className="input-field px-3.5 py-2.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
                  Recipient NEAR Account ID
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => {
                    setRecipientAddress(e.target.value);
                    verifyRecipient(e.target.value, recipientName);
                  }}
                  placeholder="e.g. acme-design.testnet or satoshi.near"
                  className="input-field px-3.5 py-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
                  Amount in NEAR
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field px-3.5 py-2.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-field px-3.5 py-2.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-ink-secondary block mb-1.5">
                  Description / Service Details
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-line-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setExtractedData(null);
                  setFile(null);
                }}
                className="text-xs text-ink-muted hover:text-ink transition-colors focus-ring rounded-lg px-2 py-1"
              >
                Clear &amp; Upload Another
              </button>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSaveInvoice(false)}
                  disabled={saving}
                  className="btn-secondary flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs focus-ring"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handlePayWithCopilotAfterSave}
                  disabled={saving}
                  className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-accent-ink border-accent-border text-xs focus-ring"
                >
                  <Bot className="h-4 w-4 text-accent-ink" />
                  <span>Pay with AI Copilot</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInvoice(true)}
                  disabled={saving}
                  className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs focus-ring"
                >
                  <span>{saving ? "Saving..." : "Proceed to Payment"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

