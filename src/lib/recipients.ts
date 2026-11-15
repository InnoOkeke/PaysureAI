import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SPUTNIK_DAO,
  getSputnikCouncilMembers,
  buildSputnikRegistryProposal,
} from "@/lib/treasury/sputnikDao";
import {
  normalizeVendorDomain,
  verifyVendorDomainTxt,
  type DomainAttestationResult,
} from "@/lib/security/domainAttestation";

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
  vendorDomain?: string;
  domainVerified?: boolean;
  domainVerifiedAt?: string;
  notes?: string;
  cooldownUntil?: string;
  lastUpdatedBy?: string;
  lastApprovedBy?: string;
  createdAt: string;
}

export interface PayeeChangeValues {
  displayName?: string;
  walletAddress?: string;
  evmAddress?: string;
  bitcoinAddress?: string;
  solanaAddress?: string;
  xrpAddress?: string;
  cosmosAddress?: string;
  stacksAddress?: string;
  stellarAddress?: string;
  vendorDomain?: string;
  domainVerified?: boolean;
  notes?: string;
}

export interface PayeeChangeRequest {
  id: string;
  recipientId: string;
  paymentId: string;
  displayName: string;
  changeType: "NEW_REGISTRATION" | "ADDRESS_UPDATE";
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  requestedBy: string;
  approvedBy?: string;
  reason?: string;
  reviewNote?: string;
  previousValues?: PayeeChangeValues;
  proposedValues: PayeeChangeValues;
  sputnikProposal?: ReturnType<typeof buildSputnikRegistryProposal>;
  createdAt: string;
  resolvedAt?: string;
}

export interface PayeeAuditEntry {
  id: string;
  recipientId: string;
  paymentId: string;
  action:
    | "REGISTERED_PENDING"
    | "CHANGE_PROPOSED"
    | "APPROVED"
    | "REJECTED"
    | "COOLDOWN_TRIGGERED"
    | "DOMAIN_ATTESTED";
  actor: string;
  requestedBy?: string;
  approvedBy?: string;
  summary: string;
  previousValues?: PayeeChangeValues;
  newValues?: PayeeChangeValues;
  timestamp: string;
}

export class DuplicatePayeeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicatePayeeError";
  }
}

export class DualControlViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DualControlViolationError";
  }
}

export class UnauthorizedApproverError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedApproverError";
  }
}

export class ChangeRequestNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChangeRequestNotFoundError";
  }
}

export class TyposquattingRiskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TyposquattingRiskError";
  }
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

