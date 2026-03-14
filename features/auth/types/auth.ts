export interface RegistrationFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegistrationState {
  error: RegistrationError | null;
  needsConfirmation: boolean;
}

export interface LoginState {
  error: LoginError | null;
}

export type RegistrationError =
  | "email_taken"
  | "weak_password"
  | "rate_limit"
  | "unknown";

export type LoginError =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "rate_limit"
  | "unknown";