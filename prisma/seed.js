const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PaySure AI database for NEAR Protocol...");

  // Clear existing records
  await prisma.receipt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.recipient.deleteMany();

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

  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let txHash = "";
  for (let i = 0; i < 44; i++) {
    txHash += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  await prisma.user.upsert({
    where: { walletAddress: "company.testnet" },
    create: { walletAddress: "company.testnet" },
    update: {},
  });

  await prisma.payment.create({
    data: {
      senderAddress: "company.testnet",
      recipientAddress: r1.walletAddress,
      amount: 50.0,
      tokenAddress: "NEAR",
      transactionHash: txHash,
      invoiceId: inv3.id,
      invoiceReference: inv3.invoiceNumber,
      network: "NEAR Protocol (Testnet)",
      chainId: 0,
      status: "SUCCESS",
      receipt: {
        create: {
          receiptNumber: "RCP-2026-NEAR-5120",
        },
      },
    },
  });

  console.log("✓ Database seeded successfully for NEAR Protocol!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
