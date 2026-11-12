import { BadRequestException, Injectable } from "@nestjs/common";
import { IntentService } from "../intent/intent.service";
import { OutlayerService } from "../treasury/outlayer.service";
import { SputnikDaoService } from "../treasury/sputnik-dao.service";
import { RecipientsService } from "../recipients/recipients.service";

@Injectable()
export class AgentService {
  constructor(
    private readonly intents: IntentService,
    private readonly recipients: RecipientsService,
    private readonly outlayer: OutlayerService,
    private readonly sputnikDao: SputnikDaoService
  ) {}

  manifest() {
    return {
      name: "PaySure AI — Autonomous Invoicing & Confirmation of Payee Agent",
      slug: "paysure-ai",
      version: "1.1.0",
      protocol: "NEAR Protocol",
      description:
        "Autonomous corporate invoicing, Confirmation of Payee verification, SputnikDAO treasury escalation, and cross-chain intent settlement via NEAR Chain Signatures.",
      author: "PaySure AI Team",
      pricing: {
        model: "FREE_TIER_WITH_GAS",
        settlementToken: "NEAR",
      },
      integrations: {
        nearIntents: true,
        nearAiCloud: true,
        outlayer: true,
        sputnikDao: true,
      },
      tools: [
        {
          name: "verify_payee",
          description:
            "Query live NEAR RPC to verify account existence, counterparty reputation, and typosquatting risk.",
          parameters: {
            accountId: { type: "string", description: "Recipient NEAR account ID" },
            name: { type: "string", description: "Expected legal or invoice name" },
          },
        },
        {
          name: "resolve_intent",
          description:
            "Translate a natural language prompt into a verified multi-chain payment intent.",
          parameters: {
            prompt: { type: "string", description: "e.g. Send $50 to John Kennedy on Base" },
            senderAddress: { type: "string" },
          },
        },
        {
          name: "outlayer_security_check",
          description:
            "Validate an AI agent transaction against OutLayer spending ceilings and prompt-injection defenses.",
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
            "Build a SputnikDAO v2 on-chain proposal for council multi-sig review.",
          parameters: {
            daoContract: { type: "string" },
            description: { type: "string" },
            receiverId: { type: "string" },
            amountNear: { type: "number" },
          },
        },
      ],
    };
  }

  mcpManifest() {
    return {
      mcpVersion: "1.0.0",
      serverInfo: {
        name: "paysure-ai-mcp",
        title: "PaySure AI — Autonomous Invoicing & Confirmation of Payee",
        version: "1.1.0",
      },
      capabilities: { tools: { listChanged: false }, resources: {} },
      tools: [
        {
          name: "verify_near_payee",
          description:
            "Checks whether a recipient NEAR account exists on-chain and verifies identity against the Confirmation of Payee registry.",
          inputSchema: {
            type: "object",
            properties: { accountId: { type: "string" } },
            required: ["accountId"],
          },
        },
        {
          name: "evaluate_outlayer_policy",
          description:
            "Performs an OutLayer agent security check for spending limits and prompt-injection defenses.",
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
            "Constructs a SputnikDAO council transfer proposal when a payment exceeds autonomous limits.",
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
    };
  }

  async callTool(tool: string, params: Record<string, unknown> = {}) {
    switch (tool) {
      case "verify_payee":
      case "verify_near_payee":
        return this.recipients.verify(
          String(params.accountId ?? ""),
          params.name ? String(params.name) : undefined
        );

      case "resolve_intent":
        return this.intents.resolve(
          String(params.prompt ?? ""),
          String(params.senderAddress ?? "company.near")
        );

      case "outlayer_security_check":
      case "evaluate_outlayer_policy":
        return this.outlayer.evaluate({
          senderAddress: String(params.senderAddress ?? "agent.near"),
          recipientAddress: String(params.recipientAddress ?? "vendor.near"),
          amountUSD: Number(params.amountUSD ?? 0),
          token: String(params.token ?? "NEAR"),
          intent: String(params.intent ?? params.category ?? ""),
        });

      case "sputnik_dao_escalate":
      case "sputnik_dao_proposal":
        return this.sputnikDao.buildTransferProposal({
          daoContract: params.daoContract ? String(params.daoContract) : undefined,
          description: String(params.description ?? "Invoice payment"),
          receiverId: String(params.receiverId ?? "vendor.testnet"),
          amountNear: Number(params.amountNear ?? 1),
        });

      default:
        throw new BadRequestException(`Unknown tool: ${tool}`);
    }
  }
}
