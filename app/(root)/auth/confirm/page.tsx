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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/apply");
      }
    });

    return () => subscription.unsubscribe();
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
