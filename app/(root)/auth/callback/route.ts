// app/auth/callback/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/features/auth/lib/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const redirectTo = next?.startsWith("/") ? next : "/";
  
  console.log(code, next)

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  console.log(error)

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?reason=${encodeURIComponent(error.message)}`
    );
  }

  const finalRedirect = redirectTo === "/sign-in"
    ? "/sign-in?confirmed=true"
    : redirectTo;

  return NextResponse.redirect(`${origin}${finalRedirect}`);
}