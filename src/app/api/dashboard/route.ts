import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId")?.toLowerCase().trim();

    // If an account is specified, filter payments strictly to that connected wallet.
    // If no account is connected, return zero volume/payments so unauthenticated views don't leak global or demo payments.
    const paymentWhere = accountId
      ? { senderAddress: accountId }
      : { id: "none" }; // matches nothing if no account connected

    const [invoices, payments, recipients] = await Promise.all([
      prisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { recipient: true },
      }),
      accountId
        ? prisma.payment.findMany({
            where: paymentWhere,
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { receipt: true, invoice: true },
          })
        : Promise.resolve([]),
      prisma.recipient.findMany(),
    ]);

    const totalPaymentsCount = payments.length;
    const totalVolume = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const pendingInvoices = invoices.filter((i) => i.status === "PENDING");
    const pendingInvoicesCount = pendingInvoices.length;
    const pendingVolume = pendingInvoices.reduce((acc, i) => acc + (i.amount || 0), 0);

    const verifiedRecipientsCount = recipients.filter(
      (r) => r.verificationStatus === "VERIFIED"
    ).length;

    return NextResponse.json({
      stats: {
        totalPaymentsCount,
        totalVolume,
        pendingInvoicesCount,
        pendingVolume,
        verifiedRecipientsCount,
      },
      invoices,
      payments,
      recipientsCount: recipients.length,
      connectedAccount: accountId || null,
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        stats: {
          totalPaymentsCount: 0,
          totalVolume: 0,
          pendingInvoicesCount: 0,
          pendingVolume: 0,
          verifiedRecipientsCount: 0,
        },
        invoices: [],
        payments: [],
      },
      { status: 200 }
    );
  }
}
