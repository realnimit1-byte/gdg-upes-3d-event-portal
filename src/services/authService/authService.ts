import { AdminAccount, PortalSession, StudentProfile } from '../../types';
import { adminService } from '../adminService/adminService';
import { STORAGE_KEYS, storageService } from '../storageService/storageService';
import { studentService } from '../studentService/studentService';

export interface AuthActionResult {
  ok: boolean;
  error?: string;
}

export const authService = {
  getStudentSession(): { session: PortalSession | null; student: StudentProfile | null } {
    const res = storageService.readSessionJson<PortalSession | null>(
      STORAGE_KEYS.STUDENT_SESSION,
      null,
    );
    if (!res.ok || !res.data?.userId) {
      return { session: null, student: null };
    }
    const student = studentService.getStudentById(res.data.userId);
    if (!student) {
      storageService.removeSessionItem(STORAGE_KEYS.STUDENT_SESSION);
      return { session: null, student: null };
    }
    return { session: res.data, student };
  },

  getAdminSession(): { session: PortalSession | null; admin: AdminAccount | null } {
    const res = storageService.readSessionJson<PortalSession | null>(
      STORAGE_KEYS.ADMIN_SESSION,
      null,
    );
    if (!res.ok || !res.data?.userId) {
      return { session: null, admin: null };
    }
    const admin = adminService.getAdminById(res.data.userId);
    if (!admin) {
      storageService.removeSessionItem(STORAGE_KEYS.ADMIN_SESSION);
      return { session: null, admin: null };
    }
    return { session: res.data, admin };
  },

  async signUpStudent(input: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<AuthActionResult & { student?: StudentProfile }> {
    const res = await studentService.createStudentAccount(input);
    if (!res.ok || !res.student) {
      return { ok: false, error: res.error ?? 'Unable to create student account.' };
    }

    const sessionWrite = storageService.writeSessionJson<PortalSession>(
      STORAGE_KEYS.STUDENT_SESSION,
      {
        userId: res.student.id,
        email: res.student.email,
        issuedAt: new Date().toISOString(),
      },
    );

    if (!sessionWrite.ok) {
      return {
        ok: false,
        error: sessionWrite.error ?? 'Account created, but session could not be initialized.',
      };
    }

    return { ok: true, student: res.student };
  },

  async signInStudent(input: {
    email: string;
    password: string;
  }): Promise<AuthActionResult & { student?: StudentProfile }> {
    const res = await studentService.verifyStudentCredentials(input.email, input.password);
    if (!res.ok || !res.student) {
      return { ok: false, error: res.error ?? 'Invalid email address or password.' };
    }

    const sessionWrite = storageService.writeSessionJson<PortalSession>(
      STORAGE_KEYS.STUDENT_SESSION,
      {
        userId: res.student.id,
        email: res.student.email,
        issuedAt: new Date().toISOString(),
      },
    );

    if (!sessionWrite.ok) {
      return {
        ok: false,
        error: sessionWrite.error ?? 'Unable to persist student session in sessionStorage.',
      };
    }

    return { ok: true, student: res.student };
  },

  signOutStudent(): void {
    storageService.removeSessionItem(STORAGE_KEYS.STUDENT_SESSION);
  },

  async initializeAdmin(input: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<AuthActionResult & { admin?: AdminAccount }> {
    const res = await adminService.initializeLocalAdmin(input);
    if (!res.ok || !res.admin) {
      return { ok: false, error: res.error ?? 'Unable to initialize administrator account.' };
    }

    const sessionWrite = storageService.writeSessionJson<PortalSession>(
      STORAGE_KEYS.ADMIN_SESSION,
      {
        userId: res.admin.id,
        email: res.admin.email,
        issuedAt: new Date().toISOString(),
      },
    );

    if (!sessionWrite.ok) {
      return {
        ok: false,
        error: sessionWrite.error ?? 'Admin initialized, but session could not be stored.',
      };
    }

    return { ok: true, admin: res.admin };
  },

  async signInAdmin(input: {
    email: string;
    password: string;
  }): Promise<AuthActionResult & { admin?: AdminAccount }> {
    const res = await adminService.verifyAdminCredentials(input.email, input.password);
    if (!res.ok || !res.admin) {
      return { ok: false, error: res.error ?? 'Invalid administrator credentials.' };
    }

    const sessionWrite = storageService.writeSessionJson<PortalSession>(
      STORAGE_KEYS.ADMIN_SESSION,
      {
        userId: res.admin.id,
        email: res.admin.email,
        issuedAt: new Date().toISOString(),
      },
    );

    if (!sessionWrite.ok) {
      return {
        ok: false,
        error: sessionWrite.error ?? 'Unable to store administrator session.',
      };
    }

    return { ok: true, admin: res.admin };
  },

  signOutAdmin(): void {
    storageService.removeSessionItem(STORAGE_KEYS.ADMIN_SESSION);
  },
};
