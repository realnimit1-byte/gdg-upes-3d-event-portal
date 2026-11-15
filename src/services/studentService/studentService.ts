import { StoredStudentRecord, StudentProfile } from '../../types';
import {
  derivePasswordVerifier,
  generateSaltHex,
  generateUniqueId,
  verifyPasswordVerifier,
} from '../../utils/crypto';
import { normalizeEmail, sanitizeText } from '../../utils/validation';
import { STORAGE_KEYS, storageService } from '../storageService/storageService';

function toPublicProfile(record: StoredStudentRecord): StudentProfile {
  return {
    id: record.id,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    university: record.university,
    branch: record.branch,
    academicYear: record.academicYear,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function readAllStudents(): { records: StoredStudentRecord[]; error?: string } {
  const res = storageService.readLocalJson<StoredStudentRecord[]>(STORAGE_KEYS.STUDENTS, []);
  if (!res.ok) {
    return { records: [], error: res.error };
  }
  return { records: Array.isArray(res.data) ? res.data : [] };
}

export const studentService = {
  getStudentById(studentId: string): StudentProfile | null {
    const { records } = readAllStudents();
    const found = records.find((s) => s.id === studentId);
    return found ? toPublicProfile(found) : null;
  },

  getStudentByEmail(email: string): StudentProfile | null {
    const cleaned = normalizeEmail(email);
    const { records } = readAllStudents();
    const found = records.find((s) => normalizeEmail(s.email) === cleaned);
    return found ? toPublicProfile(found) : null;
  },

  async createStudentAccount(input: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<{ ok: boolean; student?: StudentProfile; error?: string }> {
    const { records, error: readErr } = readAllStudents();
    if (readErr) {
      return { ok: false, error: readErr };
    }

    const cleanedEmail = normalizeEmail(input.email);
    const cleanedName = sanitizeText(input.fullName);

    const duplicate = records.some((s) => normalizeEmail(s.email) === cleanedEmail);
    if (duplicate) {
      return {
        ok: false,
        error: 'An account with this email address already exists on this browser. Please sign in instead.',
      };
    }

    try {
      const salt = generateSaltHex(16);
      const passwordVerifier = await derivePasswordVerifier(input.password, salt);
      const now = new Date().toISOString();

      const newRecord: StoredStudentRecord = {
        id: generateUniqueId('stu'),
        fullName: cleanedName,
        email: cleanedEmail,
        phone: '',
        university: 'UPES, Dehradun',
        branch: '',
        academicYear: '',
        salt,
        passwordVerifier,
        createdAt: now,
        updatedAt: now,
      };

      const writeRes = storageService.writeLocalJson(STORAGE_KEYS.STUDENTS, [
        ...records,
        newRecord,
      ]);

      if (!writeRes.ok) {
        return { ok: false, error: writeRes.error ?? 'Failed to save student account.' };
      }

      return { ok: true, student: toPublicProfile(newRecord) };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Unable to create student account.',
      };
    }
  },

  async verifyStudentCredentials(
    email: string,
    password: string,
  ): Promise<{ ok: boolean; student?: StudentProfile; error?: string }> {
    const { records, error: readErr } = readAllStudents();
    if (readErr) {
      return { ok: false, error: readErr };
    }

    const cleanedEmail = normalizeEmail(email);
    const found = records.find((s) => normalizeEmail(s.email) === cleanedEmail);
    if (!found) {
      return { ok: false, error: 'Invalid email address or password.' };
    }

    try {
      const valid = await verifyPasswordVerifier(password, found.salt, found.passwordVerifier);
      if (!valid) {
        return { ok: false, error: 'Invalid email address or password.' };
      }
      return { ok: true, student: toPublicProfile(found) };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Unable to verify student credentials.',
      };
    }
  },

  updateStudentProfile(
    studentId: string,
    updates: {
      fullName: string;
      phone: string;
      university: string;
      branch: string;
      academicYear: string;
    },
  ): { ok: boolean; student?: StudentProfile; error?: string } {
    const { records, error: readErr } = readAllStudents();
    if (readErr) {
      return { ok: false, error: readErr };
    }

    const index = records.findIndex((s) => s.id === studentId);
    if (index === -1) {
      return { ok: false, error: 'Student account record could not be found.' };
    }

    const updated: StoredStudentRecord = {
      ...records[index],
      fullName: sanitizeText(updates.fullName) || records[index].fullName,
      phone: updates.phone.trim(),
      university: sanitizeText(updates.university) || 'UPES, Dehradun',
      branch: sanitizeText(updates.branch),
      academicYear: sanitizeText(updates.academicYear),
      updatedAt: new Date().toISOString(),
    };

    const next = [...records];
    next[index] = updated;

    const writeRes = storageService.writeLocalJson(STORAGE_KEYS.STUDENTS, next);
    if (!writeRes.ok) {
      return { ok: false, error: writeRes.error ?? 'Failed to update student profile.' };
    }

    return { ok: true, student: toPublicProfile(updated) };
  },
};
