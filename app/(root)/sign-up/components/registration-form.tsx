"use client";

import Link from "next/link";
import { Button, Fieldset, Modal, TitleBar } from "@react95/core";
import { z } from "zod";
import { useAppForm } from "@/features/auth/hooks/create-form-hook";
import { RegistrationFormValues } from "../types/registration";
import { registrationSchema } from "@/features/auth/schema/auth";

export function RegistrationForm() {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    } satisfies RegistrationFormValues,
    validators: {
      onBlur: registrationSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("register", value);
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
      icon={<span>📝</span>}
      title="HackSMC - Registration"
      titleBarOptions={[<TitleBar.Close key="close" />]}
    >
      <Modal.Content>
        <form.AppForm>
          <div className="p-2">
            <Fieldset className="mb-4 p-2" legend="Create Account">
              <div className="p-1 text-xs leading-normal">
                Enter your email and password below to create an account
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
                          {field.state.meta.errors[0]?.message}
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
                      placeholder="Create a password"
                      type="password"
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <div className="pt-0.5 pb-2.5 text-[#8a1f11] text-xs">
                          {field.state.meta.errors[0]?.message}
                        </div>
                      )}
                  </>
                )}
              </form.AppField>

              <form.AppField
                name="confirmPassword"
                validators={{
                  onBlurListenTo: ["password"],
                  onBlur: ({ value, fieldApi }) => {
                    if (value !== fieldApi.form.getFieldValue("password")) {
                      return "Passwords do not match.";
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <>
                    <field.TextWindow95Field
                      label="Confirm Password"
                      placeholder="Re-enter your password"
                      type="password"
                    />
                    errors
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
                href="/sign-in"
                className="text-[#003c74] text-xs underline"
              >
                Already have an account?
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
                    {isSubmitting ? "Creating..." : "Create Account"}
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
