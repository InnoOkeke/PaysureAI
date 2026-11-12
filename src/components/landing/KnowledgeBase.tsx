"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Terminal, 
  ShieldCheck, 
  FileText, 
  Building2, 
  History, 
  Wallet, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  Code,
  Globe
} from "lucide-react";

interface FeatureGuide {
  id: string;
  category: string;
  title: string;
  headline: string;
  description: string;
  icon: any;
  actionText: string;
  actionHref: string;
  howItWorks: string[];
  setupSteps: { step: string; instruction: string }[];
  interactiveSample: {
    type: "terminal" | "cop" | "invoice" | "policy" | "wallet";
    title: string;
    content: any;
  };
  securityNote: string;
}

const FEATURE_GUIDES: FeatureGuide[] = [
  {
    id: "intent-compiler",
    category: "Payment Intelligence",
    title: "Natural Language Intent Compiler",
    headline: "Translate human settlement commands into cryptographically verified NEAR transactions.",
    description: "Instead of navigating rigid, multi-screen forms, corporate finance teams can specify high-velocity transfers using plain English. The compiler uses deterministic parsing to extract payee address, numeric quantity, and memo metadata, checking every parameter before on-chain authorization.",
    icon: Terminal,
    actionText: "Open Payment Terminal",
    actionHref: "/pay",
    howItWorks: [
      "Natural Language Parsing: Deterministic regex and contextual language models extract the recipient, currency amount, and invoice reference from raw prompts.",
      "Parameter Normalization: Validates NEAR Account IDs (e.g., correcting common typos like .tesnet to .testnet) and normalizes decimal precision for yoctoNEAR.",
      "Pre-flight CoP Trigger: Automatically triggers Confirmation of Payee in the background before displaying the compiled execution draft.",
      "Non-Custodial Wallet Handshake: Handshakes with MyNearWallet for zero-trust cryptographic signature authorization."
    ],
    setupSteps: [
      { step: "01", instruction: "Navigate to the Send Payment terminal (/pay)." },
      { step: "02", instruction: "Type your intent, such as: 'Pay 15 NEAR to acme-design.testnet for Q4 cloud infrastructure'." },
      { step: "03", instruction: "Click 'Compile Intent'. The system auto-populates beneficiary, sum, and purpose." },
      { step: "04", instruction: "Review the real-time Confirmation of Payee verification badge and click 'Authorize on NEAR'." }
    ],
    interactiveSample: {
      type: "terminal",
      title: "Sample Compiled Output",
      content: {
        input: "Disburse 20 NEAR to leprof.testnet for smart contract audit",
        parsedPayee: "leprof.testnet",
        parsedAmount: "20.00 NEAR",
        status: "VERIFIED (LeProf Consulting)",
        gasCost: "< 0.0005 NEAR (~$0.001)"
      }
    },
    securityNote: "Your private keys never touch PaySure servers. The compiler only builds the unsigned transaction payload for non-custodial signing."
  },
  {
    id: "cop-identity",
    category: "Fraud Prevention",
    title: "Confirmation of Payee & KYC Directory",
    headline: "Prevent invoice fraud, homoglyph attacks, and lookalike domain spoofing.",
    description: "Confirmation of Payee (CoP) inspects beneficiary NEAR account IDs on-chain prior to dispatch. It cross-references on-chain state with verified legal entities in the PaySure Counterparty Directory to ensure capital is directed to the true corporate beneficiary.",
    icon: ShieldCheck,
    actionText: "Explore Payee Directory",
    actionHref: "/recipients",
    howItWorks: [
      "Live NEAR RPC Interrogation: Queries https://rpc.testnet.near.org with view_account to verify the account exists on-chain with active balance.",
      "Typo & Homoglyph Screening: Evaluates Levenshtein edit distance to detect lookalike impostor accounts (e.g., satoshl-dev vs satoshi-dev).",
      "Enterprise KYC Attestation: Matches the account ID against registered corporate identities and flags accounts lacking verified entity documentation.",
      "Name-Match Verification: If an invoice specifies a corporate vendor name, CoP validates that the registered entity name matches the invoice."
    ],
    setupSteps: [
      { step: "01", instruction: "Visit the Confirmation of Payee Directory (/recipients)." },
      { step: "02", instruction: "Use the Interactive Payee Verification Engine to test any NEAR account ID in real time." },
      { step: "03", instruction: "To register your organization or verified vendor, click 'Register New Payee'." },
      { step: "04", instruction: "Enter the legal business name, unique payment handle, and NEAR account ID to issue an immediate verified attestation." }
    ],
    interactiveSample: {
      type: "cop",
      title: "CoP Live Verification Engine",
      content: {
        verifiedAccount: "leprof.testnet",
        entity: "LeProf Consulting",
        status: "VERIFIED",
        typoAlert: "Auto-corrected typo 'leprof.tesnet' -> 'leprof.testnet'",
        riskLevel: "0.00% Spoof Risk (KYC Attested)"
      }
    },
    securityNote: "If a recipient displays 'UNVERIFIED: No business KYC attestation filed', exercise caution or verify through out-of-band communication before transferring high values."
  },
  {
    id: "chain-abstraction",
    category: "Cross-Chain Settlement",
    title: "Ethereum & EVM Chain Signatures",
    headline: "Pay any Ethereum (0x) or Base address directly from your NEAR account.",
    description: "Powered by NEAR Protocol's decentralized Multi-Party Computation (MPC) network (v1.signer-prod.testnet), PaySure enables corporate finance teams to settle payments to Ethereum, Base, and Arbitrum 0x addresses. You don't need an Ethereum wallet, private keys on multiple chains, or ETH for gas.",
    icon: Globe,
    actionText: "Send to Ethereum Address",
    actionHref: "/pay",
    howItWorks: [
      "Decentralized Threshold MPC: NEAR validator nodes collectively run an ECDSA threshold signing network that signs transactions directly on Ethereum.",
      "Deterministic EVM Derivation: Every NEAR account deterministically controls an EVM address via deriveEVMAddressFromNear (e.g. company.testnet -> 0x48a1...3b9e).",
      "Gas Relaying & Sponsorship: Gas costs on Ethereum can be settled seamlessly using NEAR, eliminating the need to maintain ETH gas balances across separate wallets.",
      "Multi-Chain Confirmation of Payee: Validates 20-byte EVM addresses, checks EIP-55 checksums, and cross-references multi-chain corporate vendor records."
    ],
    setupSteps: [
      { step: "01", instruction: "Open the Send Payment terminal (/pay)." },
      { step: "02", instruction: "Enter any 42-character 0x Ethereum address (e.g., 0x71C8360f... on Base/Ethereum) or type: 'Transfer $50 to Marketing Vendor on Ethereum'." },
      { step: "03", instruction: "PaySure automatically activates the NEAR Chain Signatures MPC rail and computes your MPC signer address." },
      { step: "04", instruction: "Authorize the signature with your connected NEAR wallet. The MPC network signs and broadcasts the settlement on Ethereum." }
    ],
    interactiveSample: {
      type: "wallet",
      title: "Cross-Chain Settlement Rail",
      content: {
        destinationAddress: "0x71C8360f3a8b417c805F99D4133A89f07447d251",
        targetNetwork: "Ethereum / Base (EVM)",
        settlementRail: "NEAR Chain Signatures (v1.signer-prod.testnet)",
        sourceNearAccount: "treasury.testnet",
        derivedMpcSigner: "0x456569838f1d43009A91ebA4263147Afd7233483",
        status: "MPC Clearance Verified"
      }
    },
    securityNote: "Cross-chain MPC signatures are cryptographically generated by decentralized NEAR validators. No centralized bridge or custodial intermediary is involved."
  },
  {
    id: "smart-invoicing",
    category: "Billing Infrastructure",
    title: "Smart Invoicing & Auto-Reconciliation",
    headline: "Institutional invoice generation with embedded cryptographic payment links.",
    description: "Create, issue, and manage professional enterprise invoices denominated in NEAR or stable assets. Every invoice features an immutable reference ID and a one-click checkout link that pre-configures CoP checks for the sender.",
    icon: FileText,
    actionText: "Manage Invoices",
    actionHref: "/invoices",
    howItWorks: [
      "Cryptographic Invoicing: Generates auditable digital invoices tied directly to your verified NEAR corporate account.",
      "Embedded CoP Verification: Shareable invoice links (/pay?invoiceId=...) automatically load beneficiary parameters and verify the payee on-chain.",
      "Instant Settlement Detection: Once the payer signs on NEAR Testnet, the transaction hash is recorded, updating invoice status from PENDING to PAID in real time.",
      "Accounting Export: Download structured audit receipts and reconciliation files for institutional ERP systems."
    ],
    setupSteps: [
      { step: "01", instruction: "Open Invoices (/invoices) and click 'Create Invoice'." },
      { step: "02", instruction: "Specify client name, recipient address, billing amount, and payment memo." },
      { step: "03", instruction: "Publish the invoice to obtain an instant payment URL." },
      { step: "04", instruction: "Share the link with your client. When they pay, the invoice reconciles automatically on-chain." }
    ],
    interactiveSample: {
      type: "invoice",
      title: "Invoice Lifecycle",
      content: {
        invoiceNumber: "INV-2026-0042",
        recipient: "Acme Web3 Design Studio",
        amount: "50 NEAR",
        status: "AUTO-RECONCILED ON-CHAIN",
        receiptHash: "7b4c...9f2a (NEAR Testnet)"
      }
    },
    securityNote: "Every settled invoice links directly to the NEAR block explorer for permanent, tamper-proof proof of payment."
  },
  {
    id: "treasury-governance",
    category: "Treasury Management",
    title: "Corporate Treasury & Velocity Policies",
    headline: "Institutional spending rules, velocity limits, and multi-sig authorization.",
    description: "Empower decentralized finance operations with granular policy guardrails. Define maximum per-transaction thresholds, daily velocity ceilings, and mandatory multi-stakeholder approval workflows before capital can be released.",
    icon: Building2,
    actionText: "View Treasury Desk",
    actionHref: "/treasury",
    howItWorks: [
      "Balance & Velocity Tracking: Live telemetry monitors total treasury reserves across connected enterprise accounts.",
      "Threshold Enforcement: Transactions exceeding defined policy limits (e.g., > 50 NEAR) automatically mandate secondary approver authorization.",
      "Role-Based Governance: Distinguishes between Operator (initiator) and Approver (treasury officer) keys.",
      "Risk Scoring Engine: Flags out-of-schedule velocity spikes or transfers to novel counterparties."
    ],
    setupSteps: [
      { step: "01", instruction: "Navigate to the Treasury console (/treasury)." },
      { step: "02", instruction: "Review connected reserve balances, spending velocity, and active policy rules." },
      { step: "03", instruction: "Configure per-transaction spending limits and dual-approval requirements." },
      { step: "04", instruction: "Monitor pending queue authorizations and approve flagged disbursements." }
    ],
    interactiveSample: {
      type: "policy",
      title: "Active Policy Guardrails",
      content: {
        singleTransferLimit: "50.00 NEAR (Requires Single Signature)",
        thresholdTier2: "> 50.00 NEAR (Dual-Executive Sign-Off)",
        dailyVelocityCeiling: "250.00 NEAR",
        status: "Active & Enforced On-Chain"
      }
    },
    securityNote: "Velocity ceilings and policy thresholds prevent unauthorized single-operator drain in the event of compromised credentials."
  },
  {
    id: "audit-trail",
    category: "Compliance & Reporting",
    title: "Cryptographic Ledger & Audit Trail",
    headline: "Exportable, immutable proof of transfer for tax, compliance, and audits.",
    description: "Every payment settled through PaySure is logged with its NEAR blockchain block height, transaction hash, CoP verification status, and invoice reference for seamless regulatory auditing.",
    icon: History,
    actionText: "Open Transaction Ledger",
    actionHref: "/history",
    howItWorks: [
      "On-Chain Immutability: Reads final transaction receipts directly from NEAR Testnet RPC.",
      "Dual Identity Tagging: Binds anonymous wallet addresses to human-readable counterparties and verified legal entities.",
      "Audit Certificate Generation: Generates verifiable receipt objects including gas metrics, timestamps, and sender/beneficiary signatures.",
      "ERP Compatibility: Filter and export transaction histories to CSV or JSON formats for downstream accounting."
    ],
    setupSteps: [
      { step: "01", instruction: "Visit the Ledger (/history) or Transactions tab." },
      { step: "02", instruction: "Filter records by date range, counterparty, or verification tier." },
      { step: "03", instruction: "Click any transaction row to inspect the full cryptographic receipt." },
      { step: "04", instruction: "Click the NEAR Explorer link to inspect raw state execution on-chain." }
    ],
    interactiveSample: {
      type: "wallet",
      title: "Verified Audit Record",
      content: {
        hash: "Dq9v...8x1k",
        sender: "my-corporate-treasury.testnet",
        recipient: "leprof.testnet (LeProf Consulting)",
        finalityTime: "1.1 seconds",
        attestation: "CoP Passed · Tier-1 Verified"
      }
    },
    securityNote: "Auditors can independently verify transactions on NEAR Testnet explorer without requiring privileged access to PaySure databases."
  },
  {
    id: "near-testnet-setup",
    category: "Getting Started",
    title: "NEAR Testnet Wallet & Faucet Setup",
    headline: "Get started in 60 seconds with testnet tokens and zero financial risk.",
    description: "PaySure runs natively on NEAR Testnet. You can test complete corporate payment workflows, invoice settlement, and Confirmation of Payee without risking real treasury capital.",
    icon: Wallet,
    actionText: "Open Testnet Wallet",
    actionHref: "https://testnet.mynearwallet.com",
    howItWorks: [
      "MyNearWallet Integration: Connect directly using standard non-custodial browser wallet sessions.",
      "Free Testnet Funding: Testnet accounts can be created and topped up for free in seconds.",
      "Sub-Second Execution: NEAR Testnet mirrors mainnet block production (~1 second finality with ~0.0001 NEAR gas fees)."
    ],
    setupSteps: [
      { step: "01", instruction: "Visit testnet.mynearwallet.com and create a free testnet account (e.g., yourcompany.testnet)." },
      { step: "02", instruction: "Your wallet comes pre-funded with testnet NEAR. If you need more, use the official NEAR faucet." },
      { step: "03", instruction: "Return to PaySure and click 'Connect Wallet' in the top navigation bar." },
      { step: "04", instruction: "Authorize the session to start sending verified payments and issuing invoices." }
    ],
    interactiveSample: {
      type: "wallet",
      title: "Testnet Environment",
      content: {
        network: "NEAR Testnet",
        rpcEndpoint: "https://rpc.testnet.near.org",
        walletPortal: "testnet.mynearwallet.com",
        blockFinality: "~1.1s",
        gasAverage: "0.0002 NEAR"
      }
    },
    securityNote: "Ensure your wallet URL starts with testnet.mynearwallet.com. Never enter private seed phrases on any website."
  }
];

