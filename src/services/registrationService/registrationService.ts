import {
  BackendRegistrationStatus,
  RegistrationFormState,
  RegistrationRecord,
} from '../../types';
import { generateUniqueId } from '../../utils/crypto';
import {
  normalizeEmail,
  normalizeIndianPhone,
  sanitizeText,
  validateStepOne,
  validateStepTwo,
} from '../../utils/validation';
import { authService } from '../authService/authService';
import { eventService } from '../eventService/eventService';
import { STORAGE_KEYS, storageService } from '../storageService/storageService';

export interface SubmitRegistrationResult {
  ok: boolean;
  record?: RegistrationRecord;
  error?: string;
  isDuplicate?: boolean;
}

export interface AdminRegistrationQuery {
  search?: string;
  eventId?: string;
  status?: BackendRegistrationStatus | 'all';
  sortOrder?: 'desc' | 'asc';
  page?: number;
  pageSize?: number;
}

function readAllRegistrations(): { records: RegistrationRecord[]; error?: string } {
  const res = storageService.readLocalJson<RegistrationRecord[]>(
    STORAGE_KEYS.REGISTRATIONS,
    [],
  );
  if (!res.ok) {
    return { records: [], error: res.error };
  }
  return { records: Array.isArray(res.data) ? res.data : [] };
}

function generateReferenceCode(existingCodes: Set<string>): string {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const candidate = `GDG-UPES-${randomNum}`;
    if (!existingCodes.has(candidate)) {
      return candidate;
    }
  }
  return `GDG-UPES-${Date.now().toString().slice(-6)}`;
}

function filterAndSortRegistrations(
  records: RegistrationRecord[],
  query: Omit<AdminRegistrationQuery, 'page' | 'pageSize'>,
): RegistrationRecord[] {
  let filtered = [...records];

  if (query.eventId && query.eventId !== 'all') {
    filtered = filtered.filter((r) => r.eventId === query.eventId);
  }

  if (query.status && query.status !== 'all') {
    filtered = filtered.filter((r) => r.registrationStatus === query.status);
  }

  const search = query.search?.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.fullName.toLowerCase().includes(search) ||
        r.normalizedEmail.toLowerCase().includes(search) ||
        r.registrationId.toLowerCase().includes(search),
    );
  }

  filtered.sort((a, b) => {
    const tA = new Date(a.registrationTimestamp).getTime();
    const tB = new Date(b.registrationTimestamp).getTime();
    return query.sortOrder === 'asc' ? tA - tB : tB - tA;
  });

  return filtered;
}

