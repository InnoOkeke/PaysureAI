import { NextRequest, NextResponse } from "next/server";
import { createAuthChallenge } from "@/lib/near/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("accountId")?.trim().toLowerCase();
  const action = req.nextUrl.searchParams.get("action")?.trim() || "registry_mutation";

  if (!accountId || accountId.length < 3) {
    return NextResponse.json(
      { error: "Valid NEAR accountId query parameter is required." },
      { status: 400 }
    );
  }

  const challenge = createAuthChallenge(accountId, action);
  return NextResponse.json(challenge);
}
