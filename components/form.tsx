import { useFieldContext } from "@/features/auth/hooks/create-form-hook";
import { Input } from "@react95/core";

export function TextWindow95Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder: string;
}) {
  const field = useFieldContext<string>();
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ marginBottom: 4, fontSize: 11 }}>{label}</div>
      <Input
        type={type}
        value={field.state.value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          field.handleChange(e.target.value)
        }
        onBlur={field.handleBlur}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
}

import { Dropdown } from "@react95/core";
export function DropdownWindow95Field({
  label,
  options,
}: {
  label: string;
  options: { value: string; label: string }[];
}) {
  const field = useFieldContext<string>();
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ marginBottom: 4, fontSize: 11 }}>{label}</div>
      <Dropdown
        options={options.map((o) => o.label)}
        value={field.state.value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          field.handleChange(e.target.value)
        }
        onBlur={field.handleBlur}
        className="w-full"
      />
    </div>
  );
}

import { Checkbox } from "@react95/core";

export function CheckboxWindow95Field({ label }: { label: string }) {
  const field = useFieldContext<boolean>();
  return (
    <div
      style={{
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Checkbox
        checked={field.state.value ?? false}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          field.handleChange(e.target.checked)
        }
        onBlur={field.handleBlur}
      />
      <span style={{ fontSize: 11 }}>{label}</span>
    </div>
  );
}

import { Button } from "@react95/core";

export function SubmitWindow95Button({
  label = "OK",
  disabled = false,
}: {
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
      <Button type="submit" disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

export function FileUploadWindow95Field({
  label,
  accept,
}: {
  label: string;
  accept: string;
}) {
  const field = useFieldContext<File | null>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (field.state.value === null) {
      setFileName("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [field.state.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] ?? null;
    setFileName(file?.name ?? "");
    field.handleChange(file);
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ marginBottom: 4, fontSize: 11 }}>{label}</div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <Input
          readOnly
          value={fileName}
          placeholder="No file selected"
          style={{ flex: 1 }}
          onBlur={field.handleBlur}
        />
        <Button type="button" onClick={() => inputRef.current?.click()}>
          Browse...
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export function FieldError({ errors }: { errors: unknown[] }) {
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
