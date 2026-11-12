import { prisma } from "@/lib/prisma";

export interface CounterpartyRecord {
  id: string;
  displayName: string;
  paymentId: string;
  walletAddress: string; // Primary NEAR identifier
  evmAddress?: string; // Base / Ethereum / Arbitrum
  bitcoinAddress?: string; // Bitcoin native (SegWit / Taproot)
  solanaAddress?: string; // Solana
  xrpAddress?: string; // Ripple XRP
  cosmosAddress?: string; // Cosmos Hub
  stacksAddress?: string; // Stacks Bitcoin L2
  stellarAddress?: string; // Stellar
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
    bitcoinAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    solanaAddress: "Acme482kXz9vQ7wPzN9bL1m9k6qR8s2vY5t1u4w3x2z1",
    xrpAddress: "rEb8TK3gBgk5auZyyb6BiZN2rk3bU26GLq",
    cosmosAddress: "cosmos1depduwvh4572h7w54cv92z567l523mvhz738q9",
    stacksAddress: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    stellarAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    verificationStatus: "VERIFIED",
    notes: "Official NEAR Ecosystem Design Partner. Multi-chain corporate treasury.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-satoshi-2",
    displayName: "Satoshi Freelance Engineering",
    paymentId: "satoshi-dev",
    walletAddress: "satoshi-dev.testnet",
    evmAddress: "0x1234567890123456789012345678901234567890",
    bitcoinAddress: "bc1q9d784a0c849e89d6e872c3d5236894c2518e91",
    solanaAddress: "Satosh19428571829471928471928471928471928471",
    xrpAddress: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
    cosmosAddress: "cosmos1vl9e25dkls8923mxc78dfhk235689123456789",
    stacksAddress: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    stellarAddress: "GCKFBEIYV2U22IO2GUOWGOQUM76ACQOMZBPZFDB2O7AFB9M72G8K7KNA",
    verificationStatus: "VERIFIED",
    notes: "Smart Contract auditor & Rust / NEAR / Solana / Bitcoin systems specialist.",
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
    bitcoinAddress: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    solanaAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    xrpAddress: "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
    cosmosAddress: "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0e846pc54",
    stacksAddress: "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
    stellarAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
    verificationStatus: "VERIFIED",
    notes: "Attested corporate counterparty across NEAR, Base, Bitcoin, Solana, XRP, Cosmos, Stacks, and Stellar.",
    createdAt: new Date().toISOString(),
  },
];

function getStore(): CounterpartyRecord[] {
  if (!globalThis.__paysure_recipients) {
    globalThis.__paysure_recipients = [...DEFAULT_RECIPIENTS];
  }
  return globalThis.__paysure_recipients;
}

