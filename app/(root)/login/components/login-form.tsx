"use client";

import Link from "next/link";
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

export function LoginForm() {
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
        <div className="p-2">
          <Fieldset
            className="p-2"
            legend="Welcome Back"
            style={{ marginBottom: 16 }}
          >
            <div style={{ padding: 4, fontSize: 12, lineHeight: 1.5 }}>
              Sign in to check your application, view important updates, and
              continue your HackSMC journey.
            </div>
          </Fieldset>

          <Fieldset
            className="p-2"
            legend="Account Info"
            style={{ marginBottom: 16 }}
          >
            <Field label="Email">
              <Input placeholder="jane@example.com" style={{ width: "100%" }} />
            </Field>

            <Field label="Password">
              <Input
                placeholder="Enter your password"
                style={{ width: "100%" }}
                type="password"
              />
            </Field>
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
              href="/registration"
              style={{
                fontSize: 12,
                color: "#003c74",
                textDecoration: "underline",
              }}
            >
              Create an account
            </Link>

            <Button>Login</Button>
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}
