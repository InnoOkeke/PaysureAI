import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TreasuryService } from "../treasury/treasury.service";

const CONTEXT_KEYWORDS = [
  "invoice",
  "invoices",
  "pending",
  "paid",
  "payment",
  "payments",
  "recipient",
  "recipients",
  "payee",
  "treasury",
  "balance",
  "history",
  "verify",
  "verified",
  "limit",
  "policy",
  "velocity",
  "vendor",
  "budget",
];

@Injectable()
export class ContextBuilderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly treasury: TreasuryService
  ) {}

  needsBusinessContext(input: string): boolean {
    const normalized = input.toLowerCase();
    return CONTEXT_KEYWORDS.some((keyword) => normalized.includes(keyword));
  }

  async build(accountId?: string): Promise<string> {
    const [invoices, payments, recipients] = await Promise.all([
      this.prisma.invoice.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { recipient: true } }),
      this.prisma.payment.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        where: accountId ? { senderAddress: accountId.toLowerCase() } : undefined,
      }),
      this.prisma.recipient.findMany({ take: 12 }),
    ]);

    const policy = this.treasury.defaultPolicy;

    return [
      `Treasury policy: single-tx $${policy.maxSingleTxAmountUSD}, daily velocity $${policy.dailyVelocityCapUSD}, auto-approve $${policy.autoApproveVerifiedUnderUSD}, killswitch ${policy.emergencyKillswitchActive ? "ON" : "off"}.`,
      `Recent invoices (${invoices.length}): ${JSON.stringify(
        invoices.map((invoice) => ({
          id: invoice.invoiceNumber,
          recipient: invoice.recipientName,
          address: invoice.recipientAddress,
          amount: invoice.amount,
          token: invoice.token,
          status: invoice.status,
        }))
      )}`,
      `Recent payments (${payments.length}): ${JSON.stringify(
        payments.map((payment) => ({
          to: payment.recipientAddress,
          amount: payment.amount,
          token: payment.tokenAddress,
          hash: payment.transactionHash.slice(0, 12) + "...",
          status: payment.status,
        }))
      )}`,
      `Registered counterparties (${recipients.length}): ${JSON.stringify(
        recipients.map((recipient) => ({
          name: recipient.displayName,
          account: recipient.walletAddress,
          status: recipient.verificationStatus,
        }))
      )}`,
    ].join("\n");
  }
}
