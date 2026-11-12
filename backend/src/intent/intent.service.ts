import { Injectable, Logger } from "@nestjs/common";
import { AiOrchestrator } from "../ai/ai-orchestrator.service";
import { ChatHistoryEntry } from "../ai/ai.types";
import { buildParseCommandPrompt } from "../ai/prompts/parse-command.prompt";
import { ParsedCommand, ParsedCommandSchema, PayCommandSchema } from "../ai/schemas";
import { PrismaService } from "../prisma/prisma.service";
import { NearService, PaymentIntent, VerificationTier } from "../near/near.service";
import { RecipientsService } from "../recipients/recipients.service";
import { PolicyEvaluationResult, TreasuryService } from "../treasury/treasury.service";
import { ContextBuilderService } from "./context-builder.service";
import { parseDeterministic } from "./deterministic-parser";

const COUNTERPARTY_DIRECTORY = [
  {
    displayName: "John Kennedy",
    paymentId: "john-kennedy",
    nearAccountId: "john-kennedy.testnet",
    evmAddress: "0x71C8360f3a8b417c805F99D4133A89f07447d251",
    solanaAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    verificationStatus: "VERIFIED" as VerificationTier,
    isOfficialPartner: true,
    transactionCount: 8,
  },
  {
    displayName: "Acme Web3 Design Studio",
    paymentId: "acme-design",
    nearAccountId: "acme-design.testnet",
    evmAddress: "0x456569838f1d43009A91ebA4263147Afd7233483",
    solanaAddress: "Acme482kXz9vQ7wPzN9bL1m9k6qR8s2vY5t1u4w3x2z1",
    verificationStatus: "VERIFIED" as VerificationTier,
    isOfficialPartner: true,
    transactionCount: 14,
  },
  {
    displayName: "Satoshi Freelance Engineering",
    paymentId: "satoshi-dev",
    nearAccountId: "satoshi-dev.testnet",
    evmAddress: "0x1234567890123456789012345678901234567890",
    solanaAddress: "Satosh19428571829471928471928471928471928471",
    verificationStatus: "VERIFIED" as VerificationTier,
    isOfficialPartner: false,
    transactionCount: 5,
  },
];

export interface ResolvedPayee {
  displayName: string;
  accountId: string;
  paymentId?: string;
  targetChainAddress: string;
  verificationStatus: VerificationTier;
  reputationScore: number;
  warning?: string;
}

export interface ResolvedIntent {
  rawPrompt: string;
  action: "pay";
  extractedAmount: number;
  extractedAmountUSD: number;
  extractedCurrency: string;
  recipientQuery: string;
  targetChain: string;
  memo: string;
  resolvedPayee: ResolvedPayee;
  policyCheck: PolicyEvaluationResult;
  settlementExecution: {
    sourceAccount: string;
    settlementRail: "NEAR Native" | "NEAR Chain Signatures (MPC)" | "NEAR Intent Solver";
    mpcSignerDerivation?: string;
  };
  intent: PaymentIntent;
}

export interface ResolveResult {
  command: ParsedCommand | null;
  resolved: ResolvedIntent | null;
}

@Injectable()
export class IntentService {
  private readonly logger = new Logger(IntentService.name);

  constructor(
    private readonly ai: AiOrchestrator,
    private readonly contextBuilder: ContextBuilderService,
    private readonly prisma: PrismaService,
    private readonly near: NearService,
    private readonly recipients: RecipientsService,
    private readonly treasury: TreasuryService
  ) {}

