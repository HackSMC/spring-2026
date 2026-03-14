// components/login-form.tsx
"use client";

import Link from "next/link";
import { Button, Fieldset, Modal, TitleBar } from "@react95/core";
import { useAppForm } from "@/features/auth/hooks/create-form-hook";
import { LoginFormValues } from "@/features/auth/types/auth";
import { loginSchema } from "@/features/auth/schema/auth";

export function LoginForm() {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies LoginFormValues,
    validators: {
      onBlur: loginSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("login", value);
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
                        <div className="pt-0.5 pb-2.5 text-[#8a1f11] text-xs">
                          {field.state.meta.errors
                            .map((e) =>
                              typeof e === "string" ? e : e?.message,
                            )
                            .filter(Boolean)
                            .join(", ")}
                        </div>
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
                        <div className="pt-0.5 pb-2.5 text-[#8a1f11] text-xs">
                          {field.state.meta.errors
                            .map((e) =>
                              typeof e === "string" ? e : e?.message,
                            )
                            .filter(Boolean)
                            .join(", ")}
                        </div>
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
