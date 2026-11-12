const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PaySure AI database for NEAR Protocol (zero demo payments)...");

  // Clean up any legacy demo payments
  await prisma.receipt.deleteMany({
    where: {
      payment: {
        senderAddress: {
          in: ["paysure-treasury.testnet", "company.testnet", "demo.testnet"],
        },
      },
    },
  });

  await prisma.payment.deleteMany({
    where: {
      senderAddress: {
        in: ["paysure-treasury.testnet", "company.testnet", "demo.testnet"],
      },
    },
  });

  // 1. Seed Verified Recipients with NEAR Named Accounts for Confirmation of Payee
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
      verificationStatus: "VERIFIED",
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
      verificationStatus: "VERIFIED",
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
      verificationStatus: "WARNING",
    },
  });

  // 2. Realistic Outstanding Invoices for Payee Testing
  await prisma.invoice.create({
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

  await prisma.invoice.create({
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

  console.log("✓ Database seeded successfully with real recipients and zero demo payments!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
