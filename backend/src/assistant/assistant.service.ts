import { Injectable, Logger } from "@nestjs/common";
import { AiOrchestrator } from "../ai/ai-orchestrator.service";
import { ChatHistoryEntry } from "../ai/ai.types";
import { buildAssistantPrompt } from "../ai/prompts/parse-command.prompt";
import { AssistantReplySchema } from "../ai/schemas";
import { ContextBuilderService } from "../intent/context-builder.service";
import { IntentService, ResolvedIntent } from "../intent/intent.service";
import { PrismaService } from "../prisma/prisma.service";
import { RecipientsService } from "../recipients/recipients.service";
import { TreasuryService } from "../treasury/treasury.service";

export interface AssistantResponse {
  reply: string;
  provider: string;
  intent?: ResolvedIntent;
  verification?: unknown;
  suggestedLink?: string;
}

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly ai: AiOrchestrator,
    private readonly intents: IntentService,
    private readonly contextBuilder: ContextBuilderService,
    private readonly recipients: RecipientsService,
    private readonly treasury: TreasuryService,
    private readonly prisma: PrismaService
  ) {}

  private get aiProviderLabel(): string {
    return this.ai.providerName !== "none" ? this.ai.providerName : "PaySure Intent Engine";
  }

  async chat(
    message: string,
    accountId?: string,
    history: ChatHistoryEntry[] = []
  ): Promise<AssistantResponse> {
    const senderAccount = accountId || "company.near";
    const result = await this.intents.resolve(message, senderAccount, accountId);

    if (result.resolved) {
      return {
        reply: this.formatPaymentReply(result.resolved),
        provider: this.aiProviderLabel,
        intent: result.resolved,
      };
    }

    const command = result.command;
    if (command) {
      switch (command.action) {
        case "verify_payee": {
          const verification = await this.recipients.verify(
            command.accountId,
            command.expectedName
          );
          return {
            reply: this.formatVerificationReply(verification),
            provider: "PaySure Confirmation of Payee",
            verification,
          };
        }
        case "invoice_status": {
          return this.invoiceStatusReply(command.status);
        }
        case "treasury_check": {
          const evaluation = this.treasury.evaluatePayment(
            command.amountUSD ?? 0,
            command.category ?? "Operations & Freelance",
            85,
            "VERIFIED"
          );
          return {
            reply:
              `Treasury policy check for $${(command.amountUSD ?? 0).toFixed(2)}:\n` +
              `• Risk tier: ${evaluation.riskTier}\n` +
              `• Auto-executable: ${evaluation.autoExecutable ? "yes" : "no"}\n` +
              `• Human signoff: ${evaluation.requiresHumanSignoff ? "required" : "not required"}\n` +
              (evaluation.violations.length > 0
                ? `• Violations: ${evaluation.violations.join("; ")}`
                : "• No policy violations."),
            provider: "PaySure Treasury Policy Engine",
          };
        }
        case "navigate": {
          const links: Record<string, string> = {
            pay: "/pay",
            invoices: "/invoices",
            recipients: "/recipients",
            treasury: "/treasury",
            dashboard: "/dashboard",
            history: "/history",
          };
          return {
            reply: `Opening the ${command.page} page.`,
            provider: "PaySure AI Copilot",
            suggestedLink: links[command.page] ?? "/dashboard",
          };
        }
        case "clarify":
          return {
            reply: command.question,
            provider: "PaySure AI Copilot",
          };
        case "chat":
          return {
            reply: command.reply,
            provider: this.aiProviderLabel,
            suggestedLink: command.suggestedLink,
          };
        default:
          break;
      }
    }

    if (this.ai.hasProvider) {
      try {
        const context = await this.contextBuilder.build(accountId);
        const response = await this.ai.request({
          task: "assistant_chat",
          prompt: buildAssistantPrompt(context, history.slice(-6), message),
          schema: AssistantReplySchema,
          accountId,
          cacheTTL: 60,
        });
        return {
          reply: response.reply,
          provider: this.ai.providerName,
        };
      } catch (error) {
        this.logger.warn(
          `AI assistant chat failed, using deterministic fallback: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    return this.deterministicChat(message);
  }

  private formatPaymentReply(intent: ResolvedIntent): string {
    const policyMessage = intent.policyCheck.autoExecutable
      ? intent.policyCheck.violations.length > 0
        ? `⚠ ${intent.policyCheck.violations.join(", ")}`
        : "✓ Autonomous Treasury Approval: payment is within policy and verified payee limits."
      : `⚠ Security Policy Alert: ${
          intent.policyCheck.violations.join(", ") || "Human signoff required"
        }`;

    return (
      `**NEAR Payment Intent Resolved**:\n\n` +
      `• **Target Chain**: ${intent.targetChain} (${intent.settlementExecution.settlementRail})\n` +
      `• **Amount**: ${intent.extractedAmount} ${intent.extractedCurrency} (~$${intent.extractedAmountUSD} USD)\n` +
      `• **Payee**: ${intent.resolvedPayee.displayName} (\`${intent.resolvedPayee.targetChainAddress}\`)\n` +
      `• **Confirmation of Payee**: ${intent.resolvedPayee.verificationStatus} (Trust Score: ${intent.resolvedPayee.reputationScore}/100)\n` +
      `• **Treasury Guardrail**: ${policyMessage}\n\n` +
      `Review and confirm on the **[Send Payment page](/pay)**.`
    );
  }

  private formatVerificationReply(verification: {
    status: string;
    displayName?: string;
    walletAddress?: string;
    reason: string;
  }): string {
    const title =
      verification.status === "VERIFIED"
        ? "✅ Payee verified"
        : verification.status === "MISMATCH"
          ? "🚨 Payee mismatch"
          : "⚠️ Payee requires attention";
    return (
      `${title}\n\n` +
      `• Status: ${verification.status}\n` +
      (verification.displayName ? `• Registered name: ${verification.displayName}\n` : "") +
      (verification.walletAddress ? `• Account: \`${verification.walletAddress}\`\n` : "") +
      `• ${verification.reason}`
    );
  }

  private async invoiceStatusReply(status: string): Promise<AssistantResponse> {
    const invoices = await this.prisma.invoice.findMany({
      where: status !== "ALL" ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (invoices.length === 0) {
      return {
        reply:
          status === "PENDING"
            ? "You currently have 0 pending invoices. Upload an invoice to get started."
            : "No invoices match that status.",
        provider: "PaySure Invoice Ledger",
      };
    }

    const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const lines = invoices
      .slice(0, 5)
      .map((invoice) => `• ${invoice.invoiceNumber} — ${invoice.recipientName} — ${invoice.amount} ${invoice.token} (${invoice.status})`)
      .join("\n");

    return {
      reply: `You have ${invoices.length} ${status === "ALL" ? "" : status.toLowerCase() + " "}invoice(s) totaling ${total.toFixed(2)}.\n\n${lines}`,
      provider: "PaySure Invoice Ledger",
    };
  }

  private async deterministicChat(message: string): Promise<AssistantResponse> {
    const lower = message.toLowerCase();
    const [invoices, recipients] = await Promise.all([
      this.prisma.invoice.findMany({ take: 50 }),
      this.prisma.recipient.findMany({ take: 50 }),
    ]);

    if (lower.includes("pending") || lower.includes("invoice")) {
      const pending = invoices.filter((invoice) => invoice.status === "PENDING");
      const total = pending.reduce((sum, invoice) => sum + invoice.amount, 0);
      return {
        reply:
          pending.length === 0
            ? "You currently have 0 pending invoices. Upload an invoice or create one from the dashboard."
            : `You have ${pending.length} pending invoice(s) totaling ${total.toFixed(2)}. All payments are screened by Confirmation of Payee on NEAR Protocol.`,
        provider: "PaySure deterministic fallback",
      };
    }

    if (lower.includes("status") || lower.includes("unverified") || lower.includes("verification")) {
      return {
        reply:
          "Confirmation of Payee statuses on NEAR:\n• VERIFIED: matched on-chain with the registered payee entity.\n• WARNING: information has recent changes or flags.\n• UNVERIFIED: account has no registered record in PaySure.\n• MISMATCH: invoice account contradicts the known payee account (high risk).",
        provider: "PaySure deterministic fallback",
      };
    }

    if (lower.includes("faucet") || lower.includes("token") || lower.includes("gas")) {
      return {
        reply:
          "To get test tokens for NEAR Testnet:\n1. Create or open a testnet wallet: https://testnet.mynearwallet.com\n2. Free testnet NEAR is automatically allocated to your testnet account.\n3. Check the balance in the PaySure AI navbar.",
        provider: "PaySure deterministic fallback",
      };
    }

    return {
      reply: `PaySure AI Copilot is online with ${recipients.length} registered counterparties and ${invoices.length} invoices in the ledger. Ask about pending invoices, Confirmation of Payee, treasury policy, or a payment intent.`,
      provider: "PaySure deterministic fallback",
    };
  }
}
