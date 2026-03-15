"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/features/auth/lib/client";
import { Modal } from "@react95/core";
import { Computer } from "@react95/icons";
import { Win95Modal, Win95ModalContent } from "@/components/modal";

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
      <Win95Modal
        title="Welcome"
        icon={<Computer variant="16x16_4" />}
        style={{
          position: "relative",
          translate: "none",
          left: "auto",
          top: "auto",
        }}
      >
        <Win95ModalContent bgColor="$material">
          <div className="p-6 text-center">Confirming your account...</div>
        </Win95ModalContent>
      </Win95Modal>
    </div>
  );
}
