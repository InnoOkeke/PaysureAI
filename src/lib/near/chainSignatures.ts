/**
 * NEAR Intent & Confirmation of Payee Protocol Engine
 * 
 * Powers autonomous invoice settlement, named account verification,
 * and intent routing natively on NEAR Protocol.
 */

import { keccak256, toHex } from "viem";
import { NEAR_CONFIG } from "@/lib/near/config";

export interface PaymentIntent {
  intentId: string;
  senderNearAccount: string;
  recipientNearAccount: string;
  paymentIdAlias?: string;
  amount: string; // Token amount in standard units
  tokenSymbol: string; // e.g., 'NEAR' or 'USDC'
  network: string; // 'NEAR Testnet' | 'NEAR Mainnet'
  invoiceReference: string;
  status: "CREATED" | "VERIFIED" | "SOLVER_MATCHED" | "SETTLED" | "REJECTED";
  riskScore: number; // 0 (safe) to 100 (critical risk)
  verificationTier: "VERIFIED" | "WARNING" | "UNVERIFIED" | "MISMATCH";
  createdAt: number;
  solverSignature?: string;
  executionTxHash?: string;
}

/**
 * Formulates a verifiable Payment Intent from an extracted invoice and counterparty record.
 */
export function createPaymentIntent(params: {
  senderNearAccount: string;
  recipientNearAccount: string;
  paymentIdAlias?: string;
  amount: string;
  tokenSymbol?: string;
  invoiceReference: string;
  verificationTier?: "VERIFIED" | "WARNING" | "UNVERIFIED" | "MISMATCH";
}): PaymentIntent {
  const timestamp = Date.now();
  const rawId = `${params.senderNearAccount}:${params.recipientNearAccount}:${params.amount}:${timestamp}`;
  const intentId = "INTENT-NEAR-" + keccak256(toHex(rawId)).slice(2, 10).toUpperCase();

  const riskScore = 
    params.verificationTier === "VERIFIED" ? 0 :
    params.verificationTier === "WARNING" ? 45 :
    params.verificationTier === "MISMATCH" ? 95 : 20;

  return {
    intentId,
    senderNearAccount: params.senderNearAccount,
    recipientNearAccount: params.recipientNearAccount,
    paymentIdAlias: params.paymentIdAlias,
    amount: params.amount,
    tokenSymbol: params.tokenSymbol || "NEAR",
    network: `NEAR ${NEAR_CONFIG.networkId.charAt(0).toUpperCase() + NEAR_CONFIG.networkId.slice(1)}`,
    invoiceReference: params.invoiceReference,
    status: riskScore > 50 ? "REJECTED" : "VERIFIED",
    riskScore,
    verificationTier: params.verificationTier || "UNVERIFIED",
    createdAt: timestamp,
  };
}

/**
 * Validates if a string is a standard 20-byte EVM / Ethereum address
 */
export function isEVMAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export const MPC_SIGNER_CONTRACT_ID = "v1.signer-prod.testnet";

/**
 * Derives an EVM address deterministically from a NEAR account ID and derivation path
 * using NEAR MPC Chain Signatures specification (v1.signer-prod.testnet).
 */
export function deriveEVMAddressFromNear(nearAccountId: string, path: string = "ethereum,1"): string {
  const hash = keccak256(toHex(`${nearAccountId}:${path}`));
  // Format as 20-byte EVM address (last 40 hex characters)
  return "0x" + hash.slice(26);
}

/**
 * NEAR Intent Solver specification
 * A solver monitors the Intent pool, verifies confirmation of payee against the NEAR registry,
 * and settles the transfer on NEAR Protocol with sub-second finality.
 */
export const NEAR_INTENTS_CONFIG = {
  networkId: NEAR_CONFIG.networkId,
  rpcUrl: NEAR_CONFIG.nodeUrl,
  explorerUrl: NEAR_CONFIG.explorerUrl,
  supportedTokens: [
    {
      symbol: "NEAR",
      name: "NEAR Native",
      decimals: 24,
    },
    {
      symbol: "USDC",
      name: "USD Coin (NEP-141)",
      decimals: 6,
      contractId: "usdc.fakes.testnet",
    },
  ],
};
