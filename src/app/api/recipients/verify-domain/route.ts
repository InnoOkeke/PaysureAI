import { NextRequest, NextResponse } from "next/server";
import { verifyVendorDomainTxt } from "@/lib/security/domainAttestation";
import {
  verifyRecipientDomainAttestation,
  ChangeRequestNotFoundError,
} from "@/lib/recipients";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, walletAddress, paymentId, actorAccountId } = body;

    if (paymentId) {
      const result = await verifyRecipientDomainAttestation(
        paymentId,
        domain,
        actorAccountId || "operator-dns-check"
      );
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    if (!domain || !walletAddress) {
      return NextResponse.json(
        { error: "Provide paymentId, or both domain and walletAddress." },
        { status: 400 }
      );
    }

    const attestation = await verifyVendorDomainTxt(domain, walletAddress);
    return NextResponse.json({
      success: true,
      attestation,
    });
  } catch (error: any) {
    if (error instanceof ChangeRequestNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
