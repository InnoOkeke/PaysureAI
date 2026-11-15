import { NextRequest, NextResponse } from "next/server";
import {
  listPendingChanges,
  listPayeeAuditLog,
  reviewPayeeChangeRequest,
  DualControlViolationError,
  UnauthorizedApproverError,
  ChangeRequestNotFoundError,
  DuplicatePayeeError,
} from "@/lib/recipients";
import { verifySignedNearProof } from "@/lib/near/auth";
import { getSputnikCouncilMembers } from "@/lib/treasury/sputnikDao";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [pendingChanges, auditLog, sputnikCouncil] = await Promise.all([
      listPendingChanges(),
      listPayeeAuditLog(),
      getSputnikCouncilMembers(),
    ]);
    return NextResponse.json({
      pendingChanges,
      auditLog,
      sputnikCouncil,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.authProof) {
      return NextResponse.json(
        {
          error:
            "Cryptographic wallet signature (NEP-413 authProof) is required. Connect and sign with an authorized SputnikDAO council wallet.",
        },
        { status: 401 }
      );
    }

    const authResult = await verifySignedNearProof(body.authProof);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error || "Invalid NEAR wallet signature." },
        { status: 401 }
      );
    }
    const approverAccountId = authResult.accountId;

    const { changeId, decision, reviewNote } = body;
    if (!changeId || (decision !== "APPROVE" && decision !== "REJECT")) {
      return NextResponse.json(
        { error: "changeId and decision ('APPROVE' or 'REJECT') are required." },
        { status: 400 }
      );
    }

    const result = await reviewPayeeChangeRequest(
      changeId,
      decision,
      approverAccountId,
      reviewNote
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    if (
      error instanceof DualControlViolationError ||
      error instanceof UnauthorizedApproverError
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof ChangeRequestNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof DuplicatePayeeError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
