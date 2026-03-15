import { createClient } from "@/features/auth/lib/client";
import { InternalAxiosRequestConfig } from "axios";

export async function tokenInterceptor(config: InternalAxiosRequestConfig) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const accessToken = session?.expires_at && session.expires_at * 1000 < Date.now()
    ? (await supabase.auth.refreshSession()).data.session?.access_token
    : session?.access_token;

  if (accessToken && !config.headers.get('Authorization')) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
}