const FAQS = [
  {
    question: "Can I send money to Ethereum (ETH / 0x) addresses?",
    answer: "Yes! PaySure supports full Chain Abstraction powered by NEAR Protocol's decentralized Multi-Party Computation (MPC) Chain Signatures network (v1.signer-prod.testnet). You can paste any standard 42-character Ethereum or Base address (0x...) into the recipient field or type natural language commands like 'Transfer $50 to Marketing Vendor on Ethereum'. The NEAR MPC network signs and settles the transaction on Ethereum without requiring you to hold ETH for gas or manage multiple wallets."
  },
  {
    question: "What is Confirmation of Payee (CoP) and why is it necessary for crypto?",
    answer: "In traditional banking, Confirmation of Payee verifies that the account name matches the account number before a wire is executed. In Web3, blockchain transactions are irreversible: sending funds to a spoofed address or typosquatted account (like leprof.tesnet instead of leprof.testnet) results in permanent capital loss. PaySure's CoP verifies the account on-chain and validates corporate KYC attestations before you sign."
  },
  {
    question: "Why did I see 'Unregistered or High Risk: No business KYC attestation filed'?",
    answer: "This notification occurs when a recipient account exists on NEAR Testnet (confirmed on-chain with balance) but has not yet filed a legal business attestation in PaySure's counterparty directory. To attest a business or counterparty, visit the Recipients directory (/recipients) and click 'Register New Payee' to establish a verified KYC record."
  },
  {
    question: "Does PaySure have custody of my corporate funds?",
    answer: "No. PaySure is 100% non-custodial. We never hold your private keys, seed phrases, or funds. PaySure compiles intents, validates counterparties, and generates transaction payloads that you authorize directly through your connected NEAR wallet (such as MyNearWallet)."
  },
  {
    question: "How does the Natural Language Payment Compiler handle typos?",
    answer: "The compiler automatically checks and normalizes addresses. For instance, if you type 'leprof.tesnet', the system identifies the common testnet suffix typo and queries NEAR RPC to confirm the canonical address 'leprof.testnet'. It then alerts you with Confirmation of Payee before you approve the payment."
  },
  {
    question: "Can I use PaySure for team disbursements and vendor invoices?",
    answer: "Yes. PaySure was specifically designed for Web3 startups, DAOs, and corporate treasuries that disburse payments to contractors, agencies, and infrastructure providers. You can create invoices, manage a directory of verified vendors, and enforce spending limits."
  }
];

