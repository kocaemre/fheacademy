import { supabase } from "@/lib/supabase-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("grades")
      .select("homework_id, score, updated_at")
      .eq("wallet_address", wallet.toLowerCase());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ grades: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, homework_id, score } = body;

    if (!wallet || !homework_id || score === undefined) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      return NextResponse.json(
        { error: "Score must be between 0 and 100" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("grades").upsert(
      {
        wallet_address: wallet.toLowerCase(),
        homework_id,
        score: numScore,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address,homework_id" }
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
