import { NextRequest, NextResponse } from "next/server";
import { listAllRecipients, addCounterparty } from "@/lib/recipients";
import { isValidNearAccountId } from "@/lib/near/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recipients = await listAllRecipients();
    return NextResponse.json({ recipients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { displayName, paymentId, walletAddress, evmAddress, notes, verificationStatus } = body;

    if (!displayName || !walletAddress) {
      return NextResponse.json(
        { error: "Display name and wallet address are required." },
        { status: 400 }
      );
    }

    let cleanWallet = walletAddress.trim().toLowerCase();
    // Auto-fix typo .tesnet -> .testnet if user entered it
    if (cleanWallet.endsWith(".tesnet")) {
      cleanWallet = cleanWallet.replace(/\.tesnet$/, ".testnet");
    }

    if (!cleanWallet.includes(".") && !cleanWallet.startsWith("0x")) {
      cleanWallet = `${cleanWallet}.testnet`;
    }

    if (!paymentId) {
      paymentId = cleanWallet.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "");
    }

    let cleanEvm = evmAddress?.trim();
    if (cleanEvm && !cleanEvm.startsWith("0x")) {
      cleanEvm = `0x${cleanEvm}`;
    }

    const recipient = await addCounterparty({
      displayName,
      paymentId,
      walletAddress: cleanWallet,
      evmAddress: cleanEvm,
      notes,
      verificationStatus: verificationStatus || "VERIFIED",
    });

    return NextResponse.json({ recipient, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

