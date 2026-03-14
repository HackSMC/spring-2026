import z from "zod";

const fileSchema = z
  .custom<File | null>()
  .refine((f) => f instanceof File, "Please upload a file.");

export const hackerApplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email address."),
  discordUsername: z.string().min(1, "Discord username is required."),
  phoneNumber: z.string().min(1, "Phone number is required."),
  dateOfBirth: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Enter a valid date (MM/DD/YYYY)."),
  gender: z
    .string()
    .refine((v) => v !== "Select...", "Please select a gender."),
  graduationYear: z
    .string()
    .refine((v) => v !== "Select...", "Please select a graduation year."),
  school: z
    .string()
    .refine((v) => v !== "Select...", "Please select a school."),
  residence: z
    .string()
    .refine((v) => v !== "Select...", "Please select a residence."),
  transcript: fileSchema,
  resume: fileSchema,
  agreedToTerms: z.boolean().refine((v) => v === true, "You must agree to the terms."),
});