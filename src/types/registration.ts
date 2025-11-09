/**
 * Registration type definitions for Trail Run Ranu Segaran 2025
 */

export type ShirtSize = "" | "S" | "M" | "L" | "XL" | "XXL";

export type Profession = 
  | "" 
  | "student_smp_sma" 
  | "student_university" 
  | "employee" 
  | "entrepreneur" 
  | "civil_servant" 
  | "other";

export type RegistrationChannel = 
  | "" 
  | "community" 
  | "company" 
  | "organization" 
  | "personal";

export type InfoSource = 
  | "" 
  | "friend" 
  | "social_media" 
  | "billboard";

export type YesNoValue = "" | "yes" | "no";

export type Gender = "" | "male" | "female";

export type BloodType = "" | "A" | "B" | "O" | "AB";

export interface FormData {
  email: string;
  phoneNumber: string;
  registeringFor: "self" | "other";
  name: string;
  birthDate: string;
  gender: Gender;
  address: string;
  nationalId: string;
  bibName: string;
  profession: Profession;
  registrationChannel: RegistrationChannel;
  registrationChannelName: string;
  infoSource: InfoSource;
  bloodType: BloodType;
  chronicCondition: YesNoValue;
  underDoctorCare: YesNoValue;
  requiresMedication: YesNoValue;
  experiencedComplications: YesNoValue;
  experiencedFainting: YesNoValue;
  emergencyContactName: string;
  emergencyContactPhone: string;
  shirtSize: ShirtSize;
  agreedToTerm1: boolean;
  agreedToTerm2: boolean;
  agreedToTerm3: boolean;
}

export type FormErrors = Partial<Record<keyof FormData, string>>;

export interface RegistrationStatus {
  isOpen: boolean;
  hasExistingRegistration: boolean;
}
