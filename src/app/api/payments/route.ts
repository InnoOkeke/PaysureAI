import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const txHash = searchParams.get("txHash");

    if (txHash) {
      const payment = await prisma.payment.findUnique({
        where: { transactionHash: txHash },
        include: { receipt: true, invoice: true },
      });
      return NextResponse.json({ payment });
    }

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { receipt: true, invoice: true },
    });

    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      senderAddress,
      recipientAddress,
      amount,
      tokenAddress,
      transactionHash,
      invoiceId,
      invoiceReference,
      network = "NEAR Testnet",
      chainId = 0,
    } = body;

    if (!senderAddress || !recipientAddress || !amount || !transactionHash) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    // Upsert Sender user if not exists
    await prisma.user.upsert({
      where: { walletAddress: senderAddress.toLowerCase() },
      create: { walletAddress: senderAddress.toLowerCase() },
      update: {},
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        senderAddress: senderAddress.toLowerCase(),
        recipientAddress: recipientAddress.toLowerCase(),
        amount: parseFloat(amount),
        tokenAddress: tokenAddress || "0x456569838f1d43009A91ebA4263147Afd7233483",
        transactionHash,
        invoiceId: invoiceId || null,
        invoiceReference: invoiceReference || null,
        network,
        chainId: Number(chainId),
        status: "SUCCESS",
      },
    });

    // Generate unique verifiable receipt
    const receiptNumber =
      "RCP-" + Date.now().toString(36).toUpperCase() + "-" + transactionHash.slice(2, 8).toUpperCase();

    const receipt = await prisma.receipt.create({
      data: {
        paymentId: payment.id,
        receiptNumber,
      },
    });

    // If an invoiceId was provided, update invoice to PAID
    if (invoiceId) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" },
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        ...payment,
        receipt,
      },
    });
  } catch (error: any) {
    console.error("Record payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

