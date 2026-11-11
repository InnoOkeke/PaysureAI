import { NextResponse } from "next/server";
import { resolveNaturalLanguageIntent } from "@/lib/near/intentResolver";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { prompt, senderAccount = "company.near" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const resolved = resolveNaturalLanguageIntent(prompt, senderAccount);

    return NextResponse.json({
      success: true,
      resolved,
    });
  } catch (error: any) {
    console.error("Resolve intent error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

