import { Inject, Injectable } from "@nestjs/common";
import { keccak256, toHex } from "viem";
import { APP_CONFIG, AppConfig } from "../config/env";

export type VerificationTier = "VERIFIED" | "WARNING" | "UNVERIFIED" | "MISMATCH";

export interface PaymentIntent {
  intentId: string;
  senderNearAccount: string;
  recipientNearAccount: string;
  paymentIdAlias?: string;
  amount: string;
  tokenSymbol: string;
  network: string;
  invoiceReference: string;
  status: "CREATED" | "VERIFIED" | "SOLVER_MATCHED" | "SETTLED" | "REJECTED";
  riskScore: number;
  verificationTier: VerificationTier;
  createdAt: number;
  solverSignature?: string;
  executionTxHash?: string;
}

export interface NearAccountInfo {
  exists: boolean;
  balanceNear: string;
  reason?: string;
}

@Injectable()
export class NearService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  get networkId(): string {
    return this.config.NEAR_NETWORK;
  }

  get rpcUrl(): string {
    return this.config.NEAR_RPC_URL;
  }

  get explorerUrl(): string {
    return this.config.NEAR_EXPLORER_URL;
  }

  get walletUrl(): string {
    return this.config.NEAR_WALLET_URL;
  }

  get nearUsdRate(): number {
    return this.config.NEAR_USD_RATE;
  }

  isValidNearAccountId(accountId: string): boolean {
    if (!accountId || typeof accountId !== "string") return false;
    const trimmed = accountId.trim().toLowerCase();
    if (trimmed.length < 2 || trimmed.length > 64) return false;
    const nearAccountRegex = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
    return nearAccountRegex.test(trimmed);
  }

  normalizeAccountId(accountId: string): string {
    return accountId.trim().toLowerCase();
  }

  isNearNamedAccount(address: string): boolean {
    const lower = address.toLowerCase();
    return lower.endsWith(".near") || lower.endsWith(".testnet") || lower.endsWith(".mainnet");
  }

  async viewAccount(accountId: string): Promise<NearAccountInfo> {
    const cleanAddress = this.normalizeAccountId(accountId);
    if (!this.isValidNearAccountId(cleanAddress)) {
      return { exists: false, balanceNear: "0", reason: "Invalid NEAR Account ID format." };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "paysure-backend-view-account",
          method: "query",
          params: {
            request_type: "view_account",
            finality: "final",
            account_id: cleanAddress,
          },
        }),
      });
      const data = (await response.json()) as {
        result?: { amount?: string };
        error?: { cause?: { name?: string }; message?: string };
      };

      if (data.result?.amount) {
        const yocto = BigInt(data.result.amount);
        const whole = yocto / BigInt("1000000000000000000000000");
        return { exists: true, balanceNear: whole.toString() };
      }

      return {
        exists: false,
        balanceNear: "0",
        reason: data.error?.cause?.name || data.error?.message || "Account not found",
      };
    } catch (error) {
      return {
        exists: false,
        balanceNear: "0",
        reason: error instanceof Error ? error.message : "NEAR RPC unavailable",
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  createPaymentIntent(params: {
    senderNearAccount: string;
    recipientNearAccount: string;
    paymentIdAlias?: string;
    amount: string;
    tokenSymbol?: string;
    invoiceReference: string;
    verificationTier?: VerificationTier;
  }): PaymentIntent {
    const timestamp = Date.now();
    const rawId = `${params.senderNearAccount}:${params.recipientNearAccount}:${params.amount}:${timestamp}`;
    const intentId = "INTENT-NEAR-" + keccak256(toHex(rawId)).slice(2, 10).toUpperCase();

    const verificationTier = params.verificationTier ?? "UNVERIFIED";
    const riskScore =
      verificationTier === "VERIFIED"
        ? 0
        : verificationTier === "WARNING"
          ? 45
          : verificationTier === "MISMATCH"
            ? 95
            : 20;

    return {
      intentId,
      senderNearAccount: params.senderNearAccount,
      recipientNearAccount: params.recipientNearAccount,
      paymentIdAlias: params.paymentIdAlias,
      amount: params.amount,
      tokenSymbol: params.tokenSymbol || "NEAR",
      network: `NEAR ${this.networkId.charAt(0).toUpperCase() + this.networkId.slice(1)}`,
      invoiceReference: params.invoiceReference,
      status: riskScore > 50 ? "REJECTED" : "VERIFIED",
      riskScore,
      verificationTier,
      createdAt: timestamp,
    };
  }

  deriveEVMAddressFromNear(nearAccountId: string, path = "ethereum,1"): string {
    const hash = keccak256(toHex(`${nearAccountId}:${path}`));
    return "0x" + hash.slice(26);
  }

  intentsConfig() {
    return {
      networkId: this.networkId,
      rpcUrl: this.rpcUrl,
      explorerUrl: this.explorerUrl,
      supportedTokens: [
        { symbol: "NEAR", name: "NEAR Native", decimals: 24 },
        {
          symbol: "USDC",
          name: "USD Coin (NEP-141)",
          decimals: 6,
          contractId: "usdc.fakes.testnet",
        },
      ],
    };
  }
}
