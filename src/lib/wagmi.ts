import { http, createConfig, injected } from "wagmi";
import { baseSepolia, sepolia } from "viem/chains";

// Supported cross-chain EVM networks for NEAR Chain Signatures (MPC)
export const SUPPORTED_EVM_CHAINS = [baseSepolia, sepolia] as const;

export const wagmiConfig = createConfig({
  chains: [baseSepolia, sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [sepolia.id]: http("https://rpc.sepolia.org"),
  },
  ssr: true,
});
