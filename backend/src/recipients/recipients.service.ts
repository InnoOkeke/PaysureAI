import { Injectable } from "@nestjs/common";
import { Recipient } from "@prisma/client";
import { NearService, VerificationTier } from "../near/near.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  CounterpartyRecord,
  DEFAULT_RECIPIENTS,
  recipientAddresses,
} from "./recipient-defaults";

export interface ChainInfo {
  chain: string;
  rail: "NEAR Native" | "NEAR Chain Signatures (MPC)" | "NEAR Intent Solver (Model A)";
  currency: string;
}

export interface RecipientVerification {
  status: VerificationTier;
  isVerified: boolean;
  chain?: string;
  targetChain?: string;
  settlementRail?: ChainInfo["rail"];
  currency?: string;
  displayName?: string;
  paymentId?: string;
  walletAddress?: string;
  nearAccountId?: string;
  reason: string;
  recipient?: CounterpartyRecord;
}

export interface AddRecipientInput {
  displayName: string;
  paymentId?: string;
  walletAddress: string;
  evmAddress?: string;
  bitcoinAddress?: string;
  solanaAddress?: string;
  xrpAddress?: string;
  cosmosAddress?: string;
  stacksAddress?: string;
  stellarAddress?: string;
  notes?: string;
  verificationStatus?: string;
}

