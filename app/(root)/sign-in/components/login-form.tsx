"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Fieldset, Modal, TitleBar } from "@react95/core";
import { useAppForm } from "@/features/auth/hooks/create-form-hook";
import { loginSchema } from "@/features/auth/schema/auth";
import { createClient } from "@/features/auth/lib/client";
import {
  parseLoginError,
  LOGIN_ERROR_MESSAGES,
} from "@/features/auth/utils/auth-error";
import type { LoginFormValues, LoginState } from "@/features/auth/types/auth";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed") === "true";

  const [state, setState] = useState<LoginState>({ error: null });

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies LoginFormValues,
    validators: {
      onBlur: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setState({ error: null });

      const { error } = await supabase.auth.signInWithPassword({
        email: value.email,
        password: value.password,
      });

      if (error) {
        setState({ error: parseLoginError(error) });
        return;
      }

      router.push("/");
      router.refresh();
    },
  });

  return (
    <Modal
      className="flex w-xl max-w-[calc(100vw-2rem)]"
      dragOptions={{ disabled: true }}
      style={{
        position: "relative",
        translate: "none",
        left: "auto",
        top: "auto",
        zIndex: 20,
      }}
      icon={<span>🔐</span>}
      title="HackSMC - Login"
      titleBarOptions={[<TitleBar.Close key="close" />]}
    >
      <Modal.Content>
        <form.AppForm>
          <div className="p-2">
            <Fieldset className="mb-4 p-2" legend="Welcome Back">
              <div className="p-1 text-xs leading-normal">
                Enter your email and password to access your account
              </div>
            </Fieldset>
            // Inside the modal, above the error banner:
            {confirmed && (
              <div className="bg-[#f0fff0] mb-3 px-2 py-1.5 border border-[#1f8a3c] text-[#1f5c2e] text-xs">
                Your email is confirmed. You can sign in now.
              </div>
            )}
            {state.error && (
              <div className="bg-[#fff0f0] mb-3 px-2 py-1.5 border border-[#8a1f11] text-[#8a1f11] text-xs">
                {LOGIN_ERROR_MESSAGES[state.error]}
                {state.error === "email_not_confirmed" && (
                  <>
                    {" "}
                    <Link href="/sign-up" className="underline">
                      Resend confirmation?
                    </Link>
                  </>
                )}
              </div>
            )}
            <Fieldset className="mb-4 p-2" legend="Account Info">
              <form.AppField name="email">
                {(field) => (
                  <>
                    <field.TextWindow95Field
                      type="email"
                      label="Email"
                      placeholder="jane@example.com"
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <form.FieldError errors={field.state.meta.errors} />
                      )}
                  </>
                )}
              </form.AppField>

              <form.AppField name="password">
                {(field) => (
                  <>
                    <field.TextWindow95Field
                      label="Password"
                      placeholder="Enter your password"
                      type="password"
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <form.FieldError errors={field.state.meta.errors} />
                      )}
                  </>
                )}
              </form.AppField>
            </Fieldset>
            <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
              <Link
                href="/sign-up"
                className="text-[#003c74] text-xs underline"
              >
                Don't have an account?
              </Link>

              <form.Subscribe
                selector={(s) => ({
                  isSubmitting: s.isSubmitting,
                  canSubmit: s.canSubmit,
                })}
              >
                {({ isSubmitting, canSubmit }) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    onClick={form.handleSubmit}
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </div>
        </form.AppForm>
      </Modal.Content>
    </Modal>
  );
}
