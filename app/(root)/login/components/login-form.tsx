"use client";

import Link from "next/link";
import { Button, Fieldset, Input, Modal, TitleBar } from "@react95/core";
import { Field } from "@/components/form";

export function LoginForm() {
  // mark for replacement with tanstack-form and zod
  return (
    <Modal
      className="flex w-xl max-w-[calc(100vw-2rem)]"
      dragOptions={{ disabled: true }}
      // Modal styles kept inline per instructions
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
          <Fieldset className="mb-4 p-2" legend="Welcome Back">
            <div className="p-1 text-xs leading-normal">
              Sign in to check your application, view important updates, and
              continue your HackSMC journey.
            </div>
          </Fieldset>

          <Fieldset className="mb-4 p-2" legend="Account Info">
            <Field label="Email">
              <Input placeholder="jane@example.com" className="w-full" />
            </Field>

            <Field label="Password">
              <Input
                placeholder="Enter your password"
                className="w-full"
                type="password"
              />
            </Field>
          </Fieldset>

          <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
            <Link
              href="/registration"
              className="text-[#003c74] text-xs underline"
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
