import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function sanitizeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/library";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  if (!code) {
    return NextResponse.redirect(
      new URL("/signin?error=auth", request.nextUrl.origin),
    );
  }
  try {
    const supabase = await getSupabaseServer();
    if (!supabase) throw new Error("Supabase is not configured");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return NextResponse.redirect(new URL(next, request.nextUrl.origin));
  } catch {
    return NextResponse.redirect(
      new URL("/signin?error=auth", request.nextUrl.origin),
    );
  }
}
