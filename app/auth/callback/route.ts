import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** OAuth / magic-link return: exchange the code for a session, then continue. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/feed";

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      let dest = next;
      if (next === "/feed") {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: membership } = await supabase
            .from("space_members")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();
          if (membership?.role === "admin") dest = "/upload";
        }
      }
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