@Injectable()
export class RecipientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly near: NearService
  ) {}

  detectChainFromAddress(addr: string): ChainInfo {
    const clean = addr.trim();

    if (/^0x[a-fA-F0-9]{40}$/.test(clean)) {
      return {
        chain: "Base / Ethereum (EVM)",
        rail: "NEAR Chain Signatures (MPC)",
        currency: "ETH / USDC",
      };
    }

    if (/^(bc1|[13]|tb1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(clean)) {
      return {
        chain: "Bitcoin",
        rail: "NEAR Chain Signatures (MPC)",
        currency: "BTC",
      };
    }

    if (/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(clean)) {
      return {
        chain: "Ripple (XRP)",
        rail: "NEAR Intent Solver (Model A)",
        currency: "XRP",
      };
    }

    if (/^cosmos1[a-z0-9]{38,45}$/.test(clean)) {
      return {
        chain: "Cosmos",
        rail: "NEAR Intent Solver (Model A)",
        currency: "ATOM",
      };
    }

    if (/^S[PT][a-zA-Z0-9]{28,42}$/.test(clean)) {
      return {
        chain: "Stacks (Bitcoin L2)",
        rail: "NEAR Intent Solver (Model A)",
        currency: "STX",
      };
    }

    if (/^G[A-Z2-7]{55}$/.test(clean)) {
      return {
        chain: "Stellar",
        rail: "NEAR Intent Solver (Model A)",
        currency: "XLM",
      };
    }

    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean) && !clean.includes(".")) {
      return {
        chain: "Solana",
        rail: "NEAR Intent Solver (Model A)",
        currency: "SOL / USDC",
      };
    }

    return {
      chain: "NEAR Protocol",
      rail: "NEAR Native",
      currency: "NEAR",
    };
  }

  async list(): Promise<CounterpartyRecord[]> {
    const rows = await this.prisma.recipient.findMany({ orderBy: { createdAt: "desc" } });
    const merged = rows.map((row) => this.mapRow(row));

    for (const record of DEFAULT_RECIPIENTS) {
      if (
        !merged.some(
          (entry) =>
            entry.walletAddress.toLowerCase() === record.walletAddress.toLowerCase()
        )
      ) {
        merged.push(record);
      }
    }

    return merged;
  }

  async findByQuery(query: string): Promise<CounterpartyRecord | null> {
    const clean = query.trim().toLowerCase();
    if (!clean) return null;

    const exact = await this.prisma.recipient.findFirst({
      where: {
        OR: [
          { walletAddress: clean },
          { paymentId: clean },
          { displayName: { equals: query.trim(), mode: "insensitive" } },
        ],
      },
    });
    if (exact) return this.mapRow(exact);

    const rows = await this.prisma.recipient.findMany({ take: 100 });
    const candidates = [...rows.map((row) => this.mapRow(row)), ...DEFAULT_RECIPIENTS];
    const tokens = clean.split(/[^a-z0-9]+/).filter(Boolean);

    return (
      candidates.find((candidate) => {
        const haystack =
          `${candidate.displayName} ${candidate.paymentId} ${recipientAddresses(candidate).join(" ")}`.toLowerCase();
        return tokens.every((token) => haystack.includes(token));
      }) ?? null
    );
  }

  async findCounterparty(
    address?: string,
    paymentId?: string
  ): Promise<CounterpartyRecord | null> {
    const clean = address?.trim().toLowerCase();

    if (clean || paymentId) {
      const row = await this.prisma.recipient.findFirst({
        where: {
          OR: [
            ...(clean
              ? [
                  { walletAddress: clean },
                  { evmAddress: clean },
                  { bitcoinAddress: clean },
                  { solanaAddress: clean },
                  { xrpAddress: clean },
                  { cosmosAddress: clean },
                  { stacksAddress: clean },
                  { stellarAddress: clean },
                ]
              : []),
            ...(paymentId ? [{ paymentId: paymentId.toLowerCase() }] : []),
          ],
        },
      });
      if (row) return this.mapRow(row);
    }

    return (
      DEFAULT_RECIPIENTS.find((record) => {
        if (paymentId && record.paymentId.toLowerCase() === paymentId.toLowerCase()) {
          return true;
        }
        if (!clean) return false;
        return recipientAddresses(record).some(
          (value) => value.toLowerCase() === clean
        );
      }) ?? null
    );
  }

  async add(input: AddRecipientInput): Promise<CounterpartyRecord> {
    let cleanWallet = input.walletAddress.trim().toLowerCase();
    if (cleanWallet.endsWith(".tesnet")) {
      cleanWallet = cleanWallet.replace(/\.tesnet$/, ".testnet");
    }
    if (!cleanWallet.includes(".") && !cleanWallet.startsWith("0x")) {
      cleanWallet = `${cleanWallet}.testnet`;
    }

    const paymentId =
      input.paymentId ||
      cleanWallet.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "");

    let evmAddress = input.evmAddress?.trim();
    if (evmAddress && !evmAddress.startsWith("0x")) {
      evmAddress = `0x${evmAddress}`;
    }

    const data = {
      displayName: input.displayName,
      walletAddress: cleanWallet,
      evmAddress: evmAddress || null,
      bitcoinAddress: input.bitcoinAddress?.trim() || null,
      solanaAddress: input.solanaAddress?.trim() || null,
      xrpAddress: input.xrpAddress?.trim() || null,
      cosmosAddress: input.cosmosAddress?.trim() || null,
      stacksAddress: input.stacksAddress?.trim() || null,
      stellarAddress: input.stellarAddress?.trim() || null,
      notes: input.notes || null,
      verificationStatus: input.verificationStatus || "VERIFIED",
    };

    const saved = await this.prisma.recipient.upsert({
      where: { paymentId },
      create: { paymentId, ...data },
      update: data,
    });

    return this.mapRow(saved);
  }

  async verify(address: string, name?: string, paymentId?: string): Promise<RecipientVerification> {
    if (!address) {
      return {
        status: "UNVERIFIED",
        isVerified: false,
        reason: "Missing recipient address.",
      };
    }

    const rawAddress = address.trim();
    const chainInfo = this.detectChainFromAddress(rawAddress);

    if (chainInfo.chain !== "NEAR Protocol") {
      const recipient = await this.findCounterparty(rawAddress, paymentId);

      if (recipient && recipient.verificationStatus === "VERIFIED") {
        return {
          status: "VERIFIED",
          isVerified: true,
          chain: chainInfo.chain,
          targetChain: chainInfo.chain,
          settlementRail: chainInfo.rail,
          currency: chainInfo.currency,
          displayName: recipient.displayName,
          paymentId: recipient.paymentId,
          walletAddress: rawAddress,
          nearAccountId: recipient.walletAddress,
          recipient,
          reason: `Verified ${chainInfo.chain} address for '${recipient.displayName}'. Settlement routes via ${chainInfo.rail}.`,
        };
      }

      if (recipient) {
        return {
          status: recipient.verificationStatus,
          isVerified: recipient.verificationStatus === "VERIFIED",
          chain: chainInfo.chain,
          targetChain: chainInfo.chain,
          settlementRail: chainInfo.rail,
          currency: chainInfo.currency,
          displayName: recipient.displayName,
          walletAddress: rawAddress,
          nearAccountId: recipient.walletAddress,
          recipient,
          reason: `${chainInfo.chain} address matched to '${recipient.displayName}'. Status: ${recipient.verificationStatus}.`,
        };
      }

      return {
        status: "UNVERIFIED",
        isVerified: false,
        chain: chainInfo.chain,
        targetChain: chainInfo.chain,
        settlementRail: chainInfo.rail,
        currency: chainInfo.currency,
        walletAddress: rawAddress,
        reason: `Valid ${chainInfo.chain} destination address. Routes via ${chainInfo.rail}. No corporate KYC attestation filed in PaySure directory yet.`,
      };
    }

    let cleanAddress = rawAddress.toLowerCase();
    if (cleanAddress.endsWith(".tesnet")) {
      cleanAddress = cleanAddress.replace(/\.tesnet$/, ".testnet");
    }

    if (!this.near.isValidNearAccountId(cleanAddress) && cleanAddress.length < 3) {
      return {
        status: "UNVERIFIED",
        isVerified: false,
        reason: "Invalid NEAR Account ID format.",
      };
    }

    const account = await this.near.viewAccount(cleanAddress);

    if (!account.exists) {
      return {
        status: "UNVERIFIED",
        isVerified: false,
        walletAddress: cleanAddress,
        chain: "NEAR Protocol",
        targetChain: "NEAR Protocol",
        settlementRail: "NEAR Native",
        reason: `CRITICAL ALERT: Account '${cleanAddress}' does not exist on NEAR ${this.near.networkId} (verified against live RPC ${this.near.rpcUrl}). Do not send funds!`,
      };
    }

    const recipient = await this.findCounterparty(cleanAddress, paymentId);

    if (recipient && recipient.verificationStatus === "VERIFIED") {
      if (name && name.trim().length > 0) {
        const requested = name.trim().toLowerCase();
        const registered = recipient.displayName.toLowerCase();
        if (!registered.includes(requested) && !requested.includes(registered)) {
          return {
            status: "MISMATCH",
            isVerified: false,
            displayName: recipient.displayName,
            walletAddress: cleanAddress,
            chain: "NEAR Protocol",
            targetChain: "NEAR Protocol",
            settlementRail: "NEAR Native",
            recipient,
            reason: `CRITICAL MISMATCH: Invoice names payee as '${name}', but account ID is registered to '${recipient.displayName}'. Fraud risk alert!`,
          };
        }
      }

      return {
        status: "VERIFIED",
        isVerified: true,
        displayName: recipient.displayName,
        paymentId: recipient.paymentId,
        walletAddress: recipient.walletAddress,
        chain: "NEAR Protocol",
        targetChain: "NEAR Protocol",
        settlementRail: "NEAR Native",
        recipient,
        reason: `Account '${cleanAddress}' is live on NEAR ${this.near.networkId} and matches verified entity '${recipient.displayName}'. Confirmation of Payee passed.`,
      };
    }

    if (recipient) {
      return {
        status: recipient.verificationStatus,
        isVerified: recipient.verificationStatus === "VERIFIED",
        displayName: recipient.displayName,
        paymentId: recipient.paymentId,
        walletAddress: cleanAddress,
        chain: "NEAR Protocol",
        targetChain: "NEAR Protocol",
        settlementRail: "NEAR Native",
        recipient,
        reason: `Account is active on NEAR ${this.near.networkId} (balance: ~${account.balanceNear} NEAR). Organization attestation status: ${recipient.verificationStatus}.`,
      };
    }

    return {
      status: "UNVERIFIED",
      isVerified: false,
      walletAddress: cleanAddress,
      chain: "NEAR Protocol",
      targetChain: "NEAR Protocol",
      settlementRail: "NEAR Native",
      reason: `Live active NEAR ${this.near.networkId} account confirmed on-chain (balance: ~${account.balanceNear} NEAR). No business KYC attestation filed in PaySure yet.`,
    };
  }

  private mapRow(row: Recipient): CounterpartyRecord {
    return {
      id: row.id,
      displayName: row.displayName,
      paymentId: row.paymentId,
      walletAddress: row.walletAddress,
      evmAddress: row.evmAddress ?? undefined,
      bitcoinAddress: row.bitcoinAddress ?? undefined,
      solanaAddress: row.solanaAddress ?? undefined,
      xrpAddress: row.xrpAddress ?? undefined,
      cosmosAddress: row.cosmosAddress ?? undefined,
      stacksAddress: row.stacksAddress ?? undefined,
      stellarAddress: row.stellarAddress ?? undefined,
      verificationStatus: row.verificationStatus as VerificationTier,
      notes: row.notes ?? undefined,
    };
  }
}
