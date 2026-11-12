import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.string().optional()
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  NEAR_NETWORK: z.string().default("testnet"),
  NEAR_RPC_URL: z.string().url().default("https://rpc.testnet.near.org"),
  NEAR_EXPLORER_URL: z.string().url().default("https://testnet.nearblocks.io"),
  NEAR_WALLET_URL: z.string().url().default("https://testnet.mynearwallet.com"),
  NEAR_USD_RATE: z.coerce.number().positive().default(5),

  NEARAI_API_KEY: optionalString,
  NEARAI_BASE_URL: z.string().url().default("https://api.near.ai/v1"),
  NEARAI_MODEL: z.string().default("nearai/llama-3.1-70b-instruct"),

  DEEPSEEK_API_KEY: optionalString,
  DEEPSEEK_API_BASE_URL: z.string().url().default("https://api.deepseek.com"),
  DEEPSEEK_MODEL: z.string().default("deepseek-chat"),

  AI_PRIMARY_PROVIDER: z.enum(["nearai", "deepseek"]).default("nearai"),
  AI_CACHE_TTL_SECONDS: z.coerce.number().int().min(0).default(300),

  SPUTNIK_DAO_CONTRACT: z.string().default("paysure-council.sputnik-dao.testnet"),
});

export type AppConfig = z.infer<typeof envSchema>;

export const APP_CONFIG = Symbol("APP_CONFIG");

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid backend configuration: ${details}`);
  }
  return parsed.data;
}
