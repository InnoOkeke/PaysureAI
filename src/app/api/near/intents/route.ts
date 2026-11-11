import { NextResponse } from "next/server";
import { createPaymentIntent, NEAR_INTENTS_CONFIG } from "@/lib/near/chainSignatures";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/near/intents
 * Dispatches a Verifiable Payment Intent on NEAR Protocol
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      senderNearAccount = "alice.testnet", 
      recipientAddress, 
      paymentId, 
      amount, 
      tokenSymbol = "NEAR",
      invoiceReference = "INTENT-REF" 
    } = body;

    if (!recipientAddress || !amount) {
      return NextResponse.json(
        { error: "recipientAddress and amount are required" },
        { status: 400 }
      );
    }

    // 1. Confirmation of Payee verification
    let verificationTier: "VERIFIED" | "WARNING" | "UNVERIFIED" | "MISMATCH" = "UNVERIFIED";
    const foundRecipient = await prisma.recipient.findFirst({
      where: {
        OR: [
          { walletAddress: recipientAddress.toLowerCase() },
          paymentId ? { paymentId: paymentId.toLowerCase() } : {},
        ],
      },
    });

    if (foundRecipient) {
      if (foundRecipient.walletAddress.toLowerCase() === recipientAddress.toLowerCase()) {
        verificationTier = foundRecipient.verificationStatus as any;
      } else {
        verificationTier = "MISMATCH";
      }
    }

    // 2. Formulate the verifiable Payment Intent
    const intent = createPaymentIntent({
      senderNearAccount,
      recipientNearAccount: recipientAddress,
      paymentIdAlias: paymentId || foundRecipient?.paymentId,
      amount: String(amount),
      tokenSymbol,
      invoiceReference,
      verificationTier,
    });

    return NextResponse.json({
      success: true,
      message: "Verifiable NEAR Payment Intent formulated successfully",
      intent,
      network: "NEAR Protocol",
      consensus: "Nightshade Sub-Second Finality",
    });
  } catch (error: any) {
    console.error("NEAR Intent error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process intent" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/near/intents
 * Returns supported intent solvers and NEAR configuration
 */
export async function GET() {
  return NextResponse.json({
    protocol: "PaySure AI Verifiable NEAR Payment Intent Protocol",
    version: "1.0.0",
    engine: "NEAR Protocol Native Intent Settlement",
    config: NEAR_INTENTS_CONFIG,
    agentSwarm: {
      guard: "PaySure AI Risk Sentinel (Prompt Injection & Payee Verification)",
      dispatcher: "PaySure AI Autonomous Intent Dispatcher",
    },
  });
}
