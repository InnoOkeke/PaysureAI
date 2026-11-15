import { NextRequest, NextResponse } from "next/server";
import {
  listAllRecipients,
  listPendingChanges,
  listPayeeAuditLog,
  getConfiguredApprovers,
  registerPendingCounterparty,
  proposeCounterpartyUpdate,
  DuplicatePayeeError,
  TyposquattingRiskError,
  ChangeRequestNotFoundError,
} from "@/lib/recipients";
import { verifySignedNearProof, type SignedRequestProof } from "@/lib/near/auth";
import { getSputnikCouncilMembers } from "@/lib/treasury/sputnikDao";

export const dynamic = "force-dynamic";

async function verifyCallerProof(
  authProof?: SignedRequestProof
): Promise<{ accountId: string } | { error: string }> {
  if (!authProof) {
    return {
      error: "Cryptographic wallet signature (NEP-413 authProof) is required. Connect and sign with your NEAR wallet.",
    };
  }
  const verification = await verifySignedNearProof(authProof);
  if (!verification.valid) {
    return { error: verification.error || "Invalid NEAR wallet signature." };
  }
  return { accountId: verification.accountId };
}

export async function GET() {
  try {
    const [recipients, pendingChanges, auditLog, sputnikCouncil] = await Promise.all([
      listAllRecipients(),
      Promise.resolve(listPendingChanges()),
      Promise.resolve(listPayeeAuditLog()),
      getSputnikCouncilMembers(),
    ]);
    return NextResponse.json({
      recipients,
      pendingChanges,
      auditLog,
      configuredApprovers: getConfiguredApprovers(),
      sputnikCouncil,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = await verifyCallerProof(body.authProof);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }
    const requestedBy = auth.accountId;

    let {
      displayName,
      paymentId,
      walletAddress,
      evmAddress,
      bitcoinAddress,
      solanaAddress,
      xrpAddress,
      cosmosAddress,
      stacksAddress,
      stellarAddress,
      vendorDomain,
      notes,
    } = body;

    if (!displayName || !walletAddress) {
      return NextResponse.json(
        { error: "Display name and primary NEAR account ID are required." },
        { status: 400 }
      );
    }

    let cleanWallet = walletAddress.trim().toLowerCase();
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

    // Security policy: new registrations ALWAYS start as UNVERIFIED and enter dual-control approval.
    const { recipient, changeRequest } = await registerPendingCounterparty(
      {
        displayName,
        paymentId,
        walletAddress: cleanWallet,
        evmAddress: cleanEvm || undefined,
        bitcoinAddress: bitcoinAddress?.trim() || undefined,
        solanaAddress: solanaAddress?.trim() || undefined,
        xrpAddress: xrpAddress?.trim() || undefined,
        cosmosAddress: cosmosAddress?.trim() || undefined,
        stacksAddress: stacksAddress?.trim() || undefined,
        stellarAddress: stellarAddress?.trim() || undefined,
        vendorDomain: vendorDomain?.trim() || undefined,
        notes,
      },
      requestedBy
    );

    return NextResponse.json(
      {
        recipient,
        changeRequest,
        success: true,
        message: "Payee registered as UNVERIFIED and queued for second-signer approval.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof DuplicatePayeeError || error instanceof TyposquattingRiskError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = await verifyCallerProof(body.authProof);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }
    const requestedBy = auth.accountId;

    const { paymentId, proposedValues, reason } = body;
    if (!paymentId || !proposedValues) {
      return NextResponse.json(
        { error: "paymentId and proposedValues are required." },
        { status: 400 }
      );
    }

    const changeRequest = await proposeCounterpartyUpdate(
      paymentId,
      proposedValues,
      requestedBy,
      reason
    );

    return NextResponse.json(
      {
        changeRequest,
        success: true,
        message: "Change request queued. Active verified payee record remains locked until approved by a second signer.",
      },
      { status: 202 }
    );
  } catch (error: any) {
    if (error instanceof ChangeRequestNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
