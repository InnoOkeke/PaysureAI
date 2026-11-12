import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateInvoiceInput {
  invoiceNumber: string;
  recipientName: string;
  recipientAddress: string;
  amount: number;
  token?: string;
  dueDate?: string;
  description?: string;
  extractedJson?: unknown;
}

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  list(status?: string) {
    return this.prisma.invoice.findMany({
      where: status && status !== "ALL" ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { recipient: true },
    });
  }

  async create(input: CreateInvoiceInput) {
    const address = input.recipientAddress.toLowerCase();

    let recipient = await this.prisma.recipient.findFirst({
      where: { walletAddress: address },
    });

    if (!recipient) {
      recipient = await this.prisma.recipient.create({
        data: {
          displayName: input.recipientName,
          walletAddress: address,
          paymentId: "pay-" + address.slice(0, 6),
          verificationStatus: "UNVERIFIED",
        },
      });
    }

    return this.prisma.invoice.create({
      data: {
        invoiceNumber: input.invoiceNumber,
        recipientId: recipient.id,
        recipientName: input.recipientName,
        recipientAddress: address,
        amount: input.amount,
        token: input.token ?? "NEAR",
        dueDate: input.dueDate,
        description: input.description,
        status: "PENDING",
        extractedJson: input.extractedJson ? JSON.stringify(input.extractedJson) : null,
      },
    });
  }
}
