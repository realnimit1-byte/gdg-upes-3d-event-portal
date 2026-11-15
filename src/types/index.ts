export type EventCategory =
  | 'AI & ML'
  | 'Cloud & DevOps'
  | 'Web & Cohort'
  | 'Design'
  | 'Security & Systems'
  | 'Community & Info';

export type EventFormat = 'In-Person' | 'Virtual' | 'Hybrid';

export type EventStatus = 'upcoming' | 'completed';

export type FeeType = 'free' | 'paid';

export type AdminRoleType = 'admin' | 'super_admin';

export type BackendRegistrationStatus =
  | 'confirmed'
  | 'waitlisted'
  | 'cancelled'
  | 'checked_in';

export type PaymentStatus =
  | 'not_required'
  | 'pending_offline'
  | 'paid'
  | 'unavailable';

export interface GdgEvent {
  id: string;
  slug?: string | null;
  name: string;
  description: string;
  shortDescription: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  format: EventFormat;
  status: EventStatus;
  isPublished?: boolean;
  registrationOpen: boolean;
  registrationDeadline?: string;
  feeType: FeeType;
  feeAmount: number;
  capacity: number | null;
  registeredCount?: number;
  officialUrl?: string;
  speakers?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type BranchOption =
  | 'Computer Science & Engineering'
  | 'Electronics & Communication'
  | 'Mechanical Engineering'
  | 'Electrical Engineering'
  | 'Other Engineering'
  | 'Business / Management'
  | 'Other';

export type YearOfStudyOption =
  | 'First Year'
  | 'Second Year'
  | 'Third Year'
  | 'Fourth Year'
  | 'Fifth Year / Other';

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  university: string;
  branch: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredStudentRecord extends StudentProfile {
  salt: string;
  passwordVerifier: string;
}

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  role: AdminRoleType;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAdminRecord extends AdminAccount {
  salt: string;
  passwordVerifier: string;
}

export interface PortalSession {
  userId: string;
  email: string;
  issuedAt: string;
}

export interface RegistrationFormState {
  fullName: string;
  email: string;
  phone: string;
  university: string;
  branch: BranchOption | '';
  customBranch: string;
  yearOfStudy: YearOfStudyOption | '';
  eventId: string;
}

export interface RegistrationRecord {
  id: string;
  registrationId: string; // Human-readable reference code (GDG-UPES-XXXXXX)
  userId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime?: string;
  eventVenue: string;
  fullName: string;
  normalizedEmail: string;
  phoneNumber: string;
  university: string;
  branch: string;
  yearOfStudy: string;
  feeType: FeeType;
  feeAmount: number;
  registrationTimestamp: string;
  registrationStatus: BackendRegistrationStatus;
  paymentStatus: PaymentStatus;
}

export type RegistrationValidationErrors = Partial<
  Record<keyof RegistrationFormState | 'general', string>
>;
