import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NearService } from "../near/near.service";

export interface RecipientVerification {
  status: "VERIFIED" | "WARNING" | "UNVERIFIED" | "MISMATCH";
  isVerified: boolean;
  displayName?: string;
  paymentId?: string;
  walletAddress?: string;
  reason: string;
}

@Injectable()
export class RecipientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly near: NearService
  ) {}

  async findByQuery(query: string) {
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
    if (exact) return exact;

    const recipients = await this.prisma.recipient.findMany({ take: 100 });
    const tokens = clean.split(/[^a-z0-9]+/).filter(Boolean);
    return (
      recipients.find((recipient) => {
        const candidate = `${recipient.displayName} ${recipient.paymentId} ${recipient.walletAddress}`.toLowerCase();
        return tokens.every((token) => candidate.includes(token));
      }) ?? null
    );
  }

  async verify(address: string, name?: string, paymentId?: string): Promise<RecipientVerification> {
    if (!address || (!this.near.isValidNearAccountId(address) && address.length < 3)) {
      return {
        status: "UNVERIFIED",
        isVerified: false,
        reason: "Invalid NEAR Account ID format.",
      };
    }

    const cleanAddress = this.near.normalizeAccountId(address);
    const account = await this.near.viewAccount(cleanAddress);

    if (!account.exists) {
      return {
        status: "UNVERIFIED",
        isVerified: false,
        walletAddress: cleanAddress,
        reason: `CRITICAL ALERT: Account '${cleanAddress}' does not exist on NEAR ${this.near.networkId} (verified against live RPC ${this.near.rpcUrl}). Do not send funds!`,
      };
    }

    const recipient = await this.prisma.recipient.findFirst({
      where: {
        OR: [
          { walletAddress: cleanAddress },
          ...(paymentId ? [{ paymentId: paymentId.toLowerCase() }] : []),
        ],
      },
    });

    if (recipient && recipient.verificationStatus === "VERIFIED") {
      return {
        status: "VERIFIED",
        isVerified: true,
        displayName: recipient.displayName,
        paymentId: recipient.paymentId,
        walletAddress: recipient.walletAddress,
        reason: `Account '${cleanAddress}' is live on NEAR ${this.near.networkId} and matches verified entity '${recipient.displayName}'. Confirmation of Payee passed.`,
      };
    }

    if (recipient) {
      if (name && recipient.displayName.toLowerCase() !== name.toLowerCase()) {
        return {
          status: "MISMATCH",
          isVerified: false,
          displayName: recipient.displayName,
          walletAddress: cleanAddress,
          reason: `CRITICAL MISMATCH: Invoice names payee as '${name}', but account ID is registered to '${recipient.displayName}'. Fraud risk alert!`,
        };
      }

      return {
        status:
          recipient.verificationStatus === "MISMATCH"
            ? "MISMATCH"
            : (recipient.verificationStatus as RecipientVerification["status"]),
        isVerified: recipient.verificationStatus === "VERIFIED",
        displayName: recipient.displayName,
        paymentId: recipient.paymentId,
        walletAddress: cleanAddress,
        reason: `Account is active on NEAR ${this.near.networkId} (balance: ~${account.balanceNear} NEAR). Organization attestation is pending.`,
      };
    }

    return {
      status: "UNVERIFIED",
      isVerified: false,
      walletAddress: cleanAddress,
      reason: `Live active NEAR ${this.near.networkId} account confirmed on-chain (balance: ~${account.balanceNear} NEAR). No business KYC attestation filed in PaySure yet.`,
    };
  }
}
