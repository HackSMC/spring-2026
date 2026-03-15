"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Fieldset, Modal, TitleBar } from "@react95/core";
import { useAppForm } from "@/hooks/create-form-hook";
import { registrationSchema } from "@/features/auth/schema/auth";
import { createClient } from "@/features/auth/lib/client";
import {
  RegistrationFormValues,
  RegistrationState,
} from "@/features/auth/types/auth";
import {
  parseRegistrationError,
  REGISTRATION_ERROR_MESSAGES,
} from "@/features/auth/utils/auth-error";
import { useMutation } from "@tanstack/react-query";
import { AccountDTO } from "@/features/accounts/types/account-dto";
import { createAccount } from "@/features/accounts/api/account";
import { AxiosError } from "axios";

export function RegistrationForm() {
  const router = useRouter();
  const supabase = createClient();

  const [state, setState] = useState<RegistrationState>({
    error: null,
    needsConfirmation: false,
  });

  const accountMutation = useMutation({
    mutationFn: (data: Pick<AccountDTO, "email" | "password" | "redirectTo">) =>
      createAccount({
        accountDTO: {
          id: "",
          firstName: "",
          lastName: "",
          email: data.email,
          password: data.password,
          roles: [],
          redirectTo: "/apply",
        },
      }),
    onError: (error: AxiosError<{ message: string }>) => {
      return error.response?.data?.message;
    },
  });

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
      setState({ error: null, needsConfirmation: false });

      try {
        await accountMutation.mutateAsync({
          email: value.email,
          password: value.password,
          redirectTo: "/apply",
        });

        setState({ error: null, needsConfirmation: true });
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const message = axiosError.response?.data?.message;

        setState({
          error: parseRegistrationError(message ?? "unknown"),
          needsConfirmation: false,
        });
      }
    },
  });

  if (state.needsConfirmation) {
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
        icon={<span className="mx-1">📧</span>}
        title="HackSMC - Check Your Email"
        titleBarOptions={[<TitleBar.Close key="close" />]}
      >
        <Modal.Content>
          <div className="p-2">
            <Fieldset className="mb-4 p-2" legend="Almost There!">
              <div className="space-y-2 p-1 text-xs leading-normal">
                <p>
                  We sent a confirmation link to{" "}
                  <strong>{form.getFieldValue("email")}</strong>.
                </p>
                <p>
                  Open your inbox, click the link, and you will be all set to
                  apply for HackSMC. Once confirmed,{" "}
                  <Link href="/sign-in" className="text-[#003c74] underline">
                    sign in here
                  </Link>{" "}
                  to start your application.
                </p>
                <p>No email? Check your spam folder.</p>
              </div>
            </Fieldset>
          </div>
        </Modal.Content>
      </Modal>
    );
  }

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
      icon={<span className="mx-1">📧</span>}
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

            {state.error && (
              <div className="bg-[#fff0f0] mb-3 px-2 py-1.5 border border-[#8a1f11] text-[#8a1f11] text-xs">
                {REGISTRATION_ERROR_MESSAGES[state.error]}
                {state.error === "email_taken" && (
                  <>
                    {" "}
                    <Link href="/sign-in" className="underline">
                      Sign in instead?
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
                      placeholder="Create a password"
                      type="password"
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <form.FieldError errors={field.state.meta.errors} />
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
