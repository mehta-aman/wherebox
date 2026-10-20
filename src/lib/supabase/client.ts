import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Defensively strip any trailing /rest/v1 or trailing slashes
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
