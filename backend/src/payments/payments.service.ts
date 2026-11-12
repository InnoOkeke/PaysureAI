import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface RecordPaymentInput {
  senderAddress: string;
  recipientAddress: string;
  amount: number;
  tokenAddress?: string;
  transactionHash: string;
  invoiceId?: string | null;
  invoiceReference?: string | null;
  network?: string;
  chainId?: number;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getByHash(transactionHash: string) {
    return this.prisma.payment.findUnique({
      where: { transactionHash },
      include: { receipt: true, invoice: true },
    });
  }

  async list(params: { accountId?: string; scope?: string }) {
    const accountId = params.accountId?.toLowerCase().trim();
    let where: Prisma.PaymentWhereInput | undefined;

    if (accountId && params.scope !== "all") {
      where = {
        OR: [{ senderAddress: accountId }, { recipientAddress: accountId }],
      };
    } else if (!accountId && params.scope !== "all") {
      where = { id: "none" };
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { receipt: true, invoice: true },
    });
  }

  async record(input: RecordPaymentInput) {
    const senderAddress = input.senderAddress.toLowerCase();
    const recipientAddress = input.recipientAddress.toLowerCase();

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.user.upsert({
          where: { walletAddress: senderAddress },
          create: { walletAddress: senderAddress },
          update: {},
        });

        const payment = await tx.payment.create({
          data: {
            senderAddress,
            recipientAddress,
            amount: input.amount,
            tokenAddress: input.tokenAddress ?? "native.near",
            transactionHash: input.transactionHash,
            invoiceId: input.invoiceId ?? null,
            invoiceReference: input.invoiceReference ?? null,
            network: input.network ?? "NEAR Testnet",
            chainId: Number(input.chainId ?? 0),
            status: "SUCCESS",
          },
        });

        const receiptNumber =
          "RCP-" +
          Date.now().toString(36).toUpperCase() +
          "-" +
          input.transactionHash.slice(0, 6).toUpperCase();

        const receipt = await tx.receipt.create({
          data: { paymentId: payment.id, receiptNumber },
        });

        if (input.invoiceId) {
          await tx.invoice.update({
            where: { id: input.invoiceId },
            data: { status: "PAID" },
          });
        }

        return { ...payment, receipt };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A payment with this transaction hash already exists");
      }
      throw error;
    }
  }
}
