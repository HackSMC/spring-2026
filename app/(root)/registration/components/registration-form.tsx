"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Fieldset, Input, Modal, TitleBar } from "@react95/core";

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ marginBottom: 4, fontSize: 11 }}>{label}</div>
      {children}
    </div>
  );
}

export function RegistrationForm() {
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
          <Fieldset
            className="p-2"
            legend="Create Account"
            style={{ marginBottom: 16 }}
          >
            <div style={{ padding: 4, fontSize: 12, lineHeight: 1.5 }}>
              Create your account to continue your HackSMC application journey.
            </div>
          </Fieldset>

          <Fieldset
            className="p-2"
            legend="Account Info"
            style={{ marginBottom: 16 }}
          >
            <Field label="Email">
              <Input
                value={email}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(event.target.value)
                }
                placeholder="jane@example.com"
                style={{ width: "100%" }}
              />
            </Field>

            {showEmailStatus ? (
              <div
                style={{
                  fontSize: 12,
                  padding: "2px 0 10px",
                  color: "#8a1f11",
                }}
              >
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
                style={{ width: "100%" }}
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
                style={{ width: "100%" }}
                type="password"
              />
            </Field>

            {showPasswordStatus && !passwordsMatch ? (
              <div
                style={{
                  fontSize: 12,
                  padding: "2px 0 4px",
                  color: "#8a1f11",
                }}
              >
                Passwords do not match yet.
              </div>
            ) : null}
          </Fieldset>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/login"
              style={{
                fontSize: 12,
                color: "#003c74",
                textDecoration: "underline",
              }}
            >
              Back to login
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
