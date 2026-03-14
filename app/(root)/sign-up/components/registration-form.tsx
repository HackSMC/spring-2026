"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Fieldset, Input, Modal, TitleBar } from "@react95/core";
import { Field } from "@/components/form";

export function RegistrationForm() {
  // mark for replacement with tanstack-form and zod
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showEmailStatus = email.length > 0 && !emailIsValid;
  const showPasswordStatus = password.length > 0 || confirmPassword.length > 0;
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  return (
    <Modal
      className="flex w-xl max-w-[calc(100vw-2rem)]"
      dragOptions={{ disabled: true }}
      // Per instructions: Modal styles kept as inline
      style={{
        position: "relative",
        translate: "none",
        left: "auto",
        top: "auto",
        zIndex: 20,
      }}
      icon={<span>📝</span>}
      title="HackSMC - Registration"
      titleBarOptions={[<TitleBar.Close key="close" />]}
    >
      <Modal.Content>
        <div className="p-2">
          <Fieldset className="mb-4 p-2" legend="Create Account">
            <div className="p-1 text-xs leading-normal">
              Enter your email and password below to create an account.
            </div>
          </Fieldset>

          <Fieldset className="mb-4 p-2" legend="Account Info">
            <Field label="Email">
              <Input
                value={email}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(event.target.value)
                }
                placeholder="jane@example.com"
                className="w-full"
              />
            </Field>

            {showEmailStatus ? (
              <div className="pt-[2px] pb-[10px] text-[#8a1f11] text-xs">
                Enter a valid email address.
              </div>
            ) : null}

            <Field label="Password">
              <Input
                value={password}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(event.target.value)
                }
                placeholder="Create a password"
                className="w-full"
                type="password"
              />
            </Field>

            <Field label="Confirm Password">
              <Input
                value={confirmPassword}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter your password"
                className="w-full"
                type="password"
              />
            </Field>

            {showPasswordStatus && !passwordsMatch ? (
              <div className="pt-[2px] pb-1 text-[#8a1f11] text-xs">
                Passwords do not match yet.
              </div>
            ) : null}
          </Fieldset>

          <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
            <Link href="/sign-in" className="text-[#003c74] text-xs underline">
              Already have an account?
            </Link>

            <Button disabled={!emailIsValid || !passwordsMatch}>
              Create Account
            </Button>
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}
