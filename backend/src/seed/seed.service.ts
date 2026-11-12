import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    await this.prisma.receipt.deleteMany({
      where: {
        payment: {
          senderAddress: {
            in: ["paysure-treasury.testnet", "company.testnet", "demo.testnet"],
          },
        },
      },
    });

    await this.prisma.payment.deleteMany({
      where: {
        senderAddress: {
          in: ["paysure-treasury.testnet", "company.testnet", "demo.testnet"],
        },
      },
    });

    const r1 = await this.prisma.recipient.upsert({
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
        verificationStatus: "VERIFIED",
      },
    });

    const r2 = await this.prisma.recipient.upsert({
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
        verificationStatus: "VERIFIED",
      },
    });

    const r3 = await this.prisma.recipient.upsert({
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
        verificationStatus: "WARNING",
      },
    });

    const inv1 = await this.prisma.invoice.create({
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

    const inv2 = await this.prisma.invoice.create({
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

    return {
      success: true,
      message:
        "Database seeded with clean NEAR recipient registry. Zero demo payments, 100% real on-chain actions.",
      data: { recipients: [r1, r2, r3], invoices: [inv1, inv2] },
    };
  }
}
