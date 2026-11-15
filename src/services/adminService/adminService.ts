import { AdminAccount, StoredAdminRecord } from '../../types';
import {
  derivePasswordVerifier,
  generateSaltHex,
  generateUniqueId,
  verifyPasswordVerifier,
} from '../../utils/crypto';
import { normalizeEmail, sanitizeText } from '../../utils/validation';
import { STORAGE_KEYS, storageService } from '../storageService/storageService';

function toPublicAdmin(record: StoredAdminRecord): AdminAccount {
  return {
    id: record.id,
    fullName: record.fullName,
    email: record.email,
    role: record.role,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function readStoredAdmin(): { record: StoredAdminRecord | null; error?: string } {
  const res = storageService.readLocalJson<StoredAdminRecord | null>(
    STORAGE_KEYS.ADMIN_ACCOUNT,
    null,
  );
  if (!res.ok) {
    return { record: null, error: res.error };
  }
  return { record: res.data };
}

export const adminService = {
  hasInitializedAdmin(): boolean {
    const { record } = readStoredAdmin();
    return Boolean(record && record.id && record.passwordVerifier);
  },

  getAdminById(adminId: string): AdminAccount | null {
    const { record } = readStoredAdmin();
    if (!record || record.id !== adminId) return null;
    return toPublicAdmin(record);
  },

  async initializeLocalAdmin(input: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<{ ok: boolean; admin?: AdminAccount; error?: string }> {
    const { record: existing, error: readErr } = readStoredAdmin();
    if (readErr) {
      return { ok: false, error: readErr };
    }
    if (existing) {
      return {
        ok: false,
        error: 'A local administrator account is already initialized on this browser. Please sign in.',
      };
    }

    try {
      const salt = generateSaltHex(16);
      const passwordVerifier = await derivePasswordVerifier(input.password, salt);
      const now = new Date().toISOString();

      const adminRecord: StoredAdminRecord = {
        id: generateUniqueId('adm'),
        fullName: sanitizeText(input.fullName) || 'GDG UPES Organizer',
        email: normalizeEmail(input.email),
        role: 'super_admin',
        salt,
        passwordVerifier,
        createdAt: now,
        updatedAt: now,
      };

      const writeRes = storageService.writeLocalJson(STORAGE_KEYS.ADMIN_ACCOUNT, adminRecord);
      if (!writeRes.ok) {
        return { ok: false, error: writeRes.error ?? 'Failed to initialize administrator account.' };
      }

      return { ok: true, admin: toPublicAdmin(adminRecord) };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Unable to initialize local administrator.',
      };
    }
  },

  async verifyAdminCredentials(
    email: string,
    password: string,
  ): Promise<{ ok: boolean; admin?: AdminAccount; error?: string }> {
    const { record, error: readErr } = readStoredAdmin();
    if (readErr) {
      return { ok: false, error: readErr };
    }
    if (!record) {
      return {
        ok: false,
        error: 'No local administrator account has been initialized yet.',
      };
    }

    if (normalizeEmail(email) !== normalizeEmail(record.email)) {
      return { ok: false, error: 'Invalid administrator email or password.' };
    }

    try {
      const valid = await verifyPasswordVerifier(password, record.salt, record.passwordVerifier);
      if (!valid) {
        return { ok: false, error: 'Invalid administrator email or password.' };
      }
      return { ok: true, admin: toPublicAdmin(record) };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Unable to verify administrator credentials.',
      };
    }
  },

  async updateAdminPassword(
    adminId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: boolean; error?: string }> {
    const { record, error: readErr } = readStoredAdmin();
    if (readErr) return { ok: false, error: readErr };
    if (!record || record.id !== adminId) {
      return { ok: false, error: 'Active administrator record not found.' };
    }

    const valid = await verifyPasswordVerifier(currentPassword, record.salt, record.passwordVerifier);
    if (!valid) {
      return { ok: false, error: 'Current password is incorrect.' };
    }

    const salt = generateSaltHex(16);
    const passwordVerifier = await derivePasswordVerifier(newPassword, salt);

    const updated: StoredAdminRecord = {
      ...record,
      salt,
      passwordVerifier,
      updatedAt: new Date().toISOString(),
    };

    const writeRes = storageService.writeLocalJson(STORAGE_KEYS.ADMIN_ACCOUNT, updated);
    if (!writeRes.ok) {
      return { ok: false, error: writeRes.error ?? 'Failed to update password.' };
    }
    return { ok: true };
  },
};
