import { NextRequest, NextResponse } from "next/server";
import { findCounterparty } from "@/lib/recipients";
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

    let cleanAddress = address.trim().toLowerCase();

    // Check if recipient is an EVM / Ethereum address (0x...)
    const isEvmFormat = /^0x[a-f0-9]{40}$/i.test(cleanAddress);
    if (cleanAddress.startsWith("0x")) {
      if (!isEvmFormat) {
        return NextResponse.json({
          status: "UNVERIFIED",
          isVerified: false,
          walletAddress: cleanAddress,
          chainType: "EVM",
          reason: "Invalid EVM address format. Must be a 42-character hexadecimal string starting with 0x.",
        });
      }

      // Look up counterparty in verified registry
      const recipient = await findCounterparty(cleanAddress, paymentId);
      if (recipient && recipient.verificationStatus === "VERIFIED") {
        return NextResponse.json({
          status: "VERIFIED",
          isVerified: true,
          chainType: "EVM",
          targetChain: "Ethereum / Base (EVM)",
          settlementRail: "NEAR Chain Signatures (MPC)",
          displayName: recipient.displayName,
          paymentId: recipient.paymentId,
          walletAddress: cleanAddress,
          nearAccountId: recipient.walletAddress,
          reason: `Verified Ethereum counterparty for '${recipient.displayName}'. Settlements will route over the NEAR Chain Signatures MPC Rail.`,
        });
      }

      if (recipient) {
        return NextResponse.json({
          status: recipient.verificationStatus || "WARNING",
          isVerified: recipient.verificationStatus === "VERIFIED",
          chainType: "EVM",
          targetChain: "Ethereum / Base (EVM)",
          settlementRail: "NEAR Chain Signatures (MPC)",
          displayName: recipient.displayName,
          walletAddress: cleanAddress,
          reason: `Ethereum address matched to '${recipient.displayName}'. Attestation status: ${recipient.verificationStatus}.`,
        });
      }

      // Valid EVM address, routes via NEAR Chain Signatures MPC
      return NextResponse.json({
        status: "UNVERIFIED",
        isVerified: false,
        chainType: "EVM",
        targetChain: "Ethereum / Base (EVM)",
        settlementRail: "NEAR Chain Signatures (MPC)",
        walletAddress: cleanAddress,
        reason: `Valid 20-byte EVM address. Routes via NEAR Chain Signatures MPC Rail to Ethereum/Base. No legal business KYC attestation filed in PaySure directory yet.`,
      });
    }

    // Gracefully handle common typos like .tesnet -> .testnet
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
        reason: `Account '${cleanAddress}' is live on NEAR Testnet and matches verified entity '${recipient.displayName}'. Confirmation of Payee passed.`,
      });
    }

    if (recipient) {
      return NextResponse.json({
        status: recipient.verificationStatus || "WARNING",
        isVerified: recipient.verificationStatus === "VERIFIED",
        displayName: recipient.displayName,
        walletAddress: cleanAddress,
        reason: `Account is active on NEAR Testnet (balance: ~${onChainBalance} NEAR). Organization attestation status: ${recipient.verificationStatus}.`,
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
