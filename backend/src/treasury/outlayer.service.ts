import { Injectable } from "@nestjs/common";

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

@Injectable()
export class OutlayerService {
  evaluate(params: OutlayerPolicyCheckParams): OutlayerAttestation {
    const {
      agentId = "paysure-autonomous-agent.near",
      recipientAddress,
      amountUSD,
      intent,
    } = params;

    const rules: OutlayerAttestation["enforcedRules"] = [];
    let riskScore = 10;

    const passedSingleTx = amountUSD <= 500;
    rules.push({
      rule: "OUTLAYER_MAX_TX_CEILING_USD",
      passed: passedSingleTx,
      reason: passedSingleTx
        ? `Transaction amount ($${amountUSD.toFixed(2)}) is within $500 ceiling.`
        : `Transaction amount ($${amountUSD.toFixed(2)}) exceeds $500 single-tx policy limit.`,
    });
    if (!passedSingleTx) riskScore += 45;

    const hasDigitSubstitution = /[0-9]/.test(
      recipientAddress.replace(/\.(testnet|near|mainnet)/, "")
    );
    const passedAntiSpoof = !(hasDigitSubstitution && recipientAddress.includes("satos"));
    rules.push({
      rule: "OUTLAYER_ANTI_SPOOF_VERIFICATION",
      passed: passedAntiSpoof,
      reason: passedAntiSpoof
        ? "Recipient address passed lookalike entropy check."
        : "Suspicious character substitution detected in recipient handle.",
    });
    if (!passedAntiSpoof) riskScore += 60;

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

    let recommendation: OutlayerAttestation["recommendation"] = "APPROVE_AUTONOMOUS";
    if (riskScore >= 70 || containsJailbreak) {
      recommendation = "BLOCK_SUSPICIOUS";
    } else if (!passedSingleTx || amountUSD > 100) {
      recommendation = "REQUIRE_MULTISIG";
    }

    return {
      compliant: recommendation !== "BLOCK_SUSPICIOUS",
      attestationId: `OUTLAYER-ATT-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`,
      agentId,
      timestamp: new Date().toISOString(),
      riskScore: Math.min(100, riskScore),
      enforcedRules: rules,
      recommendation,
    };
  }
}