// Global in-memory & file-compatible store for server lifetime
declare global {
  var __paysure_recipients: CounterpartyRecord[] | undefined;
  var __paysure_payee_changes: PayeeChangeRequest[] | undefined;
  var __paysure_payee_audit: PayeeAuditEntry[] | undefined;
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

function getChangeStore(): PayeeChangeRequest[] {
  if (!globalThis.__paysure_payee_changes) {
    globalThis.__paysure_payee_changes = [];
  }
  return globalThis.__paysure_payee_changes;
}

function getAuditStore(): PayeeAuditEntry[] {
  if (!globalThis.__paysure_payee_audit) {
    globalThis.__paysure_payee_audit = [
      {
        id: "audit-seed-apex",
        recipientId: "rec-apex-3",
        paymentId: "apex-media",
        action: "COOLDOWN_TRIGGERED",
        actor: "treasury-council.sputnik-dao.testnet",
        requestedBy: "apex-ops.testnet",
        approvedBy: "treasury-council.sputnik-dao.testnet",
        summary: "Key rotation flagged: 24h WARNING cooldown active on EVM settlement endpoint.",
        timestamp: new Date().toISOString(),
      },
    ];
  }
  return globalThis.__paysure_payee_audit;
}

export function getConfiguredApprovers(): string[] {
  const raw = process.env.PAYSURE_REGISTRY_APPROVERS;
  if (!raw || raw.trim() === "") return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function verifySputnikCouncilApprover(accountId: string): Promise<{
  daoContract: string;
  source: "on-chain" | "env" | "unavailable";
  members: string[];
}> {
  const clean = accountId.trim().toLowerCase();
  if (!clean) {
    throw new UnauthorizedApproverError("Approver NEAR account ID is required.");
  }

  const council = await getSputnikCouncilMembers();
  if (council.members.length === 0) {
    throw new UnauthorizedApproverError(
      `Cannot verify SputnikDAO council membership on ${council.daoContract} (${council.error || "unavailable"}). Deploy the DAO or configure PAYSURE_REGISTRY_APPROVERS.`
    );
  }

  if (!council.members.includes(clean)) {
    throw new UnauthorizedApproverError(
      `Account '${clean}' is not a verified council member of ${council.daoContract} (${council.source}). Only SputnikDAO council members can approve registry changes.`
    );
  }

  return {
    daoContract: council.daoContract,
    source: council.source,
    members: council.members,
  };
}

export async function listPendingChanges(): Promise<PayeeChangeRequest[]> {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
    try {
      const rows = await (prisma as any).payeeChangeRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          recipientId: r.recipientId,
          paymentId: r.paymentId,
          displayName: r.displayName,
          changeType: r.changeType,
          status: r.status,
          requestedBy: r.requestedBy,
          approvedBy: r.approvedBy || undefined,
          reason: r.reason || undefined,
          reviewNote: r.reviewNote || undefined,
          previousValues: r.previousValues || undefined,
          proposedValues: r.proposedValues,
          sputnikProposal: r.sputnikProposal || undefined,
          createdAt: r.createdAt.toISOString(),
          resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : undefined,
        }));
      }
    } catch {
      // Fallback to memory store
    }
  }
  return getChangeStore();
}

export async function listPayeeAuditLog(): Promise<PayeeAuditEntry[]> {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
    try {
      const rows = await (prisma as any).payeeAuditLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 100,
      });
      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          recipientId: r.recipientId,
          paymentId: r.paymentId,
          action: r.action,
          actor: r.actor,
          requestedBy: r.requestedBy || undefined,
          approvedBy: r.approvedBy || undefined,
          summary: r.summary,
          previousValues: r.previousValues || undefined,
          newValues: r.newValues || undefined,
          timestamp: r.timestamp.toISOString(),
        }));
      }
    } catch {
      // Fallback to memory store
    }
  }
  return getAuditStore();
}

async function persistChangeRequestToDb(chg: PayeeChangeRequest): Promise<void> {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") return;
  try {
    await (prisma as any).payeeChangeRequest.upsert({
      where: { id: chg.id },
      update: {
        status: chg.status,
        approvedBy: chg.approvedBy,
        reviewNote: chg.reviewNote,
        resolvedAt: chg.resolvedAt ? new Date(chg.resolvedAt) : null,
      },
      create: {
        id: chg.id,
        recipientId: chg.recipientId,
        paymentId: chg.paymentId,
        displayName: chg.displayName,
        changeType: chg.changeType,
        status: chg.status,
        requestedBy: chg.requestedBy,
        approvedBy: chg.approvedBy,
        reason: chg.reason,
        reviewNote: chg.reviewNote,
        previousValues: chg.previousValues as any,
        proposedValues: chg.proposedValues as any,
        sputnikProposal: chg.sputnikProposal as any,
        createdAt: new Date(chg.createdAt),
        resolvedAt: chg.resolvedAt ? new Date(chg.resolvedAt) : null,
      },
    });
  } catch (e) {
    console.warn("Could not persist change request to DB:", e);
  }
}

