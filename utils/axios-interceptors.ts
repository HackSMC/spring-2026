import { createClient } from "@/features/auth/lib/client";
import { InternalAxiosRequestConfig } from "axios";

export async function tokenInterceptor (config: InternalAxiosRequestConfig) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (accessToken && !config.headers.get('Authorization')) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
}