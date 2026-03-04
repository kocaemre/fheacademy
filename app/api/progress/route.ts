import { supabase } from "@/lib/supabase-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("progress")
      .select("completions")
      .eq("wallet_address", wallet.toLowerCase())
      .single();

    // PGRST116 = no rows found — not an error, just empty
    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ completions: data?.completions ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, completions } = body;

    if (!wallet || !completions) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { error } = await supabase.from("progress").upsert(
      {
        wallet_address: wallet.toLowerCase(),
        completions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
