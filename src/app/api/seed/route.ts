import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // 1. Seed Recipients with NEAR Named Accounts
    const r1 = await prisma.recipient.upsert({
      where: { paymentId: "acme-design" },
      create: {
        displayName: "Acme Web3 Design Studio",
        paymentId: "acme-design",
        walletAddress: "acme-design.testnet",
        verificationStatus: "VERIFIED",
        notes: "Official NEAR Ecosystem Design Partner.",
      },
      update: {
        walletAddress: "acme-design.testnet",
      },
    });

    const r2 = await prisma.recipient.upsert({
      where: { paymentId: "satoshi-dev" },
      create: {
        displayName: "Satoshi Freelance Engineering",
        paymentId: "satoshi-dev",
        walletAddress: "satoshi-dev.testnet",
        verificationStatus: "VERIFIED",
        notes: "Smart Contract auditor & Rust / NEAR systems specialist.",
      },
      update: {
        walletAddress: "satoshi-dev.testnet",
      },
    });

    const r3 = await prisma.recipient.upsert({
      where: { paymentId: "apex-media" },
      create: {
        displayName: "Apex Media Agency",
        paymentId: "apex-media",
        walletAddress: "apex-media.testnet",
        verificationStatus: "WARNING",
        notes: "Recent key rotation reported by payee. Exercise caution.",
      },
      update: {
        walletAddress: "apex-media.testnet",
      },
    });

    // 2. Seed Invoices
    const inv1 = await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2026-9042",
        recipientId: r1.id,
        recipientName: r1.displayName,
        recipientAddress: r1.walletAddress,
        amount: 75.0,
        token: "NEAR",
        dueDate: "2026-11-20",
        description: "UI/UX Brand Design & Frontend Systems on NEAR",
        status: "PENDING",
      },
    });

    const inv2 = await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2026-8812",
        recipientId: r2.id,
        recipientName: r2.displayName,
        recipientAddress: r2.walletAddress,
        amount: 120.0,
        token: "NEAR",
        dueDate: "2026-11-25",
        description: "NEAR Smart Contract Rust Security Audit",
        status: "PENDING",
      },
    });

    const inv3 = await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2026-5120",
        recipientId: r1.id,
        recipientName: r1.displayName,
        recipientAddress: r1.walletAddress,
        amount: 50.0,
        token: "NEAR",
        dueDate: "2026-11-10",
        description: "NEAR Design Systems Maintenance & Icons",
        status: "PAID",
      },
    });

    // 3. Seed Completed Payment & Receipt
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let txHash = "";
    for (let i = 0; i < 44; i++) {
      txHash += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    await prisma.user.upsert({
      where: { walletAddress: "paysure-treasury.testnet" },
      create: { walletAddress: "paysure-treasury.testnet" },
      update: {},
    });

    const payment = await prisma.payment.create({
      data: {
        senderAddress: "paysure-treasury.testnet",
        recipientAddress: r1.walletAddress,
        amount: 50.0,
        tokenAddress: "native.near",
        transactionHash: txHash,
        invoiceId: inv3.id,
        invoiceReference: inv3.invoiceNumber,
        network: "NEAR Testnet",
        chainId: 0,
        status: "SUCCESS",
        receipt: {
          create: {
            receiptNumber: "RCP-2026-NEAR-5120",
          },
        },
      },
      include: { receipt: true },
    });

    return NextResponse.json({
      success: true,
      message: "Database successfully seeded with realistic NEAR testnet data!",
      data: {
        recipients: [r1, r2, r3],
        invoices: [inv1, inv2, inv3],
        payment,
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
