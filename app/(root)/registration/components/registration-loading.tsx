"use client";

import { Fieldset, Frame, Modal, TitleBar } from "@react95/core";

interface RegistrationLoadingProps {
  percent: number;
}

export function RegistrationLoading({
  percent,
}: RegistrationLoadingProps) {
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
            legend="Preparing Registration"
            style={{ marginBottom: 16 }}
          >
            <div style={{ padding: 4, fontSize: 12, lineHeight: 1.5 }}>
              Setting up your registration workspace. Please wait a moment.
            </div>
          </Fieldset>

          <Fieldset className="p-2" legend="Progress">
            <div style={{ padding: "4px 4px 10px", fontSize: 12 }}>
              Loading registration form...
            </div>
            <Frame
              boxShadow="$in"
              bgColor="white"
              style={{
                position: "relative",
                width: "100%",
                height: 24,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${percent}%`,
                  background: "#0000a8",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: percent > 50 ? "#fff" : "#000",
                  pointerEvents: "none",
                }}
              >
                {percent}%
              </div>
            </Frame>
          </Fieldset>
        </div>
      </Modal.Content>
    </Modal>
  );
}
