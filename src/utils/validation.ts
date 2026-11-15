import { BranchOption, RegistrationFormState, RegistrationValidationErrors, YearOfStudyOption } from '../types';

export const BRANCH_OPTIONS: BranchOption[] = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Other Engineering',
  'Business / Management',
  'Other',
];

export const YEAR_OF_STUDY_OPTIONS: YearOfStudyOption[] = [
  'First Year',
  'Second Year',
  'Third Year',
  'Fourth Year',
  'Fifth Year / Other',
];

export function sanitizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Strips spaces, hyphens, parentheses, and optional +91 / leading 0 country formatting
 * so a user typing "98765 43210" or "+91 98765-43210" gets a clean 10-digit Indian mobile number.
 */
export function normalizeIndianPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function validateFullName(name: string): string | undefined {
  const cleaned = sanitizeText(name);
  if (!cleaned) {
    return 'Full name is required.';
  }
  if (cleaned.length < 2) {
    return 'Please enter at least 2 characters for your full name.';
  }
  if (cleaned.length > 80) {
    return 'Full name must be 80 characters or fewer.';
  }
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u.test(cleaned)) {
    return 'Please enter a valid name using letters, spaces, apostrophes, periods, or hyphens.';
  }
  return undefined;
}

export function validateEmail(email: string): string | undefined {
  const cleaned = normalizeEmail(email);
  if (!cleaned) {
    return 'Email address is required.';
  }
  const emailRegex = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;
  if (!emailRegex.test(cleaned) || cleaned.length > 120) {
    return 'Please enter a valid email address (for example, name@upes.ac.in).';
  }
  return undefined;
}

export function validatePhone(phone: string): string | undefined {
  if (!phone.trim()) {
    return 'Phone number is required.';
  }
  const normalized = normalizeIndianPhone(phone);
  if (!/^[6-9]\d{9}$/.test(normalized)) {
    return 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include at least one letter and one number.';
  }
  return undefined;
}

export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return undefined;
}

export function validateStepOne(form: RegistrationFormState): RegistrationValidationErrors {
  const errors: RegistrationValidationErrors = {};
  const nameErr = validateFullName(form.fullName);
  const emailErr = validateEmail(form.email);
  const phoneErr = validatePhone(form.phone);

  if (nameErr) errors.fullName = nameErr;
  if (emailErr) errors.email = emailErr;
  if (phoneErr) errors.phone = phoneErr;
  return errors;
}

export function validateStepTwo(
  form: RegistrationFormState,
  openEventIds: string[],
): RegistrationValidationErrors {
  const errors: RegistrationValidationErrors = {};

  if (!sanitizeText(form.university) || sanitizeText(form.university).length < 2) {
    errors.university = 'Please enter your university or college name.';
  }
  if (!form.branch) {
    errors.branch = 'Please select your branch or course.';
  } else if (form.branch === 'Other' && sanitizeText(form.customBranch).length < 2) {
    errors.customBranch = 'Please specify your branch or course.';
  }
  if (!form.yearOfStudy) {
    errors.yearOfStudy = 'Please select your year of study.';
  }
  if (!form.eventId) {
    errors.eventId =
      openEventIds.length === 0
        ? 'No events are currently open for registration on the GDG UPES schedule.'
        : 'Please select an open GDG UPES event.';
  } else if (!openEventIds.includes(form.eventId)) {
    errors.eventId = 'The selected event is not currently open for registration.';
  }

  return errors;
}