  async parseCommand(
    input: string,
    accountId?: string,
    history: ChatHistoryEntry[] = []
  ): Promise<ParsedCommand | null> {
    const deterministic = parseDeterministic(input);
    if (deterministic) {
      return deterministic;
    }

    if (!this.ai.hasProvider) {
      return null;
    }

    const context = this.contextBuilder.needsBusinessContext(input)
      ? await this.contextBuilder.build(accountId)
      : "";

    try {
      return await this.ai.request<ParsedCommand>({
        task: "parse_command",
        prompt: buildParseCommandPrompt(context, history.slice(-6), input),
        schema: ParsedCommandSchema,
        accountId,
        cacheTTL: 300,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to parse command with AI: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  async resolve(prompt: string, senderAccount = "company.near", accountId?: string): Promise<ResolveResult> {
    const command = await this.parseCommand(prompt, accountId);
    if (!command || command.action !== "pay") {
      return { command, resolved: null };
    }

    const parsedPay = PayCommandSchema.safeParse(command);
    if (!parsedPay.success) {
      return { command, resolved: null };
    }

    return {
      command,
      resolved: await this.resolvePayment(parsedPay.data, senderAccount, prompt),
    };
  }

  private async resolvePayment(
    command: {
      amount: number;
      currency: string;
      recipientQuery: string;
      targetChain: string;
      memo?: string;
    },
    senderAccount: string,
    rawPrompt: string
  ): Promise<ResolvedIntent> {
    const currency = this.normalizeCurrency(command.currency);
    const amountUSD =
      currency === "NEAR" ? command.amount * this.near.nearUsdRate : command.amount;
    const targetChain = this.normalizeChain(command.targetChain);
    const query = command.recipientQuery.trim();

    const [dbRecipient, directoryMatch] = await Promise.all([
      this.recipients.findByQuery(query),
      Promise.resolve(this.findDirectoryMatch(query)),
    ]);

    const displayName =
      dbRecipient?.displayName ?? directoryMatch?.displayName ?? this.titleCase(query);
    const accountId =
      dbRecipient?.walletAddress ??
      directoryMatch?.nearAccountId ??
      (this.near.isNearNamedAccount(query) ? this.near.normalizeAccountId(query) : this.slug(query));

    let targetChainAddress = accountId;
    let warning: string | undefined;

    if (targetChain === "Base" || targetChain === "Ethereum" || targetChain === "Arbitrum") {
      targetChainAddress = directoryMatch?.evmAddress ?? accountId;
      if (!directoryMatch?.evmAddress) {
        warning = `No ${targetChain} address is registered for '${displayName}'. Add one before settlement.`;
      }
    } else if (targetChain === "Solana") {
      targetChainAddress = directoryMatch?.solanaAddress ?? accountId;
      if (!directoryMatch?.solanaAddress) {
        warning = `No Solana address is registered for '${displayName}'. Add one before settlement.`;
      }
    }

    const verificationStatus =
      (dbRecipient?.verificationStatus as VerificationTier | undefined) ??
      directoryMatch?.verificationStatus ??
      "UNVERIFIED";

    const transactionCount =
      directoryMatch?.transactionCount ??
      (await this.prisma.payment.count({ where: { recipientAddress: accountId } }));

    const reputationScore = this.treasury.calculateReputationScore({
      verificationStatus,
      transactionCount,
      isOfficialPartner: directoryMatch?.isOfficialPartner ?? false,
    });

    const policyCheck = this.treasury.evaluatePayment(
      amountUSD,
      "Operations & Freelance",
      reputationScore,
      verificationStatus,
      this.treasury.defaultPolicy,
      180,
      targetChainAddress,
      senderAccount
    );

    if (warning) {
      policyCheck.warnings.push(warning);
      policyCheck.requiresHumanSignoff = true;
    }

    const settlementRail =
      targetChain === "NEAR Protocol" ? "NEAR Native" : "NEAR Chain Signatures (MPC)";

    const intent = this.near.createPaymentIntent({
      senderNearAccount: senderAccount,
      recipientNearAccount: targetChainAddress,
      paymentIdAlias: dbRecipient?.paymentId ?? directoryMatch?.paymentId,
      amount: String(command.amount),
      tokenSymbol: currency === "NEAR" ? "NEAR" : "USDC",
      invoiceReference: command.memo || `INTENT-${Date.now().toString(36).toUpperCase()}`,
      verificationTier: verificationStatus,
    });

    return {
      rawPrompt,
      action: "pay",
      extractedAmount: command.amount,
      extractedAmountUSD: Number(amountUSD.toFixed(2)),
      extractedCurrency: currency,
      recipientQuery: query,
      targetChain,
      memo: command.memo || `Conversational Settlement: ${rawPrompt}`,
      resolvedPayee: {
        displayName,
        accountId,
        paymentId: dbRecipient?.paymentId ?? directoryMatch?.paymentId,
        targetChainAddress,
        verificationStatus,
        reputationScore,
        warning,
      },
      policyCheck,
      settlementExecution: {
        sourceAccount: senderAccount,
        settlementRail,
        mpcSignerDerivation:
          settlementRail === "NEAR Chain Signatures (MPC)"
            ? this.near.deriveEVMAddressFromNear(senderAccount)
            : undefined,
      },
      intent,
    };
  }

  private findDirectoryMatch(query: string) {
    const clean = query.trim().toLowerCase();
    const tokens = clean.split(/[^a-z0-9]+/).filter(Boolean);
    return COUNTERPARTY_DIRECTORY.find((entry) => {
      const candidate = `${entry.displayName} ${entry.paymentId} ${entry.nearAccountId}`.toLowerCase();
      return (
        entry.nearAccountId.toLowerCase() === clean ||
        entry.paymentId.toLowerCase() === clean ||
        (tokens.length > 0 && tokens.every((token) => candidate.includes(token)))
      );
    });
  }

  private normalizeChain(chain: string): string {
    const lower = chain.toLowerCase();
    if (lower.includes("near")) return "NEAR Protocol";
    if (lower.includes("base")) return "Base";
    if (lower.includes("eth")) return "Ethereum";
    if (lower.includes("arb")) return "Arbitrum";
    if (lower.includes("sol")) return "Solana";
    return "NEAR Protocol";
  }

  private normalizeCurrency(currency: string): "USD" | "NEAR" | "USDC" {
    const upper = currency.toUpperCase();
    if (upper === "NEAR" || upper === "USDC" || upper === "USD") return upper;
    return "USD";
  }

  private slug(value: string): string {
    return (
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + ".testnet"
    );
  }

  private titleCase(value: string): string {
    return value
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}