async function persistAuditEntryToDb(entry: PayeeAuditEntry): Promise<void> {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") return;
  try {
    await (prisma as any).payeeAuditLog.create({
      data: {
        id: entry.id,
        recipientId: entry.recipientId,
        paymentId: entry.paymentId,
        action: entry.action,
        actor: entry.actor,
        requestedBy: entry.requestedBy,
        approvedBy: entry.approvedBy,
        summary: entry.summary,
        previousValues: entry.previousValues as any,
        newValues: entry.newValues as any,
        timestamp: new Date(entry.timestamp),
      },
    });
  } catch (e) {
    console.warn("Could not persist audit log to DB:", e);
  }
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
          vendorDomain: r.vendorDomain || undefined,
          domainVerified: Boolean(r.domainVerified),
          domainVerifiedAt: r.domainVerifiedAt ? r.domainVerifiedAt.toISOString() : undefined,
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

async function syncRecipientToDb(record: CounterpartyRecord): Promise<void> {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") return;
  try {
    await prisma.recipient.upsert({
      where: { paymentId: record.paymentId.toLowerCase() },
      update: {
        displayName: record.displayName,
        walletAddress: record.walletAddress.toLowerCase(),
        evmAddress: record.evmAddress,
        bitcoinAddress: record.bitcoinAddress,
        solanaAddress: record.solanaAddress,
        xrpAddress: record.xrpAddress,
        cosmosAddress: record.cosmosAddress,
        stacksAddress: record.stacksAddress,
        stellarAddress: record.stellarAddress,
        verificationStatus: record.verificationStatus,
        vendorDomain: record.vendorDomain,
        domainVerified: Boolean(record.domainVerified),
        domainVerifiedAt: record.domainVerifiedAt ? new Date(record.domainVerifiedAt) : null,
        notes: record.notes,
      },
      create: {
        displayName: record.displayName,
        paymentId: record.paymentId.toLowerCase(),
        walletAddress: record.walletAddress.toLowerCase(),
        evmAddress: record.evmAddress,
        bitcoinAddress: record.bitcoinAddress,
        solanaAddress: record.solanaAddress,
        xrpAddress: record.xrpAddress,
        cosmosAddress: record.cosmosAddress,
        stacksAddress: record.stacksAddress,
        stellarAddress: record.stellarAddress,
        verificationStatus: record.verificationStatus,
        vendorDomain: record.vendorDomain,
        domainVerified: Boolean(record.domainVerified),
        domainVerifiedAt: record.domainVerifiedAt ? new Date(record.domainVerifiedAt) : null,
        notes: record.notes,
      },
    });
  } catch (e) {
    console.warn("Could not sync recipient to DB:", e);
  }
}

export async function registerPendingCounterparty(
  data: {
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
    vendorDomain?: string;
    notes?: string;
  },
  requestedBy: string
): Promise<{ recipient: CounterpartyRecord; changeRequest: PayeeChangeRequest }> {
  const existing = await listAllRecipients();
  const cleanAddr = data.walletAddress.trim().toLowerCase();
  const cleanPaymentId = data.paymentId.trim().toLowerCase();
  const cleanRequester = requestedBy.trim().toLowerCase();

  const duplicate = existing.find(
    (r) =>
      r.paymentId.toLowerCase() === cleanPaymentId ||
      r.walletAddress.toLowerCase() === cleanAddr
  );
  if (duplicate) {
    throw new DuplicatePayeeError(
      `Payee '${duplicate.displayName}' (${duplicate.paymentId} / ${duplicate.walletAddress}) already exists. Use 'Propose Edit' to request an approved update instead of overwriting.`
    );
  }

  // Typosquatting / lookalike impersonation check against existing VERIFIED payees
  const lookalike = existing.find((r) => {
    if (r.verificationStatus !== "VERIFIED") return false;
    const pidDist = levenshteinDistance(cleanPaymentId, r.paymentId.toLowerCase());
    return pidDist > 0 && pidDist <= 2 && cleanPaymentId.length >= 4;
  });
  if (lookalike) {
    throw new TyposquattingRiskError(
      `Blocked potential lookalike/typosquatting handle '${cleanPaymentId}' — too similar to verified payee '${lookalike.paymentId}' (${lookalike.displayName}).`
    );
  }

  const cleanDomain = data.vendorDomain ? normalizeVendorDomain(data.vendorDomain) || undefined : undefined;
  let domainAttestation: DomainAttestationResult | null = null;
  if (cleanDomain) {
    domainAttestation = await verifyVendorDomainTxt(cleanDomain, cleanAddr);
  }

  const newRecord: CounterpartyRecord = {
    id: `rec-${Date.now()}`,
    displayName: data.displayName.trim(),
    paymentId: cleanPaymentId,
    walletAddress: cleanAddr,
    evmAddress: data.evmAddress?.trim() || undefined,
    bitcoinAddress: data.bitcoinAddress?.trim() || undefined,
    solanaAddress: data.solanaAddress?.trim() || undefined,
    xrpAddress: data.xrpAddress?.trim() || undefined,
    cosmosAddress: data.cosmosAddress?.trim() || undefined,
    stacksAddress: data.stacksAddress?.trim() || undefined,
    stellarAddress: data.stellarAddress?.trim() || undefined,
    verificationStatus: "UNVERIFIED",
    vendorDomain: cleanDomain,
    domainVerified: Boolean(domainAttestation?.verified),
    domainVerifiedAt: domainAttestation?.verified ? domainAttestation.checkedAt : undefined,
    notes: data.notes?.trim() || "Pending dual-control treasury verification.",
    lastUpdatedBy: cleanRequester,
    createdAt: new Date().toISOString(),
  };

  getStore().unshift(newRecord);
  await syncRecipientToDb(newRecord);

  const changeRequest: PayeeChangeRequest = {
    id: `chg-${Date.now()}`,
    recipientId: newRecord.id,
    paymentId: newRecord.paymentId,
    displayName: newRecord.displayName,
    changeType: "NEW_REGISTRATION",
    status: "PENDING_APPROVAL",
    requestedBy: cleanRequester,
    reason: "Initial multi-chain payee registration awaiting second-signer verification.",
    proposedValues: {
      displayName: newRecord.displayName,
      walletAddress: newRecord.walletAddress,
      evmAddress: newRecord.evmAddress,
      bitcoinAddress: newRecord.bitcoinAddress,
      solanaAddress: newRecord.solanaAddress,
      xrpAddress: newRecord.xrpAddress,
      cosmosAddress: newRecord.cosmosAddress,
      stacksAddress: newRecord.stacksAddress,
      stellarAddress: newRecord.stellarAddress,
      vendorDomain: newRecord.vendorDomain,
      domainVerified: newRecord.domainVerified,
      notes: newRecord.notes,
    },
    createdAt: new Date().toISOString(),
  };
  changeRequest.sputnikProposal = buildSputnikRegistryProposal({
    changeId: changeRequest.id,
    paymentId: changeRequest.paymentId,
    displayName: changeRequest.displayName,
    changeType: changeRequest.changeType,
    requestedBy: cleanRequester,
    targetWallet: newRecord.walletAddress,
  });

  getChangeStore().unshift(changeRequest);
  await persistChangeRequestToDb(changeRequest);

  const auditEntry: PayeeAuditEntry = {
    id: `audit-${Date.now()}`,
    recipientId: newRecord.id,
    paymentId: newRecord.paymentId,
    action: "REGISTERED_PENDING",
    actor: cleanRequester,
    requestedBy: cleanRequester,
    summary: `Registered '${newRecord.displayName}' as UNVERIFIED; queued for dual-control approval.`,
    newValues: changeRequest.proposedValues,
    timestamp: new Date().toISOString(),
  };
  getAuditStore().unshift(auditEntry);
  await persistAuditEntryToDb(auditEntry);

  return { recipient: newRecord, changeRequest };
}

export async function proposeCounterpartyUpdate(
  paymentIdOrAddress: string,
  proposedValues: PayeeChangeValues,
  requestedBy: string,
  reason?: string
): Promise<PayeeChangeRequest> {
  const all = await listAllRecipients();
  const key = paymentIdOrAddress.trim().toLowerCase();
  const target = all.find(
    (r) => r.paymentId.toLowerCase() === key || r.walletAddress.toLowerCase() === key || r.id === paymentIdOrAddress
  );

  if (!target) {
    throw new ChangeRequestNotFoundError(`Payee '${paymentIdOrAddress}' not found in registry.`);
  }

  const cleanRequester = requestedBy.trim().toLowerCase();
  const previousValues: PayeeChangeValues = {
    displayName: target.displayName,
    walletAddress: target.walletAddress,
    evmAddress: target.evmAddress,
    bitcoinAddress: target.bitcoinAddress,
    solanaAddress: target.solanaAddress,
    xrpAddress: target.xrpAddress,
    cosmosAddress: target.cosmosAddress,
    stacksAddress: target.stacksAddress,
    stellarAddress: target.stellarAddress,
    notes: target.notes,
  };

  const cleanedProposed: PayeeChangeValues = {
    displayName: proposedValues.displayName?.trim() || target.displayName,
    walletAddress: proposedValues.walletAddress?.trim().toLowerCase() || target.walletAddress,
    evmAddress: proposedValues.evmAddress !== undefined ? (proposedValues.evmAddress.trim() || undefined) : target.evmAddress,
    bitcoinAddress: proposedValues.bitcoinAddress !== undefined ? (proposedValues.bitcoinAddress.trim() || undefined) : target.bitcoinAddress,
    solanaAddress: proposedValues.solanaAddress !== undefined ? (proposedValues.solanaAddress.trim() || undefined) : target.solanaAddress,
    xrpAddress: proposedValues.xrpAddress !== undefined ? (proposedValues.xrpAddress.trim() || undefined) : target.xrpAddress,
    cosmosAddress: proposedValues.cosmosAddress !== undefined ? (proposedValues.cosmosAddress.trim() || undefined) : target.cosmosAddress,
    stacksAddress: proposedValues.stacksAddress !== undefined ? (proposedValues.stacksAddress.trim() || undefined) : target.stacksAddress,
    stellarAddress: proposedValues.stellarAddress !== undefined ? (proposedValues.stellarAddress.trim() || undefined) : target.stellarAddress,
    notes: proposedValues.notes !== undefined ? proposedValues.notes.trim() : target.notes,
  };

  const changeRequest: PayeeChangeRequest = {
    id: `chg-${Date.now()}`,
    recipientId: target.id,
    paymentId: target.paymentId,
    displayName: target.displayName,
    changeType: "ADDRESS_UPDATE",
    status: "PENDING_APPROVAL",
    requestedBy: cleanRequester,
    reason: reason?.trim() || "Counterparty settlement endpoint update proposed.",
    previousValues,
    proposedValues: cleanedProposed,
    createdAt: new Date().toISOString(),
  };
  changeRequest.sputnikProposal = buildSputnikRegistryProposal({
    changeId: changeRequest.id,
    paymentId: changeRequest.paymentId,
    displayName: changeRequest.displayName,
    changeType: changeRequest.changeType,
    requestedBy: cleanRequester,
    targetWallet: cleanedProposed.walletAddress || target.walletAddress,
  });

  getChangeStore().unshift(changeRequest);
  await persistChangeRequestToDb(changeRequest);

  const auditEntry: PayeeAuditEntry = {
    id: `audit-${Date.now()}`,
    recipientId: target.id,
    paymentId: target.paymentId,
    action: "CHANGE_PROPOSED",
    actor: cleanRequester,
    requestedBy: cleanRequester,
    summary: `Proposed update to '${target.displayName}' (${target.paymentId}). Live verified record remains locked until approved.`,
    previousValues,
    newValues: cleanedProposed,
    timestamp: new Date().toISOString(),
  };
  getAuditStore().unshift(auditEntry);
  await persistAuditEntryToDb(auditEntry);

  return changeRequest;
}

export async function reviewPayeeChangeRequest(
  changeId: string,
  decision: "APPROVE" | "REJECT",
  approverAccountId: string,
  reviewNote?: string
): Promise<{ changeRequest: PayeeChangeRequest; recipient?: CounterpartyRecord }> {
  const cleanApprover = approverAccountId.trim().toLowerCase();
  await verifySputnikCouncilApprover(cleanApprover);

  const changes = getChangeStore();
  let req = changes.find((c) => c.id === changeId);
  if (!req) {
    const dbChanges = await listPendingChanges();
    req = dbChanges.find((c) => c.id === changeId);
    if (req) {
      changes.unshift(req);
    }
  }
  if (!req) {
    throw new ChangeRequestNotFoundError(`Change request '${changeId}' not found.`);
  }
  if (req.status !== "PENDING_APPROVAL") {
    throw new DuplicatePayeeError(`Change request '${changeId}' is already ${req.status}.`);
  }

  // Strict Dual-Control (Four-Eyes Principle): requester cannot self-approve
  if (req.requestedBy.toLowerCase() === cleanApprover) {
    throw new DualControlViolationError(
      `Dual-control violation: '${cleanApprover}' submitted this request and cannot self-approve it. Connect a different authorized NEAR account.`
    );
  }

  req.approvedBy = cleanApprover;
  req.reviewNote = reviewNote?.trim() || undefined;
  req.resolvedAt = new Date().toISOString();

  if (decision === "REJECT") {
    req.status = "REJECTED";
    await persistChangeRequestToDb(req);

    const rejectAudit: PayeeAuditEntry = {
      id: `audit-${Date.now()}`,
      recipientId: req.recipientId,
      paymentId: req.paymentId,
      action: "REJECTED",
      actor: cleanApprover,
      requestedBy: req.requestedBy,
      approvedBy: cleanApprover,
      summary: `Rejected ${req.changeType === "NEW_REGISTRATION" ? "registration" : "update"} for '${req.displayName}' (${req.paymentId}).`,
      timestamp: new Date().toISOString(),
    };
    getAuditStore().unshift(rejectAudit);
    await persistAuditEntryToDb(rejectAudit);
    return { changeRequest: req };
  }

  // APPROVE
  req.status = "APPROVED";
  const store = getStore();
  let target = store.find(
    (r) => r.id === req.recipientId || r.paymentId.toLowerCase() === req.paymentId.toLowerCase()
  );

  // If record came only from DB and wasn't in memory store yet, load & push
  if (!target) {
    const all = await listAllRecipients();
    const found = all.find(
      (r) => r.id === req.recipientId || r.paymentId.toLowerCase() === req.paymentId.toLowerCase()
    );
    if (found) {
      store.unshift({ ...found });
      target = store[0];
    }
  }

  if (!target) {
    throw new ChangeRequestNotFoundError(`Target recipient '${req.paymentId}' could not be located.`);
  }

  const addrFields: (keyof PayeeChangeValues)[] = [
    "walletAddress",
    "evmAddress",
    "bitcoinAddress",
    "solanaAddress",
    "xrpAddress",
    "cosmosAddress",
    "stacksAddress",
    "stellarAddress",
  ];
  const addressChanged =
    req.changeType === "ADDRESS_UPDATE" &&
    addrFields.some(
      (k) => (req.previousValues?.[k] || "") !== (req.proposedValues[k] || "")
    );

  target.displayName = req.proposedValues.displayName || target.displayName;
  target.walletAddress = (req.proposedValues.walletAddress || target.walletAddress).toLowerCase();
  target.evmAddress = req.proposedValues.evmAddress;
  target.bitcoinAddress = req.proposedValues.bitcoinAddress;
  target.solanaAddress = req.proposedValues.solanaAddress;
  target.xrpAddress = req.proposedValues.xrpAddress;
  target.cosmosAddress = req.proposedValues.cosmosAddress;
  target.stacksAddress = req.proposedValues.stacksAddress;
  target.stellarAddress = req.proposedValues.stellarAddress;
  target.lastUpdatedBy = req.requestedBy;
  target.lastApprovedBy = cleanApprover;

  if (addressChanged) {
    const cooldownEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    target.verificationStatus = "WARNING";
    target.cooldownUntil = cooldownEnd;
    target.notes = `Key/address updated by ${req.requestedBy} & approved by ${cleanApprover}. 24h cooldown active until ${cooldownEnd.slice(0, 16)}Z.`;
  } else {
    target.verificationStatus = "VERIFIED";
    target.cooldownUntil = undefined;
    target.notes = req.proposedValues.notes || `Verified by dual-control approver ${cleanApprover}.`;
  }

  await syncRecipientToDb(target);
  await persistChangeRequestToDb(req);

  const approveAudit: PayeeAuditEntry = {
    id: `audit-${Date.now()}`,
    recipientId: target.id,
    paymentId: target.paymentId,
    action: addressChanged ? "COOLDOWN_TRIGGERED" : "APPROVED",
    actor: cleanApprover,
    requestedBy: req.requestedBy,
    approvedBy: cleanApprover,
    summary: addressChanged
      ? `Approved address update for '${target.displayName}' (${target.paymentId}). 24h WARNING cooldown activated.`
      : `Approved '${target.displayName}' (${target.paymentId}) as VERIFIED.`,
    previousValues: req.previousValues,
    newValues: req.proposedValues,
    timestamp: new Date().toISOString(),
  };
  getAuditStore().unshift(approveAudit);
  await persistAuditEntryToDb(approveAudit);

  return { changeRequest: req, recipient: target };
}

export async function verifyRecipientDomainAttestation(
  paymentId: string,
  domainOverride?: string,
  actorAccountId = "system-dns-verifier"
): Promise<{ attestation: DomainAttestationResult; recipient: CounterpartyRecord }> {
  const all = await listAllRecipients();
  const target = all.find(
    (r) => r.paymentId.toLowerCase() === paymentId.trim().toLowerCase()
  );
  if (!target) {
    throw new ChangeRequestNotFoundError(`Counterparty '${paymentId}' not found.`);
  }

  const domainToCheck = domainOverride?.trim() || target.vendorDomain;
  if (!domainToCheck) {
    throw new Error("No vendorDomain provided or stored on this counterparty.");
  }

  const attestation = await verifyVendorDomainTxt(domainToCheck, target.walletAddress);
  const store = getStore();
  let memTarget = store.find(
    (r) => r.paymentId.toLowerCase() === target.paymentId.toLowerCase()
  );
  if (!memTarget) {
    memTarget = target;
    store.unshift(memTarget);
  }

  memTarget.vendorDomain = attestation.domain;
  memTarget.domainVerified = attestation.verified;
  if (attestation.verified) {
    memTarget.domainVerifiedAt = attestation.checkedAt;
  }

  await syncRecipientToDb(memTarget);

  if (attestation.verified) {
    const auditEntry: PayeeAuditEntry = {
      id: `audit-${Date.now()}`,
      recipientId: memTarget.id,
      paymentId: memTarget.paymentId,
      action: "DOMAIN_ATTESTED",
      actor: actorAccountId,
      summary: `Cryptographic DNS TXT proof verified: ${attestation.matchedHost} -> ${memTarget.walletAddress}.`,
      newValues: {
        vendorDomain: attestation.domain,
        domainVerified: true,
      },
      timestamp: attestation.checkedAt,
    };
    getAuditStore().unshift(auditEntry);
    await persistAuditEntryToDb(auditEntry);
  }

  return { attestation, recipient: memTarget };
}
