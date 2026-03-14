export interface RegistrationFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationFormProps {
  onSubmit: (
    values: Omit<RegistrationFormValues, "confirmPassword">,
  ) => Promise<void>;
}