export function detectChainFromAddress(addr: string): {
  chain: string;
  rail: "NEAR Native" | "NEAR Chain Signatures (MPC)" | "NEAR Intent Solver (Model A)";
  currency: string;
} {
  const clean = addr.trim();

  // EVM (Ethereum / Base / Arbitrum)
  if (/^0x[a-fA-F0-9]{40}$/.test(clean)) {
    return {
      chain: "Base / Ethereum (EVM)",
      rail: "NEAR Chain Signatures (MPC)",
      currency: "ETH / USDC",
    };
  }

  // Bitcoin (SegWit, Taproot, Legacy)
  if (/^(bc1|[13]|tb1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(clean)) {
    return {
      chain: "Bitcoin",
      rail: "NEAR Chain Signatures (MPC)",
      currency: "BTC",
    };
  }

  // Solana (Base58, 32-44 characters)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean) && !clean.includes(".")) {
    return {
      chain: "Solana",
      rail: "NEAR Intent Solver (Model A)",
      currency: "SOL / USDC",
    };
  }

  // Ripple / XRP (Starts with r, 25-35 base58 characters)
  if (/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(clean)) {
    return {
      chain: "Ripple (XRP)",
      rail: "NEAR Intent Solver (Model A)",
      currency: "XRP",
    };
  }

  // Cosmos Hub (Starts with cosmos1)
  if (/^cosmos1[a-z0-9]{38,45}$/.test(clean)) {
    return {
      chain: "Cosmos",
      rail: "NEAR Intent Solver (Model A)",
      currency: "ATOM",
    };
  }

  // Stacks Bitcoin L2 (Starts with SP or ST)
  if (/^S[PT][a-zA-Z0-9]{28,42}$/.test(clean)) {
    return {
      chain: "Stacks (Bitcoin L2)",
      rail: "NEAR Intent Solver (Model A)",
      currency: "STX",
    };
  }

  // Stellar (Starts with G, exactly 56 chars)
  if (/^G[A-Z2-7]{55}$/.test(clean)) {
    return {
      chain: "Stellar",
      rail: "NEAR Intent Solver (Model A)",
      currency: "XLM",
    };
  }

  // NEAR Protocol
  return {
    chain: "NEAR Protocol",
    rail: "NEAR Native",
    currency: "NEAR",
  };
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
          evmAddress: r.evmAddress || undefined,
          bitcoinAddress: r.bitcoinAddress || undefined,
          solanaAddress: r.solanaAddress || undefined,
          xrpAddress: r.xrpAddress || undefined,
          cosmosAddress: r.cosmosAddress || undefined,
          stacksAddress: r.stacksAddress || undefined,
          stellarAddress: r.stellarAddress || undefined,
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
  evmAddress?: string;
  bitcoinAddress?: string;
  solanaAddress?: string;
  xrpAddress?: string;
  cosmosAddress?: string;
  stacksAddress?: string;
  stellarAddress?: string;
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
    evmAddress: data.evmAddress ? data.evmAddress.trim() : undefined,
    bitcoinAddress: data.bitcoinAddress ? data.bitcoinAddress.trim() : undefined,
    solanaAddress: data.solanaAddress ? data.solanaAddress.trim() : undefined,
    xrpAddress: data.xrpAddress ? data.xrpAddress.trim() : undefined,
    cosmosAddress: data.cosmosAddress ? data.cosmosAddress.trim() : undefined,
    stacksAddress: data.stacksAddress ? data.stacksAddress.trim() : undefined,
    stellarAddress: data.stellarAddress ? data.stellarAddress.trim() : undefined,
    verificationStatus: data.verificationStatus || "VERIFIED",
    notes: data.notes || "Attested corporate counterparty in PaySure Directory.",
    createdAt: new Date().toISOString(),
  };

  // Upsert in memory store
  const existingIndex = store.findIndex(
    (r) =>
      r.walletAddress.toLowerCase() === cleanAddr ||
      r.paymentId.toLowerCase() === cleanPaymentId ||
      (newRecord.evmAddress && r.evmAddress?.toLowerCase() === newRecord.evmAddress.toLowerCase()) ||
      (newRecord.solanaAddress && r.solanaAddress?.toLowerCase() === newRecord.solanaAddress.toLowerCase())
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
          evmAddress: newRecord.evmAddress,
          bitcoinAddress: newRecord.bitcoinAddress,
          solanaAddress: newRecord.solanaAddress,
          xrpAddress: newRecord.xrpAddress,
          cosmosAddress: newRecord.cosmosAddress,
          stacksAddress: newRecord.stacksAddress,
          stellarAddress: newRecord.stellarAddress,
          verificationStatus: newRecord.verificationStatus,
          notes: newRecord.notes,
        },
        create: {
          displayName: newRecord.displayName,
          paymentId: cleanPaymentId,
          walletAddress: cleanAddr,
          evmAddress: newRecord.evmAddress,
          bitcoinAddress: newRecord.bitcoinAddress,
          solanaAddress: newRecord.solanaAddress,
          xrpAddress: newRecord.xrpAddress,
          cosmosAddress: newRecord.cosmosAddress,
          stacksAddress: newRecord.stacksAddress,
          stellarAddress: newRecord.stellarAddress,
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
  const normalizedAddr = cleanAddress.trim();
  const lowerAddr = normalizedAddr.toLowerCase();

  // 1. Direct NEAR address match
  let match = all.find((r) => r.walletAddress.toLowerCase() === lowerAddr);
  if (match) return match;

  // 2. EVM address match
  if (lowerAddr.startsWith("0x")) {
    match = all.find((r) => r.evmAddress && r.evmAddress.toLowerCase() === lowerAddr);
    if (match) return match;
    match = all.find((r) => r.walletAddress.toLowerCase() === lowerAddr);
    if (match) return match;
  }

  // 3. Bitcoin address match
  match = all.find((r) => r.bitcoinAddress && r.bitcoinAddress.toLowerCase() === lowerAddr);
  if (match) return match;

  // 4. Solana address match (case-sensitive Base58)
  match = all.find((r) => r.solanaAddress && r.solanaAddress === normalizedAddr);
  if (match) return match;

  // 5. Ripple XRP match
  match = all.find((r) => r.xrpAddress && r.xrpAddress === normalizedAddr);
  if (match) return match;

  // 6. Cosmos match
  match = all.find((r) => r.cosmosAddress && r.cosmosAddress.toLowerCase() === lowerAddr);
  if (match) return match;

  // 7. Stacks match
  match = all.find((r) => r.stacksAddress && r.stacksAddress === normalizedAddr);
  if (match) return match;

  // 8. Stellar match
  match = all.find((r) => r.stellarAddress && r.stellarAddress === normalizedAddr);
  if (match) return match;

  // 9. Handle common NEAR typo like .tesnet -> .testnet
  if (lowerAddr.endsWith(".tesnet")) {
    const fixed = lowerAddr.replace(/\.tesnet$/, ".testnet");
    match = all.find((r) => r.walletAddress.toLowerCase() === fixed);
    if (match) return match;
  }

  // 10. If address has no extension, check if appending .testnet matches
  if (!lowerAddr.includes(".") && !lowerAddr.startsWith("0x")) {
    const withTestnet = `${lowerAddr}.testnet`;
    match = all.find((r) => r.walletAddress.toLowerCase() === withTestnet);
    if (match) return match;
  }

  // 11. PaymentId match
  if (paymentId) {
    const normalizedPid = paymentId.trim().toLowerCase();
    match = all.find((r) => r.paymentId.toLowerCase() === normalizedPid);
    if (match) return match;
  }

  // 12. Display name match
  match = all.find((r) => r.displayName.toLowerCase() === lowerAddr);
  if (match) return match;

  return null;
}
