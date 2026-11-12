import { NextRequest, NextResponse } from "next/server";
import { findCounterparty, detectChainFromAddress } from "@/lib/recipients";
import { isValidNearAccountId } from "@/lib/near/config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { address, name, paymentId } = await req.json();

    if (!address) {
      return NextResponse.json(
        {
          status: "UNVERIFIED",
          isVerified: false,
          reason: "Missing recipient address.",
        },
        { status: 400 }
      );
    }

    const rawAddress = address.trim();
    let cleanAddress = rawAddress.toLowerCase();

    // Detect destination blockchain architecture
    const chainInfo = detectChainFromAddress(rawAddress);

    // If it's a cross-chain address (non-NEAR)
    if (chainInfo.chain !== "NEAR Protocol") {
      const recipient = await findCounterparty(rawAddress, paymentId);

      if (recipient && recipient.verificationStatus === "VERIFIED") {
        return NextResponse.json({
          status: "VERIFIED",
          isVerified: true,
          chain: chainInfo.chain,
          targetChain: chainInfo.chain,
          settlementRail: chainInfo.rail,
          currency: chainInfo.currency,
          displayName: recipient.displayName,
          paymentId: recipient.paymentId,
          walletAddress: rawAddress,
          nearAccountId: recipient.walletAddress,
          reason: `Verified ${chainInfo.chain} address for '${recipient.displayName}'. Settlement routes via ${chainInfo.rail}.`,
        });
      }

      if (recipient) {
        return NextResponse.json({
          status: recipient.verificationStatus || "WARNING",
          isVerified: recipient.verificationStatus === "VERIFIED",
          chain: chainInfo.chain,
          targetChain: chainInfo.chain,
          settlementRail: chainInfo.rail,
          currency: chainInfo.currency,
          displayName: recipient.displayName,
          walletAddress: rawAddress,
          reason: `${chainInfo.chain} address matched to '${recipient.displayName}'. Status: ${recipient.verificationStatus}.`,
        });
      }

      // Valid cross-chain address, routes via Intent Solver or MPC
      return NextResponse.json({
        status: "UNVERIFIED",
        isVerified: false,
        chain: chainInfo.chain,
        targetChain: chainInfo.chain,
        settlementRail: chainInfo.rail,
        currency: chainInfo.currency,
        walletAddress: rawAddress,
        reason: `Valid ${chainInfo.chain} destination address. Routes via ${chainInfo.rail}. No corporate KYC attestation filed in PaySure directory yet.`,
      });
    }

    // NEAR Protocol address handling
    if (cleanAddress.endsWith(".tesnet")) {
      cleanAddress = cleanAddress.replace(/\.tesnet$/, ".testnet");
    }

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
        chain: "NEAR Protocol",
        targetChain: "NEAR Protocol",
        settlementRail: "NEAR Native",
        reason: `CRITICAL ALERT: Account '${cleanAddress}' does not exist on NEAR Testnet (verified against live RPC https://rpc.testnet.near.org). Do not send funds!`,
      });
    }

    // Look up counterparty in verified registry
    const recipient = await findCounterparty(cleanAddress, paymentId);

    if (recipient && recipient.verificationStatus === "VERIFIED") {
      // Check for name mismatch if an invoice name was provided
      if (name && name.trim().length > 0) {
        const cleanReqName = name.trim().toLowerCase();
        const cleanRegName = recipient.displayName.toLowerCase();
        if (
          !cleanRegName.includes(cleanReqName) &&
          !cleanReqName.includes(cleanRegName)
        ) {
          return NextResponse.json({
            status: "MISMATCH",
            isVerified: false,
            displayName: recipient.displayName,
            walletAddress: cleanAddress,
            chain: "NEAR Protocol",
            targetChain: "NEAR Protocol",
            settlementRail: "NEAR Native",
            reason: `CRITICAL MISMATCH: Invoice names payee as '${name}', but account ID is registered to '${recipient.displayName}'. Fraud risk alert!`,
          });
        }
      }

      return NextResponse.json({
        status: "VERIFIED",
        isVerified: true,
        displayName: recipient.displayName,
        paymentId: recipient.paymentId,
        walletAddress: recipient.walletAddress,
        chain: "NEAR Protocol",
        targetChain: "NEAR Protocol",
        settlementRail: "NEAR Native",
        reason: `Account '${cleanAddress}' is live on NEAR Testnet and matches verified entity '${recipient.displayName}'. Confirmation of Payee passed.`,
      });
    }

    if (recipient) {
      return NextResponse.json({
        status: recipient.verificationStatus || "WARNING",
        isVerified: recipient.verificationStatus === "VERIFIED",
        displayName: recipient.displayName,
        walletAddress: cleanAddress,
        chain: "NEAR Protocol",
        targetChain: "NEAR Protocol",
        settlementRail: "NEAR Native",
        reason: `Account is active on NEAR Testnet (balance: ~${onChainBalance} NEAR). Organization attestation status: ${recipient.verificationStatus}.`,
      });
    }

    // Account exists on NEAR testnet but not registered in PaySure KYC
    return NextResponse.json({
      status: "UNVERIFIED",
      isVerified: false,
      walletAddress: cleanAddress,
      chain: "NEAR Protocol",
      targetChain: "NEAR Protocol",
      settlementRail: "NEAR Native",
      reason: `Live active NEAR Testnet account confirmed on-chain (balance: ~${onChainBalance} NEAR). No business KYC attestation filed in PaySure yet.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
