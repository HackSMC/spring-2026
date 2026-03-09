"use client";
import { useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Dropdown,
  Fieldset,
  Frame,
  Input,
  Modal,
  TitleBar,
} from "@react95/core";

const genderOptions = [
  "Select...",
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
  "Other",
] as const;
const gradYearOptions = [
  "Select...",
  ...Array.from({ length: 7 }, (_, i) => 2025 + i),
] as const;
const residenceOptions = [
  "Select...",
  "On Campus",
  "Off Campus",
  "Commuter",
  "Remote",
] as const;
const schoolOptions = [
  "Select...",
  "School A",
  "School B",
  "School C",
] as const;

type GenderOption = (typeof genderOptions)[number];
type GradYearOption = (typeof gradYearOptions)[number];
type ResidenceOption = (typeof residenceOptions)[number];
type SchoolOption = (typeof schoolOptions)[number];

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

interface FileUploadFieldProps {
  label: string;
  accept: string;
}

function FileUploadField({ label, accept }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFileName(e.target.files?.[0]?.name ?? "");
  };

  return (
    <Field label={label}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <Input
          readOnly
          value={fileName}
          placeholder="No file selected"
          style={{ flex: 1 }}
        />
        <Button onClick={() => inputRef.current?.click()}>Browse...</Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={handleChange}
        />
      </div>
    </Field>
  );
}

export function HackerApplicationForm() {
  const [gender, setGender] = useState<GenderOption>("Select...");
  const [gradYear, setGradYear] = useState<GradYearOption>("Select...");
  const [school, setSchool] = useState<SchoolOption>("Select...");
  const [residence, setResidence] = useState<ResidenceOption>("Select...");
  const [agreed, setAgreed] = useState<boolean>(false);

  const handleChange =
    <T extends string | number>(
      setter: React.Dispatch<React.SetStateAction<T>>,
    ) =>
    (e: React.ChangeEvent<HTMLSelectElement>): void => {
      setter(e.target.value as T);
    };

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
      title="Hackathon 2025 — Registration"
      titleBarOptions={[<TitleBar.Close key="close" />]}
    >
      <Modal.Content>
        <div className="p-2">
          <Fieldset
            className="p-2"
            legend="Information"
            style={{ marginBottom: 16 }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
            vehicula ipsum sit amet ipsum dignissim molestie. Suspendisse
            potenti. Maecenas volutpat lorem sed enim vehicula rutrum. Cras
            iaculis aliquet arcu ut cursus. Etiam ligula mi, vulputate nec
            efficitur non, molestie ut ligula. Vestibulum dictum neque ut nisl
            convallis dictum. Cras fringilla posuere fermentum. Cras dignissim
            ullamcorper nisi et vehicula. Mauris non blandit risus. Vestibulum
            id lorem risus. Vivamus ex nisl, tristique sed dolor quis, fringilla
            congue elit. Praesent nec velit tortor. Praesent rutrum in nisi id
            feugiat. Mauris et augue et ex imperdiet rutrum eget vitae leo.
            Aenean sit amet rhoncus turpis, sit amet rutrum nibh.
          </Fieldset>
          <Fieldset
            className="p-2"
            legend="Personal Info"
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <Field label="First Name">
                <Input placeholder="Jane" style={{ width: "100%" }} />
              </Field>
              <Field label="Last Name">
                <Input placeholder="Doe" style={{ width: "100%" }} />
              </Field>
            </div>

            <Field label="Email">
              <Input placeholder="jane@example.com" style={{ width: "100%" }} />
            </Field>

            <Field label="Discord Username">
              <Input placeholder="jane#1234" style={{ width: "100%" }} />
            </Field>

            <Field label="Phone Number">
              <Input
                placeholder="+1 (555) 000-0000"
                style={{ width: "100%" }}
              />
            </Field>

            <div style={{ display: "flex", gap: 8 }}>
              <Field label="Date of Birth">
                <Input placeholder="MM/DD/YYYY" style={{ width: "100%" }} />
              </Field>
              <Field label="Gender">
                <Dropdown
                  options={[...genderOptions]}
                  value={gender}
                  onChange={handleChange(setGender)}
                  style={{ width: "100%" }}
                />
              </Field>
            </div>
          </Fieldset>

          <Fieldset
            className="p-2"
            legend="Academic Info"
            style={{ marginBottom: 16 }}
          >
            <Field label="Graduation Year">
              <Dropdown
                options={[...gradYearOptions]}
                value={gradYear}
                onChange={handleChange(setGradYear)}
                style={{ width: "100%" }}
              />
            </Field>

            <Field label="School">
              <Dropdown
                options={[...schoolOptions]}
                value={school}
                onChange={handleChange(setSchool)}
                style={{ width: "100%" }}
              />
            </Field>

            <Field label="Residence">
              <Dropdown
                options={[...residenceOptions]}
                value={residence}
                onChange={handleChange(setResidence)}
                style={{ width: "100%" }}
              />
            </Field>
          </Fieldset>

          <Fieldset
            className="p-2"
            legend="Documents"
            style={{ marginBottom: 16 }}
          >
            <FileUploadField label="CC Transcript (PDF)" accept=".pdf" />
            <FileUploadField
              label="Resume (PDF / Word)"
              accept=".pdf,.doc,.docx"
            />
          </Fieldset>

          <Frame variant="outside" style={{ height: 2, margin: "12px 0" }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Checkbox
              checked={agreed}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAgreed(e.target.checked)
              }
              label="I agree to the terms and conditions"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button>Reset</Button>
            <Button disabled={!agreed}>Submit Application</Button>
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}

export function SubmittedView() {
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
      <Button>← Back to Form</Button>
    </Modal>
  );
}
