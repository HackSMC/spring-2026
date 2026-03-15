"use client";

import Link from "next/link";
import { Button, Fieldset, Modal, TitleBar } from "@react95/core";
import { Win95Modal, Win95ModalContent } from "@/components/modal";

const ERROR_MESSAGES: Record<string, string> = {
  missing_code:
    "The confirmation link is missing or incomplete. Try signing up again.",
  "Token has expired or is invalid":
    "This link has expired. Links are only valid for a short time. Please request a new one.",
  unknown: "Something went wrong. Please try again or contact support.",
};

function getErrorMessage(reason: string): string {
  return ERROR_MESSAGES[reason] ?? ERROR_MESSAGES["unknown"];
}

export function AuthErrorModal({ reason }: { reason: string }) {
  return (
    <Win95Modal
      className="flex w-xl max-w-[calc(100vw-2rem)]"
      style={{
        position: "relative",
        translate: "none",
        left: "auto",
        top: "auto",
        zIndex: 20,
      }}
      icon={<span>⚠️</span>}
      title="HackSMC - Auth Error"
      titleBarOptions={[<TitleBar.Close key="close" />]}
    >
      <Win95ModalContent>
        <div className="p-2">
          <Fieldset className="mb-4 p-2" legend="Something Went Wrong">
            <div className="space-y-2 p-1 text-xs leading-normal">
              <p>{getErrorMessage(reason)}</p>
            </div>
          </Fieldset>

          <div className="flex flex-wrap justify-end gap-2 mt-3">
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </Win95ModalContent>
    </Win95Modal>
  );
}
