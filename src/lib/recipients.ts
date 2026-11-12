import { prisma } from "@/lib/prisma";

export interface CounterpartyRecord {
  id: string;
  displayName: string;
  paymentId: string;
  walletAddress: string;
  evmAddress?: string;
  verificationStatus: "VERIFIED" | "WARNING" | "UNVERIFIED" | "MISMATCH";
  notes?: string;
  createdAt: string;
}

// Global in-memory & file-compatible store for server lifetime
declare global {
  var __paysure_recipients: CounterpartyRecord[] | undefined;
}

const DEFAULT_RECIPIENTS: CounterpartyRecord[] = [
  {
    id: "rec-acme-1",
    displayName: "Acme Web3 Design Studio",
    paymentId: "acme-design",
    walletAddress: "acme-design.testnet",
    evmAddress: "0x456569838f1d43009A91ebA4263147Afd7233483",
    verificationStatus: "VERIFIED",
    notes: "Official NEAR Ecosystem Design Partner. Verified corporate treasury.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-satoshi-2",
    displayName: "Satoshi Freelance Engineering",
    paymentId: "satoshi-dev",
    walletAddress: "satoshi-dev.testnet",
    evmAddress: "0x1234567890123456789012345678901234567890",
    verificationStatus: "VERIFIED",
    notes: "Smart Contract auditor & Rust / NEAR systems specialist.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-apex-3",
    displayName: "Apex Media Agency",
    paymentId: "apex-media",
    walletAddress: "apex-media.testnet",
    evmAddress: "0x9999999999999999999999999999999999999999",
    verificationStatus: "WARNING",
    notes: "Recent key rotation reported by payee. Exercise caution.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-leprof-4",
    displayName: "LeProf Consulting",
    paymentId: "leprof",
    walletAddress: "leprof.testnet",
    evmAddress: "0x71C8360f3a8b417c805F99D4133A89f07447d251",
    verificationStatus: "VERIFIED",
    notes: "Attested corporate counterparty on NEAR Testnet and Ethereum/Base.",
    createdAt: new Date().toISOString(),
  },
];

function getStore(): CounterpartyRecord[] {
  if (!globalThis.__paysure_recipients) {
    globalThis.__paysure_recipients = [...DEFAULT_RECIPIENTS];
  }
  return globalThis.__paysure_recipients;
}

export async function listAllRecipients(): Promise<CounterpartyRecord[]> {
  const store = getStore();

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
    try {
      const dbRecipients = await prisma.recipient.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (dbRecipients && dbRecipients.length > 0) {
        // Merge DB with store
        const merged: CounterpartyRecord[] = dbRecipients.map((r: any) => ({
          id: r.id,
          displayName: r.displayName,
          paymentId: r.paymentId,
          walletAddress: r.walletAddress,
          verificationStatus: r.verificationStatus as any,
          notes: r.notes || "",
          createdAt: r.createdAt.toISOString(),
        }));

        // Add any store records not in DB
        for (const item of store) {
          if (!merged.some((m) => m.walletAddress.toLowerCase() === item.walletAddress.toLowerCase())) {
            merged.push(item);
          }
        }
        return merged;
      }
    } catch (e) {
      // Prisma failed, fallback to store
    }
  }

  return store;
}

export async function addCounterparty(data: {
  displayName: string;
  paymentId: string;
  walletAddress: string;
  notes?: string;
  verificationStatus?: "VERIFIED" | "WARNING" | "UNVERIFIED" | "MISMATCH";
}): Promise<CounterpartyRecord> {
  const store = getStore();
  const cleanAddr = data.walletAddress.trim().toLowerCase();
  const cleanPaymentId = data.paymentId.trim().toLowerCase();

  const newRecord: CounterpartyRecord = {
    id: `rec-${Date.now()}`,
    displayName: data.displayName.trim(),
    paymentId: cleanPaymentId,
    walletAddress: cleanAddr,
    verificationStatus: data.verificationStatus || "VERIFIED",
    notes: data.notes || "Attested corporate counterparty in PaySure Directory.",
    createdAt: new Date().toISOString(),
  };

  // Upsert in memory store
  const existingIndex = store.findIndex(
    (r) => r.walletAddress.toLowerCase() === cleanAddr || r.paymentId.toLowerCase() === cleanPaymentId
  );
  if (existingIndex >= 0) {
    store[existingIndex] = { ...store[existingIndex], ...newRecord };
  } else {
    store.unshift(newRecord);
  }

  // Also sync to DB if DATABASE_URL is available
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
    try {
      await prisma.recipient.upsert({
        where: { paymentId: cleanPaymentId },
        update: {
          displayName: newRecord.displayName,
          walletAddress: cleanAddr,
          verificationStatus: newRecord.verificationStatus,
          notes: newRecord.notes,
        },
        create: {
          displayName: newRecord.displayName,
          paymentId: cleanPaymentId,
          walletAddress: cleanAddr,
          verificationStatus: newRecord.verificationStatus,
          notes: newRecord.notes,
        },
      });
    } catch (e) {
      console.warn("Could not save to DB, persisted to memory store:", e);
    }
  }

  return newRecord;
}

export async function findCounterparty(cleanAddress: string, paymentId?: string): Promise<CounterpartyRecord | null> {
  const all = await listAllRecipients();
  const normalizedAddr = cleanAddress.trim().toLowerCase();

  // EVM address check
  if (normalizedAddr.startsWith("0x")) {
    let evmMatch = all.find((r) => r.evmAddress && r.evmAddress.toLowerCase() === normalizedAddr);
    if (evmMatch) return evmMatch;
    evmMatch = all.find((r) => r.walletAddress.toLowerCase() === normalizedAddr);
    if (evmMatch) return evmMatch;
  }

  // Exact address match
  let match = all.find((r) => r.walletAddress.toLowerCase() === normalizedAddr);
  if (match) return match;

  // Handle common typo like .tesnet -> .testnet
  if (normalizedAddr.endsWith(".tesnet")) {
    const fixed = normalizedAddr.replace(/\.tesnet$/, ".testnet");
    match = all.find((r) => r.walletAddress.toLowerCase() === fixed);
    if (match) return match;
  }

  // If address has no extension, check if appending .testnet matches
  if (!normalizedAddr.includes(".")) {
    const withTestnet = `${normalizedAddr}.testnet`;
    match = all.find((r) => r.walletAddress.toLowerCase() === withTestnet);
    if (match) return match;
  }

  // PaymentId match
  if (paymentId) {
    const normalizedPid = paymentId.trim().toLowerCase();
    match = all.find((r) => r.paymentId.toLowerCase() === normalizedPid);
    if (match) return match;
  }

  return null;
}
