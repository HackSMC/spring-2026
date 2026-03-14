export interface HackerApplicationValues {
  firstName: string;
  lastName: string;
  email: string;
  discordUsername: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  graduationYear: string;
  school: string;
  residence: string;
  transcript: File | null;
  resume: File | null;
  agreedToTerms: boolean;
}