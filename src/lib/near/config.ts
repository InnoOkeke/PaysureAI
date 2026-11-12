/**
 * NEAR Protocol Configuration for PaySure AI
 * Targets NEAR Testnet for development testing and NEAR Mainnet for production.
 */

export const NEAR_NETWORK_ID = process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet";

export const NEAR_CONFIG = {
  networkId: NEAR_NETWORK_ID,
  nodeUrl: process.env.NEXT_PUBLIC_NEAR_RPC_URL || "https://rpc.testnet.near.org",
  archivalUrl: "https://archival-rpc.testnet.near.org",
  walletUrl: "https://testnet.mynearwallet.com",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://testnet.nearblocks.io",
  
  // Official NEAR Tokens
  nativeCurrency: {
    name: "NEAR",
    symbol: "NEAR",
    decimals: 24,
  },
  
  // Stablecoins on NEAR (NEP-141 Standard)
  stablecoins: {
    USDC: {
      symbol: "USDC",
      name: "USD Coin (NEAR)",
      decimals: 6,
      contractId: "usdc.fakes.testnet", // Standard testnet NEP-141 mock on NEAR
    },
    USDT: {
      symbol: "USDT",
      name: "Tether USD (NEAR)",
      decimals: 6,
      contractId: "usdt.fakes.testnet",
    },
  },
};

/**
 * Validates whether a string is a syntactically valid NEAR Account ID
 * Rules:
 * - 2 to 64 characters long
 * - Allowed chars: lowercase alphanumeric, '-', '_' and '.'
 * - Cannot start or end with '.' or '-'
 */
export function isValidNearAccountId(accountId: string): boolean {
  if (!accountId || typeof accountId !== "string") return false;
  const trimmed = accountId.trim().toLowerCase();
  if (trimmed.length < 2 || trimmed.length > 64) return false;
  
  // Standard NEAR named account or implicit hex account regex
  const nearAccountRegex = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
  return nearAccountRegex.test(trimmed);
}

/**
 * Normalizes a NEAR account string
 */
export function normalizeNearAccountId(accountId: string): string {
  return accountId.trim().toLowerCase();
}

