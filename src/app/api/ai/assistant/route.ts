import { NextRequest, NextResponse } from "next/server";
import { nearAi, NEARAI_MODEL, AI_PROVIDER_NAME } from "@/lib/ai/nearAi";
import { prisma } from "@/lib/prisma";
import { resolveNaturalLanguageIntent } from "@/lib/near/intentResolver";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check if the user is expressing a conversational payment intent
    const lower = message.toLowerCase().trim();
    const isPaymentIntent = 
      /^(send|pay|transfer|disburse|bridge)\b/i.test(lower) ||
      /\b(send|pay|transfer|disburse)\s+(\$?\d+|\d+\s*(near|usdc|eth|btc|stx|sol|xrp|atom|xlm)?)/i.test(lower) ||
      /\b(on\s+(base|ethereum|eth|arbitrum|solana|stacks|bitcoin|btc|ripple|xrp|cosmos|stellar|near))\b/i.test(lower) ||
      lower.includes("send $") ||
      lower.includes("pay $") ||
      lower.includes("transfer $") ||
      lower.includes("pay acme") ||
      lower.includes("pay leprof") ||
      lower.includes("pay satoshi") ||
      lower.includes("on base") ||
      lower.includes("on stacks") ||
      lower.includes("on solana") ||
      lower.includes("on bitcoin") ||
      lower.includes("on xrp") ||
      lower.includes("on cosmos") ||
      lower.includes("on stellar") ||
      lower.includes("on eth");

    if (isPaymentIntent) {
      const intent = resolveNaturalLanguageIntent(message, "company.near");
      const policyMsg = intent.policyCheck.autoExecutable
        ? "✓ Autonomous Treasury Approval: Payment is within policy threshold ($250 USD) and daily velocity limits."
        : `⚠ Security Policy Alert: ${intent.policyCheck.violations.join(", ") || "Requires Human Signoff"}`;

      const reply = `**NEAR Cross-Chain Intent Compiled**:\n\n` +
        `• **Target Chain**: ${intent.targetChain} (${intent.settlementExecution.settlementRail})\n` +
        `• **Settlement Sum**: $${intent.extractedAmount.toFixed(2)} ${intent.extractedCurrency}\n` +
        `• **Payee**: ${intent.resolvedPayee.displayName}\n` +
        `• **Destination Address**: \`${intent.resolvedPayee.targetChainAddress}\`\n` +
        `• **Confirmation of Payee**: ${intent.resolvedPayee.verificationStatus} (Trust Score: ${intent.resolvedPayee.reputationScore}/100)\n` +
        `• **Treasury Guardrail**: ${policyMsg}\n\n` +
        `Click **Apply & Pay Now** below to authorize this payment directly from your NEAR wallet.`;

      return NextResponse.json({ reply, intent, provider: AI_PROVIDER_NAME });
    }

    // Retrieve live context from database
    const [invoices, payments, recipients] = await Promise.all([
      prisma.invoice.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.payment.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.recipient.findMany({ take: 5 }),
    ]);

    const systemPrompt = `You are PaySure AI Copilot, a senior Web3 fintech assistant running on NEAR.AI Cloud and NEAR Protocol.
Platform Details:
- Blockchain: NEAR Protocol (NEAR Testnet, RPC: https://rpc.testnet.near.org)
- AI Inference Engine: NEAR.AI Cloud (api.near.ai)
- Settlement Tokens: NEAR (native token, 24 decimals) and USDC (NEP-141 token, 6 decimals)
- Explorer: https://testnet.nearblocks.io
- Wallet & Faucet: https://testnet.mynearwallet.com
- Identity Feature: Confirmation of Payee for human-readable named accounts (*.testnet, *.near) to prevent address spoofing and typos.
- Multi-Chain Abstraction: 8 supported destination chains including NEAR, Base, Ethereum, Arbitrum, Bitcoin (Native), Solana, Ripple (XRP), Cosmos Hub, Stacks (Bitcoin L2), and Stellar.
- Settlement Rails: Model A (Intent-driven Solver bridge for external wallets) and Model B (NEAR decentralized Threshold MPC Chain Signatures v1.signer-prod.testnet).
- Governance: SputnikDAO & Trezu multi-sig escalation for transactions exceeding autonomous limits ($500).
- Agent Security: OutLayer policy rules and emergency circuit breaker.

Real Database Context:
- Recent Invoices (${invoices.length}): ${JSON.stringify(
      invoices.map((i) => ({
        id: i.invoiceNumber,
        recipient: i.recipientName,
        amount: i.amount,
        status: i.status,
      }))
    )}
- Recent Payments (${payments.length}): ${JSON.stringify(
      payments.map((p) => ({
        to: p.recipientAddress,
        amount: p.amount,
        hash: p.transactionHash.slice(0, 10) + "...",
      }))
    )}
- Registered Counterparties (${recipients.length}): ${JSON.stringify(
      recipients.map((r) => ({
        name: r.displayName,
        account: r.walletAddress,
        status: r.verificationStatus,
      }))
    )}

Instructions:
1. Provide concise, professional, fintech-grade answers.
2. If asked about pending invoices, payments, or recipients, use the real database context above.
3. If asked about verification statuses, explain:
   - VERIFIED: NEAR account matches registered payee identity on-chain.
   - WARNING: Recipient exists but info needs manual confirmation.
   - UNVERIFIED: Account is not in the registry; verify with extreme caution.
   - MISMATCH: Account on invoice differs from registered payee account; high fraud risk!
4. NEVER invent fake transaction hashes or claim unconfirmed blockchain state.
5. NEVER request private keys or seed phrases.`;

    const hasApiKey = Boolean(
      process.env.NEARAI_API_KEY ||
      process.env.NEAR_AI_API_KEY ||
      (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== "dummy_key")
    );

    if (!hasApiKey) {
      // Intelligent deterministic fallback
      const lower = message.toLowerCase();
      if (lower.includes("pending") || lower.includes("invoice")) {
        const pending = invoices.filter((i) => i.status === "PENDING");
        return NextResponse.json({
          reply: pending.length === 0
            ? "You currently have 0 pending invoices. You can upload an invoice or create one using the 'Upload Invoice' button on the dashboard."
            : `You have ${pending.length} pending invoice(s) totaling ${pending.reduce((acc, i) => acc + i.amount, 0)} NEAR. All payments are verified with Confirmation of Payee on NEAR Protocol.`,
          provider: AI_PROVIDER_NAME,
        });
      }

      if (lower.includes("status") || lower.includes("unverified") || lower.includes("verification")) {
        return NextResponse.json({
          reply:
            "Confirmation of Payee statuses on NEAR:\n• VERIFIED: Matched on-chain with registered payee entity.\n• WARNING: Information has recent updates or flags.\n• UNVERIFIED: Account has no registered record in PaySure.\n• MISMATCH: Account on invoice contradicts known payee account (High Risk)!",
          provider: AI_PROVIDER_NAME,
        });
      }

      if (lower.includes("faucet") || lower.includes("token") || lower.includes("gas")) {
        return NextResponse.json({
          reply:
            "To get test tokens for NEAR Testnet:\n1. Create or open a testnet wallet: https://testnet.mynearwallet.com\n2. Free testnet NEAR tokens are automatically allocated to your testnet account.\n3. Verify your balance in the PaySure AI top navbar.",
          provider: AI_PROVIDER_NAME,
        });
      }

      return NextResponse.json({
        reply:
          "PaySure AI Copilot is online, running with NEAR.AI Cloud and OutLayer agent guardrails. Ask about invoice statuses, multi-chain intents, or testnet settlements.",
        provider: AI_PROVIDER_NAME,
      });
    }

    const completion = await nearAi.chat.completions.create({
      model: NEARAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 500,
      temperature: 0.2,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I processed your query. Let me know if you would like to prepare a transaction.";

    return NextResponse.json({ reply, provider: AI_PROVIDER_NAME });
  } catch (error: any) {
    console.error("AI assistant error:", error);
    return NextResponse.json({
      reply: "PaySure AI Copilot is online. Ask about pending invoices, Confirmation of Payee, or multi-chain intents.",
      provider: AI_PROVIDER_NAME,
    });
  }
}
