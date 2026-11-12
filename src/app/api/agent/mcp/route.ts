import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Model Context Protocol (MCP) Server Definition
 * Allows Claude Desktop, Cursor, and Agent Market swarms to connect to PaySure AI.
 * Spec: https://modelcontextprotocol.io/
 */

export async function GET() {
  return NextResponse.json({
    mcpVersion: "1.0.0",
    serverInfo: {
      name: "paysure-ai-mcp",
      title: "PaySure AI — Autonomous Invoicing & Confirmation of Payee",
      version: "1.0.0",
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
      resources: {},
    },
    tools: [
      {
        name: "verify_near_payee",
        description:
          "Checks whether a recipient NEAR account exists on-chain and verifies identity against the Confirmation of Payee registry.",
        inputSchema: {
          type: "object",
          properties: {
            accountId: {
              type: "string",
              description: "The NEAR account (e.g. acme-design.testnet or satoshi.near)",
            },
          },
          required: ["accountId"],
        },
      },
      {
        name: "evaluate_outlayer_policy",
        description:
          "Performs an OutLayer agent security check ensuring the proposed payment does not exceed velocity caps or violate prompt-injection defenses.",
        inputSchema: {
          type: "object",
          properties: {
            recipientAddress: { type: "string" },
            amountUSD: { type: "number" },
            category: { type: "string" },
          },
          required: ["recipientAddress", "amountUSD"],
        },
      },
      {
        name: "sputnik_dao_proposal",
        description:
          "Constructs a SputnikDAO / Trezu council transfer proposal when a payment exceeds autonomous limits.",
        inputSchema: {
          type: "object",
          properties: {
            receiverId: { type: "string" },
            amountNear: { type: "number" },
            description: { type: "string" },
          },
          required: ["receiverId", "amountNear"],
        },
      },
    ],
  });
}

