import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidNearAccountId } from "@/lib/near/config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { address, name, paymentId } = await req.json();

    if (!address || (!isValidNearAccountId(address) && address.length < 3)) {
      return NextResponse.json(
        {
          status: "UNVERIFIED",
          isVerified: false,
          reason: "Invalid NEAR Account ID format.",
        },
        { status: 400 }
      );
    }

    const cleanAddress = address.trim().toLowerCase();

    // Query local database for counterparty record
    const recipient = await prisma.recipient.findFirst({
      where: {
        OR: [
          { walletAddress: cleanAddress },
          paymentId ? { paymentId: paymentId.toLowerCase() } : undefined,
        ].filter(Boolean) as any,
      },
    });

    // Known sample verified NEAR testnet counterparties
    const knownVerifiedAccounts: Record<string, string> = {
      "acme-design.testnet": "Acme Web3 Design Studio",
      "satoshi-dev.testnet": "Satoshi Freelance Engineering",
      "near-foundation.testnet": "NEAR Foundation Ecosystem",
      "paysure-treasury.testnet": "PaySure Protocol Treasury",
    };

    if (recipient && recipient.verificationStatus === "VERIFIED") {
      return NextResponse.json({
        status: "VERIFIED",
        isVerified: true,
        displayName: recipient.displayName,
        paymentId: recipient.paymentId,
        walletAddress: recipient.walletAddress,
        reason: `Account matches confirmed NEAR entity: ${recipient.displayName}. Confirmation of Payee passed.`,
      });
    }

    if (knownVerifiedAccounts[cleanAddress]) {
      return NextResponse.json({
        status: "VERIFIED",
        isVerified: true,
        displayName: knownVerifiedAccounts[cleanAddress],
        paymentId: cleanAddress.split(".")[0],
        walletAddress: cleanAddress,
        reason: `Account verified as an official NEAR ecosystem partner: ${knownVerifiedAccounts[cleanAddress]}.`,
      });
    }

    if (recipient) {
      if (name && recipient.displayName.toLowerCase() !== name.toLowerCase()) {
        return NextResponse.json({
          status: "MISMATCH",
          isVerified: false,
          displayName: recipient.displayName,
          walletAddress: cleanAddress,
          reason: `CRITICAL MISMATCH: Invoice names payee as '${name}', but account ID is registered to '${recipient.displayName}'. Do not pay until confirmed!`,
        });
      }

      return NextResponse.json({
        status: recipient.verificationStatus || "UNVERIFIED",
        isVerified: recipient.verificationStatus === "VERIFIED",
        displayName: recipient.displayName,
        walletAddress: cleanAddress,
        reason: "Payee found in registry, but full KYC / on-chain attestation is pending.",
      });
    }

    // Completely unknown account
    return NextResponse.json({
      status: "UNVERIFIED",
      isVerified: false,
      walletAddress: cleanAddress,
      reason: "No registered PaySure identity or Confirmation of Payee record found for this NEAR account. Verify identity manually before sending funds.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
