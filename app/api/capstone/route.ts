import { supabase } from "@/lib/supabase-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("capstone_submissions")
      .select("repo_url, status, updated_at")
      .eq("wallet_address", wallet.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submission: data ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, repo_url } = body;

    if (!wallet || !repo_url) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    if (!repo_url.includes("github.com")) {
      return NextResponse.json(
        { error: "Must be a GitHub URL" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("capstone_submissions").upsert(
      {
        wallet_address: wallet.toLowerCase(),
        repo_url,
        status: "pending_review",
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
