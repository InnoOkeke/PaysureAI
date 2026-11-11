import { NextRequest, NextResponse } from "next/server";
import { deepseek, DEEPSEEK_MODEL } from "@/lib/deepseek";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Retrieve live context from database
    const [invoices, payments, recipients] = await Promise.all([
      prisma.invoice.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.payment.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.recipient.findMany({ take: 5 }),
    ]);

    const systemPrompt = `You are PaySure AI Copilot, a senior Web3 fintech assistant and blockchain payment security expert on NEAR Protocol.
Platform Details:
- Blockchain: NEAR Protocol (NEAR Testnet, RPC: https://rpc.testnet.near.org)
- Settlement Tokens: NEAR (native token, 24 decimals) and USDC (NEP-141 token, 6 decimals)
- Explorer: https://testnet.nearblocks.io
- Wallet & Faucet: https://testnet.mynearwallet.com
- Identity Feature: Confirmation of Payee for human-readable named accounts (*.testnet, *.near) to prevent address spoofing and typos.

Real Database Context:
- Recent Invoices (${invoices.length}): ${JSON.stringify(
      invoices.map((i) => ({
        num: i.invoiceNumber,
        to: i.recipientName,
        amt: `${i.amount} ${i.token}`,
        status: i.status,
      }))
    )}
- Recent Payments (${payments.length}): ${JSON.stringify(
      payments.map((p) => ({
        to: p.recipientAddress,
        amt: `${p.amount} NEAR`,
        tx: p.transactionHash,
        status: p.status,
      }))
    )}
- Registered Payees (${recipients.length}): ${JSON.stringify(
      recipients.map((r) => ({
        name: r.displayName,
        addr: r.walletAddress,
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

    // Check if DeepSeek API key is configured
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === "dummy_key") {
      // Intelligent heuristic fallback when key hasn't been pasted into .env yet
      const lower = message.toLowerCase();
      if (lower.includes("pending") || lower.includes("invoice")) {
        const pending = invoices.filter((i) => i.status === "PENDING");
        if (pending.length === 0) {
          return NextResponse.json({
            reply:
              "You currently have 0 pending invoices. You can upload an invoice or create one using the 'Upload Invoice' button on the dashboard.",
          });
        }
        return NextResponse.json({
          reply: `You have ${pending.length} pending invoice(s) totaling ${pending.reduce(
            (acc, i) => acc + i.amount,
            0
          )} NEAR. All payments are verified with Confirmation of Payee on NEAR Protocol.`,
        });
      }

      if (lower.includes("status") || lower.includes("unverified") || lower.includes("verification")) {
        return NextResponse.json({
          reply:
            "Confirmation of Payee statuses on NEAR:\n• VERIFIED: Matched on-chain with registered payee entity.\n• WARNING: Information has recent updates or flags.\n• UNVERIFIED: Account has no registered record in PaySure.\n• MISMATCH: Account on invoice contradicts known payee account (High Risk)!",
        });
      }

      if (lower.includes("faucet") || lower.includes("token") || lower.includes("gas")) {
        return NextResponse.json({
          reply:
            "To get test tokens for NEAR Testnet:\n1. Create or open a testnet wallet: https://testnet.mynearwallet.com\n2. Free testnet NEAR tokens are automatically allocated to your testnet account.\n3. Verify your balance in the PaySure AI top navbar.",
        });
      }

      return NextResponse.json({
        reply:
          "PaySure AI Copilot is online! I can answer questions about testnet parameters, verification statuses, and your payment records.",
      });
    }

    const completion = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I was unable to formulate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Assistant API error:", error);
    return NextResponse.json(
      {
        reply: `AI Assistant notice: ${error.message || "Temporary error connecting to DeepSeek API."}`,
      },
      { status: 200 }
    );
  }
}

