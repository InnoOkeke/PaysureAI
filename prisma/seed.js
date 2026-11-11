const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PaySure AI database...");

  const r1 = await prisma.recipient.upsert({
    where: { paymentId: "acme-design" },
    create: {
      displayName: "Acme Web3 Design Studio",
      paymentId: "acme-design",
      walletAddress: "0x456569838f1d43009A91ebA4263147Afd7233483".toLowerCase(),
      verificationStatus: "VERIFIED",
      notes: "Official Aevum Core Partner & UI design supplier.",
    },
    update: {},
  });

  const r2 = await prisma.recipient.upsert({
    where: { paymentId: "satoshi-dev" },
    create: {
      displayName: "Satoshi Freelance Engineering",
      paymentId: "satoshi-dev",
      walletAddress: "0x1234567890123456789012345678901234567890".toLowerCase(),
      verificationStatus: "VERIFIED",
      notes: "Smart Contract auditor & systems specialist.",
    },
    update: {},
  });

  const r3 = await prisma.recipient.upsert({
    where: { paymentId: "apex-media" },
    create: {
      displayName: "Apex Media Agency",
      paymentId: "apex-media",
      walletAddress: "0x7777777777777777777777777777777777777777".toLowerCase(),
      verificationStatus: "WARNING",
      notes: "Recent wallet migration reported by payee.",
    },
    update: {},
  });

  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-9042",
      recipientId: r1.id,
      recipientName: r1.displayName,
      recipientAddress: r1.walletAddress,
      amount: 750.0,
      token: "tUSD8",
      dueDate: "2026-11-20",
      description: "UI/UX Brand Design & Frontend Systems",
      status: "PENDING",
    },
  });

  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-8812",
      recipientId: r2.id,
      recipientName: r2.displayName,
      recipientAddress: r2.walletAddress,
      amount: 1250.0,
      token: "tUSD8",
      dueDate: "2026-11-25",
      description: "Aevum Smart Contract Security Audit",
      status: "PENDING",
    },
  });

  const inv3 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-5120",
      recipientId: r1.id,
      recipientName: r1.displayName,
      recipientAddress: r1.walletAddress,
      amount: 500.0,
      token: "tUSD8",
      dueDate: "2026-11-10",
      description: "Design Systems Maintenance & Icons",
      status: "PAID",
    },
  });

  const txHash =
    "0x" +
    Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  await prisma.user.upsert({
    where: { walletAddress: "0x1111111111111111111111111111111111111111".toLowerCase() },
    create: { walletAddress: "0x1111111111111111111111111111111111111111".toLowerCase() },
    update: {},
  });

  await prisma.payment.create({
    data: {
      senderAddress: "0x1111111111111111111111111111111111111111".toLowerCase(),
      recipientAddress: r1.walletAddress,
      amount: 500.0,
      tokenAddress: "0x456569838f1d43009A91ebA4263147Afd7233483".toLowerCase(),
      transactionHash: txHash,
      invoiceId: inv3.id,
      invoiceReference: inv3.invoiceNumber,
      network: "QDay Aevum Testnet",
      chainId: 44005,
      status: "SUCCESS",
      receipt: {
        create: {
          receiptNumber: "RCP-2026-AEVUM-5120",
        },
      },
    },
  });

  console.log("✓ Database seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