export const registrationService = {
  async submitRegistration(
    form: RegistrationFormState,
    openEventIds: string[],
  ): Promise<SubmitRegistrationResult> {
    const { student } = authService.getStudentSession();
    if (!student) {
      return {
        ok: false,
        error: 'Student sign-in is required before confirming registration.',
      };
    }

    const stepOneErrors = validateStepOne(form);
    if (Object.keys(stepOneErrors).length > 0) {
      return {
        ok: false,
        error: Object.values(stepOneErrors)[0] ?? 'Please review your personal details.',
      };
    }

    const stepTwoErrors = validateStepTwo(form, openEventIds);
    if (Object.keys(stepTwoErrors).length > 0) {
      return {
        ok: false,
        error: Object.values(stepTwoErrors)[0] ?? 'Please review your university and event details.',
      };
    }

    // Re-verify event availability and open status directly from eventService
    const { event: targetEvent, error: eventErr } = await eventService.fetchPublicEventById(
      form.eventId,
    );
    if (eventErr) {
      return { ok: false, error: eventErr };
    }
    if (!targetEvent || targetEvent.isPublished === false) {
      return { ok: false, error: 'Selected event could not be found.' };
    }
    if (!targetEvent.registrationOpen) {
      return {
        ok: false,
        error: 'Registration is closed for this event.',
      };
    }
    if (targetEvent.registrationDeadline) {
      const deadlineDate = new Date(`${targetEvent.registrationDeadline}T23:59:59`);
      if (!Number.isNaN(deadlineDate.getTime()) && Date.now() > deadlineDate.getTime()) {
        return {
          ok: false,
          error: `The registration deadline (${targetEvent.registrationDeadline}) for ${targetEvent.name} has passed.`,
        };
      }
    }
    if (targetEvent.feeType === 'paid') {
      return {
        ok: false,
        error:
          'Paid registrations cannot be confirmed without a verified online payment gateway.',
      };
    }

    const { records: existingRecords, error: readErr } = readAllRegistrations();
    if (readErr) {
      return { ok: false, error: readErr };
    }

    const cleanedEmail = normalizeEmail(form.email);

    // Duplicate registration check: Normalized Email + Event ID (active non-cancelled records)
    const duplicate = existingRecords.some(
      (r) =>
        r.eventId === targetEvent.id &&
        normalizeEmail(r.normalizedEmail) === cleanedEmail &&
        r.registrationStatus !== 'cancelled',
    );
    if (duplicate) {
      return {
        ok: false,
        isDuplicate: true,
        error: `This email (${cleanedEmail}) is already registered for ${targetEvent.name}.`,
      };
    }

    // Capacity check against active registrations
    if (targetEvent.capacity !== null) {
      const activeCount = existingRecords.filter(
        (r) => r.eventId === targetEvent.id && r.registrationStatus !== 'cancelled',
      ).length;
      if (activeCount >= targetEvent.capacity) {
        return {
          ok: false,
          error: `Registration capacity (${targetEvent.capacity}) has been reached for ${targetEvent.name}.`,
        };
      }
    }

    const existingCodes = new Set(existingRecords.map((r) => r.registrationId));
    const resolvedBranch =
      form.branch === 'Other' ? sanitizeText(form.customBranch) : form.branch;

    const newRecord: RegistrationRecord = {
      id: generateUniqueId('reg'),
      registrationId: generateReferenceCode(existingCodes),
      userId: student.id,
      eventId: targetEvent.id,
      eventName: targetEvent.name,
      eventDate: targetEvent.date,
      eventTime: targetEvent.time,
      eventVenue: targetEvent.venue,
      fullName: sanitizeText(form.fullName),
      normalizedEmail: cleanedEmail,
      phoneNumber: normalizeIndianPhone(form.phone),
      university: sanitizeText(form.university),
      branch: resolvedBranch,
      yearOfStudy: form.yearOfStudy,
      feeType: targetEvent.feeType,
      feeAmount: targetEvent.feeAmount,
      registrationTimestamp: new Date().toISOString(),
      registrationStatus: 'confirmed',
      paymentStatus: 'not_required',
    };

    const nextRecords = [newRecord, ...existingRecords];
    const writeRes = storageService.writeLocalJson(STORAGE_KEYS.REGISTRATIONS, nextRecords);
    if (!writeRes.ok) {
      return {
        ok: false,
        error: writeRes.error ?? 'Failed to persist registration in browser storage.',
      };
    }

    // Verify storage actually persisted the new record
    const verifyRes = readAllRegistrations();
    const verified = verifyRes.records.find((r) => r.id === newRecord.id);
    if (!verified) {
      return {
        ok: false,
        error: 'Registration write could not be verified from browser storage.',
      };
    }

    return { ok: true, record: verified };
  },

  async fetchMyRegistrations(): Promise<{ records: RegistrationRecord[]; error?: string }> {
    const { student } = authService.getStudentSession();
    if (!student) {
      return { records: [], error: 'Please sign in to view your registrations.' };
    }

    const { records, error } = readAllRegistrations();
    if (error) return { records: [], error };

    const myRecords = records
      .filter(
        (r) =>
          r.userId === student.id ||
          normalizeEmail(r.normalizedEmail) === normalizeEmail(student.email),
      )
      .sort(
        (a, b) =>
          new Date(b.registrationTimestamp).getTime() -
          new Date(a.registrationTimestamp).getTime(),
      );

    return { records: myRecords };
  },

  async fetchAdminRegistrations(
    query: AdminRegistrationQuery = {},
  ): Promise<{ records: RegistrationRecord[]; totalCount: number; error?: string }> {
    const { admin } = authService.getAdminSession();
    if (!admin) {
      return { records: [], totalCount: 0, error: 'Administrator sign-in required.' };
    }

    const { records, error } = readAllRegistrations();
    if (error) return { records: [], totalCount: 0, error };

    const filtered = filterAndSortRegistrations(records, query);
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, Math.min(100, query.pageSize ?? 20));
    const start = (page - 1) * pageSize;

    return {
      records: filtered.slice(start, start + pageSize),
      totalCount: filtered.length,
    };
  },

  async fetchAllAuthorizedRegistrationsForExport(
    query: Omit<AdminRegistrationQuery, 'page' | 'pageSize'> = {},
  ): Promise<{ records: RegistrationRecord[]; error?: string }> {
    const { admin } = authService.getAdminSession();
    if (!admin) {
      return { records: [], error: 'Administrator sign-in required for CSV export.' };
    }

    const { records, error } = readAllRegistrations();
    if (error) return { records: [], error };

    return { records: filterAndSortRegistrations(records, query) };
  },

  async updateRegistrationStatus(
    registrationUuid: string,
    status: BackendRegistrationStatus,
  ): Promise<{ ok: boolean; error?: string }> {
    const { admin } = authService.getAdminSession();
    if (!admin) {
      return { ok: false, error: 'Administrator sign-in required.' };
    }

    const { records, error } = readAllRegistrations();
    if (error) return { ok: false, error };

    const idx = records.findIndex((r) => r.id === registrationUuid);
    if (idx === -1) {
      return { ok: false, error: 'Registration record not found.' };
    }

    const next = [...records];
    next[idx] = { ...next[idx], registrationStatus: status };

    const writeRes = storageService.writeLocalJson(STORAGE_KEYS.REGISTRATIONS, next);
    if (!writeRes.ok) {
      return { ok: false, error: writeRes.error ?? 'Failed to update registration status.' };
    }
    return { ok: true };
  },

  async fetchAdminDashboardSummary(): Promise<{
    totalRegistrations: number;
    statusBreakdown: Record<BackendRegistrationStatus, number>;
    recentRegistrations: RegistrationRecord[];
    error?: string;
  }> {
    const emptyBreakdown: Record<BackendRegistrationStatus, number> = {
      confirmed: 0,
      waitlisted: 0,
      cancelled: 0,
      checked_in: 0,
    };

    const { admin } = authService.getAdminSession();
    if (!admin) {
      return {
        totalRegistrations: 0,
        statusBreakdown: emptyBreakdown,
        recentRegistrations: [],
        error: 'Administrator sign-in required.',
      };
    }

    const { records, error } = readAllRegistrations();
    if (error) {
      return {
        totalRegistrations: 0,
        statusBreakdown: emptyBreakdown,
        recentRegistrations: [],
        error,
      };
    }

    const breakdown = { ...emptyBreakdown };
    for (const rec of records) {
      if (rec.registrationStatus in breakdown) {
        breakdown[rec.registrationStatus] += 1;
      }
    }

    const sorted = [...records].sort(
      (a, b) =>
        new Date(b.registrationTimestamp).getTime() -
        new Date(a.registrationTimestamp).getTime(),
    );

    return {
      totalRegistrations: records.length,
      statusBreakdown: breakdown,
      recentRegistrations: sorted.slice(0, 6),
    };
  },
};
