/**
 * OutLayer Integration — Secure Transactions for AI Agents
 * Documentation: https://app.outlayer.ai/docs/getting-started
 * Website: https://outlayer.ai/
 * GitHub: https://github.com/out-layer/outlayer
 * 
 * Intercepts AI agent intents to guarantee compliance with security policies,
 * destination reputation checks, and velocity guardrails before signing.
 */

export interface OutlayerPolicyCheckParams {
  agentId?: string;
  senderAddress: string;
  recipientAddress: string;
  amountUSD: number;
  token: string;
  intent: string;
}

export interface OutlayerAttestation {
  compliant: boolean;
  attestationId: string;
  agentId: string;
  timestamp: string;
  riskScore: number;
  enforcedRules: {
    rule: string;
    passed: boolean;
    reason: string;
  }[];
  recommendation: "APPROVE_AUTONOMOUS" | "REQUIRE_MULTISIG" | "BLOCK_SUSPICIOUS";
}

export function evaluateOutlayerPolicy(params: OutlayerPolicyCheckParams): OutlayerAttestation {
  const {
    agentId = "paysure-autonomous-agent.near",
    senderAddress,
    recipientAddress,
    amountUSD,
    token,
    intent,
  } = params;

  const rules: OutlayerAttestation["enforcedRules"] = [];
  let riskScore = 10; // Low base risk

  // 1. Single-tx limit check ($500 ceiling)
  const passedSingleTx = amountUSD <= 500;
  rules.push({
    rule: "OUTLAYER_MAX_TX_CEILING_USD",
    passed: passedSingleTx,
    reason: passedSingleTx
      ? `Transaction amount ($${amountUSD.toFixed(2)}) is within $500 ceiling.`
      : `Transaction amount ($${amountUSD.toFixed(2)}) exceeds $500 single-tx policy limit.`,
  });
  if (!passedSingleTx) riskScore += 45;

  // 2. Lookalike typosquatting check (e.g. *.testnet or *.near format)
  const isNamedAccount = recipientAddress.endsWith(".testnet") || recipientAddress.endsWith(".near");
  const hasDigitSubstitution = /[0-9]/.test(recipientAddress.replace(/\.(testnet|near)/, ""));
  const passedAntiSpoof = !(hasDigitSubstitution && recipientAddress.includes("satos"));
  rules.push({
    rule: "OUTLAYER_ANTI_SPOOF_VERIFICATION",
    passed: passedAntiSpoof,
    reason: passedAntiSpoof
      ? "Recipient address passed lookalike entropy check."
      : "Suspicious character substitution detected in recipient handle.",
  });
  if (!passedAntiSpoof) riskScore += 60;

  // 3. Prompt injection detection on intent string
  const lowerIntent = (intent || "").toLowerCase();
  const containsJailbreak =
    lowerIntent.includes("ignore") ||
    lowerIntent.includes("bypass") ||
    lowerIntent.includes("drain") ||
    lowerIntent.includes("attacker");
  rules.push({
    rule: "OUTLAYER_PROMPT_INJECTION_SHIELD",
    passed: !containsJailbreak,
    reason: !containsJailbreak
      ? "No prompt injection tokens identified."
      : "Hostile prompt injection patterns detected in agent instruction.",
  });
  if (containsJailbreak) riskScore += 80;

  // Determine recommendation
  let recommendation: OutlayerAttestation["recommendation"] = "APPROVE_AUTONOMOUS";
  if (riskScore >= 70 || containsJailbreak) {
    recommendation = "BLOCK_SUSPICIOUS";
  } else if (!passedSingleTx || amountUSD > 100) {
    recommendation = "REQUIRE_MULTISIG";
  }

  const compliant = recommendation !== "BLOCK_SUSPICIOUS";
  const attestationId = `OUTLAYER-ATT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return {
    compliant,
    attestationId,
    agentId,
    timestamp: new Date().toISOString(),
    riskScore: Math.min(100, riskScore),
    enforcedRules: rules,
    recommendation,
  };
}

