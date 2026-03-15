"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/features/auth/lib/client";
import { Modal } from "@react95/core";
import { Computer } from "@react95/icons";

export default function AuthConfirm() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const handleSession = async () => {
      // Manually parse the hash fragment
      const hash = window.location.hash;

      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (!error) {
            router.push("/apply");
            return;
          }
        }
      }

      // Fallback
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/apply");
      }
    };

    handleSession();
  }, []);

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <Modal
        title="Welcome"
        icon={<Computer variant="16x16_4" />}
        dragOptions={{ disabled: true }}
        style={{
          position: "relative",
          translate: "none",
          left: "auto",
          top: "auto",
        }}
      >
        <Modal.Content boxShadow="$in" bgColor="$material">
          <div className="p-6 text-center">Confirming your account...</div>
        </Modal.Content>
      </Modal>
    </div>
  );
}
