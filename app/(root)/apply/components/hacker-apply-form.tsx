// components/hacker-application-form.tsx
"use client";

import { useState } from "react";
import { Button, Fieldset, Frame, Modal, TitleBar } from "@react95/core";
import { useAppForm } from "@/features/auth/hooks/create-form-hook";
import { HackerApplicationValues } from "../types/apply";

const GENDER_OPTIONS = [
  { value: "Select...", label: "Select..." },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
  { value: "Other", label: "Other" },
];

const GRAD_YEAR_OPTIONS = [
  { value: "Select...", label: "Select..." },
  ...Array.from({ length: 7 }, (_, i) => ({
    value: String(2026 + i),
    label: String(2026 + i),
  })),
];

const SCHOOL_OPTIONS = [
  { value: "Select...", label: "Select..." },
  { value: "School A", label: "School A" },
  { value: "School B", label: "School B" },
  { value: "School C", label: "School C" },
];

const RESIDENCE_OPTIONS = [
  { value: "Select...", label: "Select..." },
  { value: "On Campus", label: "On Campus" },
  { value: "Off Campus", label: "Off Campus" },
  { value: "Commuter", label: "Commuter" },
  { value: "Remote", label: "Remote" },
];

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors.length) return null;
  return (
    <div className="pt-0.5 pb-2.5 text-[#8a1f11] text-xs">
      {errors
        .map((e) =>
          typeof e === "string" ? e : (e as { message: string })?.message,
        )
        .filter(Boolean)
        .join(", ")}
    </div>
  );
}

export function HackerApplicationForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      discordUsername: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "Select...",
      graduationYear: "Select...",
      school: "Select...",
      residence: "Select...",
      transcript: null as File | null,
      resume: null as File | null,
      agreedToTerms: false,
    } satisfies HackerApplicationValues,
    onSubmit: async ({ value }) => {
      // TODO: upload files + POST to API / supabase
      console.log("submit", value);
      setSubmitted(true);
    },
  });

  if (submitted) return <SubmittedView onBack={() => setSubmitted(false)} />;

  return (
    <Modal
      className="flex w-xl max-w-xl"
      dragOptions={{ disabled: true }}
      style={{
        position: "relative",
        translate: "none",
        left: "auto",
        top: "auto",
        zIndex: 20,
      }}
      icon={<span>📋</span>}
      title="Hackathon 2026 — Registration"
      titleBarOptions={[<TitleBar.Close key="close" />]}
    >
      <Modal.Content>
        <form.AppForm>
          <div className="p-2">
            <Fieldset
              className="p-2"
              legend="Information"
              style={{ marginBottom: 16 }}
            >
              Lorem ipsum dolor sit amet...
            </Fieldset>

            <Fieldset
              className="p-2"
              legend="Personal Info"
              style={{ marginBottom: 16 }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <form.AppField name="firstName">
                  {(field) => (
                    <div style={{ flex: 1 }}>
                      <field.TextWindow95Field
                        label="First Name"
                        placeholder="Jane"
                      />
                      {field.state.meta.isTouched && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </div>
                  )}
                </form.AppField>
                <form.AppField name="lastName">
                  {(field) => (
                    <div style={{ flex: 1 }}>
                      <field.TextWindow95Field
                        label="Last Name"
                        placeholder="Doe"
                      />
                      {field.state.meta.isTouched && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </div>
                  )}
                </form.AppField>
              </div>

              <form.AppField name="email">
                {(field) => (
                  <>
                    <field.TextWindow95Field
                      label="Email"
                      placeholder="jane@example.com"
                      type="email"
                    />
                    {field.state.meta.isTouched && (
                      <form.FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                )}
              </form.AppField>

              <form.AppField name="discordUsername">
                {(field) => (
                  <>
                    <field.TextWindow95Field
                      label="Discord Username"
                      placeholder="jane#1234"
                    />
                    {field.state.meta.isTouched && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                )}
              </form.AppField>

              <form.AppField name="phoneNumber">
                {(field) => (
                  <>
                    <field.TextWindow95Field
                      label="Phone Number"
                      placeholder="+1 (555) 000-0000"
                    />
                    {field.state.meta.isTouched && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                )}
              </form.AppField>

              <div style={{ display: "flex", gap: 8 }}>
                <form.AppField name="dateOfBirth">
                  {(field) => (
                    <div style={{ flex: 1 }}>
                      <field.TextWindow95Field
                        label="Date of Birth"
                        placeholder="MM/DD/YYYY"
                      />
                      {field.state.meta.isTouched && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </div>
                  )}
                </form.AppField>
                <form.AppField name="gender">
                  {(field) => (
                    <div style={{ flex: 1 }}>
                      <field.DropdownWindow95Field
                        label="Gender"
                        options={GENDER_OPTIONS}
                      />
                      {field.state.meta.isTouched && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </div>
                  )}
                </form.AppField>
              </div>
            </Fieldset>

            <Fieldset
              className="p-2"
              legend="Academic Info"
              style={{ marginBottom: 16 }}
            >
              <form.AppField name="graduationYear">
                {(field) => (
                  <>
                    <field.DropdownWindow95Field
                      label="Graduation Year"
                      options={GRAD_YEAR_OPTIONS}
                    />
                    {field.state.meta.isTouched && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                )}
              </form.AppField>

              <form.AppField name="school">
                {(field) => (
                  <>
                    <field.DropdownWindow95Field
                      label="School"
                      options={SCHOOL_OPTIONS}
                    />
                    {field.state.meta.isTouched && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                )}
              </form.AppField>

              <form.AppField name="residence">
                {(field) => (
                  <>
                    <field.DropdownWindow95Field
                      label="Residence"
                      options={RESIDENCE_OPTIONS}
                    />
                    {field.state.meta.isTouched && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                )}
              </form.AppField>
            </Fieldset>

            <Fieldset
              className="p-2"
              legend="Documents"
              style={{ marginBottom: 16 }}
            >
              <form.AppField name="transcript">
                {(field) => (
                  <>
                    <field.FileUploadWindow95Field
                      label="CC Transcript (PDF)"
                      accept=".pdf"
                    />
                    {field.state.meta.isTouched && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                )}
              </form.AppField>

              <form.AppField name="resume">
                {(field) => (
                  <>
                    <field.FileUploadWindow95Field
                      label="Resume (PDF / Word)"
                      accept=".pdf,.doc,.docx"
                    />
                    {field.state.meta.isTouched && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                )}
              </form.AppField>
            </Fieldset>

            <Frame variant="outside" style={{ height: 2, margin: "12px 0" }} />

            <form.AppField name="agreedToTerms">
              {(field) => (
                <div style={{ marginBottom: 16 }}>
                  <field.CheckboxWindow95Field label="I agree to the terms and conditions" />
                  {field.state.meta.isTouched && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </div>
              )}
            </form.AppField>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button type="button" onClick={() => form.reset()}>
                Reset
              </Button>
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
                    {isSubmitting ? "Submitting..." : "Submit Application"}
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

export function SubmittedView({ onBack }: { onBack: () => void }) {
  return (
    <Modal
      width="460"
      height="auto"
      icon={<span>✓</span>}
      title="Application Submitted"
      titleBarOptions={[<TitleBar.Close key="close" />]}
      style={{ padding: "20px" }}
    >
      <p style={{ fontSize: 13, margin: "0 0 16px" }}>
        Thanks for applying! We've received your application and will be in
        touch via email and Discord soon.
      </p>
      <Button onClick={onBack}>← Back to Form</Button>
    </Modal>
  );
}
