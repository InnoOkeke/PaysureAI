import OpenAI from "openai";

/**
 * NEAR.AI Cloud API Integration
 * Official Decentralized Private AI inference: https://cloud.near.ai / https://docs.near.ai/
 * Endpoint: https://api.near.ai/v1 (OpenAI-compatible format)
 */

const apiKey =
  process.env.NEARAI_API_KEY ||
  process.env.NEAR_AI_API_KEY ||
  process.env.DEEPSEEK_API_KEY ||
  "dummy_key";

const isNearAi = Boolean(
  process.env.NEARAI_API_KEY || process.env.NEAR_AI_API_KEY || process.env.NEARAI_BASE_URL
);

const baseURL =
  process.env.NEARAI_BASE_URL ||
  (isNearAi ? "https://api.near.ai/v1" : process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com");

export const nearAi = new OpenAI({
  apiKey,
  baseURL,
});

export const NEARAI_MODEL =
  process.env.NEARAI_MODEL ||
  (isNearAi ? "nearai/llama-3.1-70b-instruct" : process.env.DEEPSEEK_MODEL || "deepseek-chat");

export const AI_PROVIDER_NAME = isNearAi ? "NEAR.AI Cloud (api.near.ai)" : "PaySure AI Agent";

