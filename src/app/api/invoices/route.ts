import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { recipient: true },
    });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      invoiceNumber,
      recipientName,
      recipientAddress,
      amount,
      token = "NEAR",
      dueDate,
      description,
      extractedJson,
    } = body;

    if (!invoiceNumber || !recipientName || !recipientAddress || !amount) {
      return NextResponse.json(
        { error: "Missing required invoice fields" },
        { status: 400 }
      );
    }

    // Check if recipient is in directory, or create recipient record
    let recipient = await prisma.recipient.findFirst({
      where: { walletAddress: recipientAddress.toLowerCase() },
    });

    if (!recipient) {
      recipient = await prisma.recipient.create({
        data: {
          displayName: recipientName,
          walletAddress: recipientAddress.toLowerCase(),
          paymentId: "pay-" + recipientAddress.slice(2, 8).toLowerCase(),
          verificationStatus: "UNVERIFIED",
        },
      });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        recipientId: recipient.id,
        recipientName,
        recipientAddress: recipientAddress.toLowerCase(),
        amount: parseFloat(amount),
        token,
        dueDate,
        description,
        status: "PENDING",
        extractedJson: extractedJson ? JSON.stringify(extractedJson) : null,
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

