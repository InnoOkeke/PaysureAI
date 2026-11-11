import { http, createConfig, injected } from "wagmi";
import { defineChain } from "viem";

export const qdayAevumTestnet = defineChain({
  id: 44005,
  name: "QDay Aevum Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "tQDAY",
    symbol: "tQDAY",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_AEVUM_RPC_URL || "https://rpc-test.qday.info"],
      webSocket: [process.env.NEXT_PUBLIC_AEVUM_WS_URL || "wss://rpc-test.qday.info"],
    },
  },
  blockExplorers: {
    default: {
      name: "QDay Explorer",
      url: process.env.NEXT_PUBLIC_AEVUM_EXPLORER_URL || "https://explorer-test.qday.info",
    },
  },
  testnet: true,
});

export const TUSD8_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_TUSD8_ADDRESS ||
  "0x456569838f1d43009A91ebA4263147Afd7233483") as `0x${string}`;

export const TUSD8_DECIMALS = 6;

// Minimal ERC20 ABI for tUSD8 (balanceOf, approve, allowance, transfer, decimals, symbol)
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "success", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "success", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
] as const;

export const wagmiConfig = createConfig({
  chains: [qdayAevumTestnet],
  connectors: [
    injected({
      target: "metaMask",
    }),
    injected(),
  ],
  transports: {
    [qdayAevumTestnet.id]: http(process.env.NEXT_PUBLIC_AEVUM_RPC_URL || "https://rpc-test.qday.info"),
  },
  ssr: true,
});
