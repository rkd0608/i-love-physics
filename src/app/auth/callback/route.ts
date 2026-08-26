import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function sanitizeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/library";
}

function humanizeLinkError(
  description: string | null,
  errorCode: string | null,
): string {
  const normalized = `${description ?? ""} ${errorCode ?? ""}`.toLowerCase();
  if (
    normalized.includes("already been used") ||
    normalized.includes("already confirmed")
  ) {
    return "This link was already used. Sign in below, or send yourself a fresh one.";
  }
  return "This confirmation link has expired or is invalid. Send yourself a fresh one below.";
}

function expiredRedirect(request: NextRequest, message: string): NextResponse {
  const target = new URL("/signin", request.nextUrl.origin);
  target.searchParams.set("error", "expired");
  target.searchParams.set("message", message);
  return NextResponse.redirect(target);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const linkError =
    request.nextUrl.searchParams.get("error") ??
    request.nextUrl.searchParams.get("error_code");
  if (linkError) {
    return expiredRedirect(
      request,
      humanizeLinkError(
        request.nextUrl.searchParams.get("error_description"),
        request.nextUrl.searchParams.get("error_code"),
      ),
    );
  }
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
    return expiredRedirect(
      request,
      humanizeLinkError(null, "otp_expired"),
    );
  }
}
