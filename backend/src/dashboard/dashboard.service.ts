import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async get(accountId?: string) {
    const cleanAccountId = accountId?.toLowerCase().trim();

    const [invoices, payments, recipients] = await Promise.all([
      this.prisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { recipient: true },
      }),
      cleanAccountId
        ? this.prisma.payment.findMany({
            where: { senderAddress: cleanAccountId },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { receipt: true, invoice: true },
          })
        : Promise.resolve([]),
      this.prisma.recipient.findMany(),
    ]);

    const pendingInvoices = invoices.filter((invoice) => invoice.status === "PENDING");

    return {
      stats: {
        totalPaymentsCount: payments.length,
        totalVolume: payments.reduce((total, payment) => total + (payment.amount || 0), 0),
        pendingInvoicesCount: pendingInvoices.length,
        pendingVolume: pendingInvoices.reduce((total, invoice) => total + (invoice.amount || 0), 0),
        verifiedRecipientsCount: recipients.filter(
          (recipient) => recipient.verificationStatus === "VERIFIED"
        ).length,
      },
      invoices,
      payments,
      recipientsCount: recipients.length,
      connectedAccount: cleanAccountId ?? null,
    };
  }
}