export function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState<string>("intent-compiler");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const selectedGuide = useMemo(() => {
    return FEATURE_GUIDES.find((g) => g.id === activeTab) || FEATURE_GUIDES[0];
  }, [activeTab]);

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return FEATURE_GUIDES;
    const q = searchQuery.toLowerCase();
    return FEATURE_GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.howItWorks.some((h) => h.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;
    const q = searchQuery.toLowerCase();
    return FAQS.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section id="knowledge-base" className="py-24 sm:py-32 bg-[#050507] border-t border-white/[0.06] relative">
      {/* Background Subtle Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-600/[0.03] blur-[120px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-400">
                Institutional Knowledge Base
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
              <span className="text-xs text-zinc-500 font-mono">Documentation & Setup</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-white leading-[1.1]">
              Understand every feature. <br />
              <span className="text-zinc-500">Configure with confidence.</span>
            </h2>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed font-normal">
              A comprehensive technical guide to PaySure's verification primitives, intent compiler, invoicing protocols, and corporate treasury policies.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features, CoP, KYC..."
              className="w-full bg-[#090B10] border border-white/[0.08] focus:border-brand-500/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Feature Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8 border-b border-white/[0.06]">
          {filteredGuides.map((guide) => {
            const Icon = guide.icon;
            const isSelected = selectedGuide.id === guide.id;
            return (
              <button
                key={guide.id}
                onClick={() => setActiveTab(guide.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-white text-black shadow-lg shadow-white/5 font-semibold"
                    : "bg-[#090B10] text-zinc-400 border border-white/[0.06] hover:text-white hover:border-white/[0.15]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-black" : "text-zinc-500"}`} />
                <span>{guide.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Deep Dive Card */}
        <div className="rounded-3xl bg-[#090B10] border border-white/[0.08] p-6 sm:p-10 mb-16 shadow-2xl space-y-10">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 text-[11px] font-mono text-brand-400 uppercase tracking-wider">
                  {selectedGuide.category}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-500 font-mono">NEAR Protocol Testnet</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.02em]">
                {selectedGuide.title}
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                {selectedGuide.headline}
              </p>
            </div>

            <Link
              href={selectedGuide.actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold tracking-tight transition-all shadow-md self-start lg:self-center"
            >
              <span>{selectedGuide.actionText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Grid: How It Works & Setup Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Technical Mechanism */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                  System Architecture
                </span>
                <h4 className="text-lg font-semibold text-white tracking-tight">
                  How it operates under the hood
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                  {selectedGuide.description}
                </p>
              </div>

              <div className="space-y-3">
                {selectedGuide.howItWorks.map((item, idx) => {
                  const [title, desc] = item.split(": ");
                  return (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-semibold text-zinc-200">{title}</span>
                      </div>
                      {desc && (
                        <p className="text-xs text-zinc-400 pl-6 leading-relaxed">
                          {desc}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Security Advisory Pill */}
              <div className="p-4 rounded-xl bg-brand-500/[0.04] border border-brand-500/20 flex items-start gap-3">
                <Lock className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <span className="font-semibold text-brand-300">Security Guarantee: </span>
                  {selectedGuide.securityNote}
                </p>
              </div>
            </div>

            {/* Right Column: Step-by-Step Setup & Interactive Sample */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                  Deployment Checklist
                </span>
                <h4 className="text-lg font-semibold text-white tracking-tight">
                  Step-by-step setup guide
                </h4>
              </div>

              {/* Steps List */}
              <div className="space-y-2.5">
                {selectedGuide.setupSteps.map((stepItem, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="font-mono text-xs font-bold text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded">
                      {stepItem.step}
                    </span>
                    <span className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                      {stepItem.instruction}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interactive Live Sample Box */}
              <div className="mt-4 rounded-2xl bg-[#050507] border border-white/[0.08] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-mono text-zinc-300">{selectedGuide.interactiveSample.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    LIVE PREVIEW
                  </span>
                </div>

                <div className="font-mono text-xs space-y-2 text-zinc-400">
                  {Object.entries(selectedGuide.interactiveSample.content).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-white/[0.02]">
                      <span className="text-zinc-500 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                      <span className="text-zinc-200 font-medium break-all">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Base FAQs / Troubleshooting */}
        <div className="mt-20">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-2">
              Setup & Troubleshooting
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.02em]">
              Frequently asked questions & operational protocols
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Common questions regarding Confirmation of Payee, wallet attestation, and on-chain verification.
            </p>
          </div>

          <div className="space-y-3 max-w-4xl">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#090B10] border border-white/[0.06] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-sm font-medium text-white tracking-tight">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Fast Track CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-brand-900/20 via-[#090B10] to-[#090B10] border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-lg font-semibold text-white tracking-tight">
              Ready to verify a counterparty or send a payment?
            </h4>
            <p className="text-xs text-zinc-400">
              Test on NEAR Testnet with zero risk using verified seed addresses like leprof.testnet or acme-design.testnet.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/recipients"
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold border border-white/[0.08] transition-all"
            >
              Verify Payee
            </Link>
            <Link
              href="/pay"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

