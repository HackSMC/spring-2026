import { useQuery } from "@tanstack/react-query";
import { createClient } from "../lib/client";

async function fetchClaims() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error) throw error;
  return data;
}

export function useAuthUser() {
  return useQuery({
    queryKey: ["auth", "claims"],
    queryFn: fetchClaims,
  });
}
