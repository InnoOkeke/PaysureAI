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

    // Query live NEAR blockchain RPC to verify if account actually exists on NEAR Testnet
    let liveOnChain = false;
    let onChainBalance = "0";
    try {
      const rpcRes = await fetch("https://rpc.testnet.near.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "verify-near-account",
          method: "query",
          params: {
            request_type: "view_account",
            finality: "final",
            account_id: cleanAddress,
          },
        }),
      });
      const rpcData = await rpcRes.json();
      if (rpcData.result?.amount) {
        liveOnChain = true;
        const yocto = BigInt(rpcData.result.amount);
        const whole = yocto / BigInt("1000000000000000000000000");
        onChainBalance = whole.toString();
      }
    } catch (e) {
      console.error("Live NEAR RPC check error:", e);
    }

    if (!liveOnChain) {
      return NextResponse.json({
        status: "UNVERIFIED",
        isVerified: false,
        walletAddress: cleanAddress,
        reason: `CRITICAL ALERT: Account '${cleanAddress}' does not exist on NEAR Testnet (verified against live RPC https://rpc.testnet.near.org). Do not send funds!`,
      });
    }

    // Query database for registered counterparty KYC record
    const recipient = await prisma.recipient.findFirst({
      where: {
        OR: [
          { walletAddress: cleanAddress },
          paymentId ? { paymentId: paymentId.toLowerCase() } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (recipient && recipient.verificationStatus === "VERIFIED") {
      return NextResponse.json({
        status: "VERIFIED",
        isVerified: true,
        displayName: recipient.displayName,
        paymentId: recipient.paymentId,
        walletAddress: recipient.walletAddress,
        reason: `Account '${cleanAddress}' is live on NEAR Testnet and matches verified entity '${recipient.displayName}'. Confirmation of Payee passed.`,
      });
    }

    if (recipient) {
      if (name && recipient.displayName.toLowerCase() !== name.toLowerCase()) {
        return NextResponse.json({
          status: "MISMATCH",
          isVerified: false,
          displayName: recipient.displayName,
          walletAddress: cleanAddress,
          reason: `CRITICAL MISMATCH: Invoice names payee as '${name}', but account ID is registered to '${recipient.displayName}'. Fraud risk alert!`,
        });
      }

      return NextResponse.json({
        status: recipient.verificationStatus || "WARNING",
        isVerified: recipient.verificationStatus === "VERIFIED",
        displayName: recipient.displayName,
        walletAddress: cleanAddress,
        reason: `Account is active on NEAR Testnet (balance: ~${onChainBalance} NEAR). Organization attestation is pending.`,
      });
    }

    // Account exists on NEAR testnet but not registered in PaySure KYC
    return NextResponse.json({
      status: "UNVERIFIED",
      isVerified: false,
      walletAddress: cleanAddress,
      reason: `Live active NEAR Testnet account confirmed on-chain (balance: ~${onChainBalance} NEAR). No business KYC attestation filed in PaySure yet.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
