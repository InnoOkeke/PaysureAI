import { NextRequest, NextResponse } from "next/server";
import { evaluateOutlayerPolicy } from "@/lib/security/outlayer";
import { buildSputnikTransferProposal } from "@/lib/treasury/sputnikDao";
import { resolveNaturalLanguageIntent } from "@/lib/near/intentResolver";

export const dynamic = "force-dynamic";

/**
 * NEAR Agent Market Integration (market.near.ai)
 * Documentation: https://docs.market.near.ai/
 * 
 * Allows PaySure AI to be listed on NEAR Agent Market so other AI agents,
 * swarms, and Claude Desktop MCP clients can hire PaySure AI to verify counterparties,
 * extract invoices, and execute multi-chain intents safely on NEAR Protocol.
 */

// GET returns the Agent Card / Manifest for market.near.ai
export async function GET() {
  return NextResponse.json({
    name: "PaySure AI — Autonomous Invoicing & Confirmation of Payee Agent",
    slug: "paysure-ai",
    version: "1.0.0",
    protocol: "NEAR Protocol",
    description:
      "Autonomous corporate invoicing, Confirmation of Payee payee verification, SputnikDAO treasury escalation, and cross-chain intent settlement via NEAR Chain Signatures.",
    author: "PaySure AI Team",
    pricing: {
      model: "FREE_TIER_WITH_GAS",
      settlementToken: "NEAR",
    },
    integrations: {
      nearIntents: true,
      hotWallet: true,
      nearAiCloud: true,
      outlayer: true,
      sputnikDao: true,
    },
    tools: [
      {
        name: "verify_payee",
        description:
          "Query live NEAR Protocol RPC (view_account) to verify account existence, counterparty reputation score, and typosquatting risk.",
        parameters: {
          accountId: { type: "string", description: "The recipient NEAR Account ID (e.g. alice.testnet)" },
        },
      },
      {
        name: "resolve_intent",
        description:
          "Translates natural language prompts into verified multi-chain payment intents executed via NEAR Chain Signatures MPC.",
        parameters: {
          prompt: { type: "string", description: "Plain-English intent e.g. 'Send $50 to John Kennedy on Base'" },
        },
      },
      {
        name: "outlayer_security_check",
        description:
          "Validates an AI agent transaction against OutLayer spending ceilings, velocity meters, and prompt-injection firewalls.",
        parameters: {
          senderAddress: { type: "string" },
          recipientAddress: { type: "string" },
          amountUSD: { type: "number" },
          intent: { type: "string" },
        },
      },
      {
        name: "sputnik_dao_escalate",
        description:
          "Builds a SputnikDAO v2 on-chain proposal for corporate council multi-sig vote when payment exceeds autonomous limit.",
        parameters: {
          daoContract: { type: "string" },
          description: { type: "string" },
          receiverId: { type: "string" },
          amountNear: { type: "number" },
        },
      },
    ],
  });
}

// POST executes an agent tool call when hired on market.near.ai
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, params } = body;

    if (!tool) {
      return NextResponse.json({ error: "Missing 'tool' parameter" }, { status: 400 });
    }

    if (tool === "resolve_intent") {
      const intent = resolveNaturalLanguageIntent(params?.prompt || "", params?.senderAddress || "company.near");
      return NextResponse.json({ success: true, tool, result: intent });
    }

    if (tool === "outlayer_security_check") {
      const attestation = evaluateOutlayerPolicy({
        senderAddress: params?.senderAddress || "agent.near",
        recipientAddress: params?.recipientAddress || "vendor.near",
        amountUSD: Number(params?.amountUSD || 0),
        token: params?.token || "NEAR",
        intent: params?.intent || "",
      });
      return NextResponse.json({ success: true, tool, result: attestation });
    }

    if (tool === "sputnik_dao_escalate") {
      const proposal = buildSputnikTransferProposal({
        daoContract: params?.daoContract,
        description: params?.description || "Invoice payment",
        receiverId: params?.receiverId,
        amountNear: params?.amountNear || 1,
      });
      return NextResponse.json({ success: true, tool, result: proposal });
    }

    return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

