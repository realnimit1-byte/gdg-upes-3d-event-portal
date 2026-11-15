import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminService } from '../services/adminService/adminService';
import { AuthActionResult, authService } from '../services/authService/authService';
import { STORAGE_KEYS, storageService } from '../services/storageService/storageService';
import { studentService } from '../services/studentService/studentService';
import { AdminAccount, StudentProfile } from '../types';

interface AuthContextValue {
  loading: boolean;
  student: StudentProfile | null;
  admin: AdminAccount | null;
  hasInitializedAdmin: boolean;
  isAdmin: boolean;
  signUpStudent: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<AuthActionResult>;
  signInStudent: (input: { email: string; password: string }) => Promise<AuthActionResult>;
  signOutStudent: () => void;
  updateStudentProfile: (updates: {
    fullName: string;
    phone: string;
    university: string;
    branch: string;
    academicYear: string;
  }) => Promise<AuthActionResult>;
  initializeAdmin: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<AuthActionResult>;
  signInAdmin: (input: { email: string; password: string }) => Promise<AuthActionResult>;
  updateAdminPassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<AuthActionResult>;
  signOutAdmin: () => void;
  refreshAuthState: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [hasInitializedAdmin, setHasInitializedAdmin] = useState(false);

  const syncFromStorage = useCallback(() => {
    const stuSession = authService.getStudentSession();
    const admSession = authService.getAdminSession();
    setStudent(stuSession.student);
    setAdmin(admSession.admin);
    setHasInitializedAdmin(adminService.hasInitializedAdmin());
    setLoading(false);
  }, []);

  useEffect(() => {
    syncFromStorage();
    return storageService.subscribe(
      [
        STORAGE_KEYS.STUDENTS,
        STORAGE_KEYS.STUDENT_SESSION,
        STORAGE_KEYS.ADMIN_ACCOUNT,
        STORAGE_KEYS.ADMIN_SESSION,
      ],
      syncFromStorage,
    );
  }, [syncFromStorage]);

  const signUpStudent: AuthContextValue['signUpStudent'] = async (input) => {
    const res = await authService.signUpStudent(input);
    if (res.ok && res.student) {
      setStudent(res.student);
    }
    return res;
  };

  const signInStudent: AuthContextValue['signInStudent'] = async (input) => {
    const res = await authService.signInStudent(input);
    if (res.ok && res.student) {
      setStudent(res.student);
    }
    return res;
  };

  const signOutStudent = () => {
    authService.signOutStudent();
    setStudent(null);
  };

  const updateStudentProfile: AuthContextValue['updateStudentProfile'] = async (updates) => {
    if (!student) {
      return { ok: false, error: 'Please sign in to update your student profile.' };
    }
    const res = studentService.updateStudentProfile(student.id, updates);
    if (res.ok && res.student) {
      setStudent(res.student);
    }
    return res;
  };

  const initializeAdmin: AuthContextValue['initializeAdmin'] = async (input) => {
    const res = await authService.initializeAdmin(input);
    if (res.ok && res.admin) {
      setAdmin(res.admin);
      setHasInitializedAdmin(true);
    }
    return res;
  };

  const signInAdmin: AuthContextValue['signInAdmin'] = async (input) => {
    const res = await authService.signInAdmin(input);
    if (res.ok && res.admin) {
      setAdmin(res.admin);
    }
    return res;
  };

  const updateAdminPassword: AuthContextValue['updateAdminPassword'] = async (
    currentPassword,
    newPassword,
  ) => {
    if (!admin) {
      return { ok: false, error: 'Administrator session required.' };
    }
    return adminService.updateAdminPassword(admin.id, currentPassword, newPassword);
  };

  const signOutAdmin = () => {
    authService.signOutAdmin();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        student,
        admin,
        hasInitializedAdmin,
        isAdmin: Boolean(admin),
        signUpStudent,
        signInStudent,
        signOutStudent,
        updateStudentProfile,
        initializeAdmin,
        signInAdmin,
        updateAdminPassword,
        signOutAdmin,
        refreshAuthState: syncFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
