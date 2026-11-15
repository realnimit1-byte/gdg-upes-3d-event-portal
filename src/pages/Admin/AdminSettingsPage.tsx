import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Database, KeyRound, ShieldCheck } from 'lucide-react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { CHAPTER_INFO } from '../../data/chapter/chapterInfo';
import { validatePassword, validatePasswordConfirmation } from '../../utils/validation';

export const AdminSettingsPage: React.FC = () => {
  const { admin, updateAdminPassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }
    const passErr = validatePassword(newPassword);
    if (passErr) return setError(passErr);

    const confirmErr = validatePasswordConfirmation(newPassword, confirmPassword);
    if (confirmErr) return setError(confirmErr);

    setSaving(true);
    const res = await updateAdminPassword(currentPassword, newPassword);
    setSaving(false);

    if (!res.ok) {
      setError(res.error ?? 'Failed to update administrator password.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg('Local administrator password verifier updated.');
  };

  return (
    <AdminLayout
      title="Administrative Settings"
      subtitle="Manage browser-local organizer credentials and review local storage architecture."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#11121D] border border-white/10 p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#34A853]" />
            <h2 className="font-display text-lg font-semibold text-white">
              Active Local Administrator
            </h2>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between gap-4 py-2 border-b border-white/8">
              <span className="text-slate-400">Organizer Name</span>
              <span className="text-white">{admin?.fullName}</span>
            </div>
            <div className="flex justify-between gap-4 py-2 border-b border-white/8">
              <span className="text-slate-400">Admin Email</span>
              <span className="text-white font-mono-tech">{admin?.email}</span>
            </div>
            <div className="flex justify-between gap-4 py-2 border-b border-white/8">
              <span className="text-slate-400">Storage Mode</span>
              <span className="text-[#3AD4F5] font-semibold">
                Browser-Local (localStorage + sessionStorage)
              </span>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <span className="text-slate-400">Official Chapter</span>
              <span className="text-slate-200 text-right">{CHAPTER_INFO.displayChapterName}</span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handlePasswordChange}
          className="rounded-2xl bg-[#11121D] border border-white/10 p-6 space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-[#3AD4F5]" />
            <h2 className="font-display text-lg font-semibold text-white">
              Update Local Admin Password
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label htmlFor="curr-pass" className="block text-slate-300 mb-1">
                Current Password
              </label>
              <input
                id="curr-pass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
              />
            </div>

            <div>
              <label htmlFor="new-pass" className="block text-slate-300 mb-1">
                New Password (min 8 chars, letter & number)
              </label>
              <input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
              />
            </div>

            <div>
              <label htmlFor="confirm-pass" className="block text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5" role="alert">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{successMsg}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white reg-cta-gradient cursor-pointer disabled:opacity-50"
          >
            {saving ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-[#11121D] border border-white/10 p-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-[#5C67F9]" />
          <h2 className="font-display text-lg font-semibold text-white">
            Browser-Local Storage Boundaries
          </h2>
        </div>
        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5">
          <li>
            Student and administrator accounts store only salted PBKDF2 password verifiers via the Web Crypto API — never plaintext passwords.
          </li>
          <li>
            Events, student profiles, and participant registrations are persisted in this browser&apos;s <code className="font-mono-tech text-[#3AD4F5]">localStorage</code> and active tab sessions in <code className="font-mono-tech text-[#3AD4F5]">sessionStorage</code>.
          </li>
          <li>
            Browser-local storage does not synchronize data across separate devices or browsers and is intended for standalone frontend deployment without an external backend.
          </li>
        </ul>
      </div>
    </AdminLayout>
  );
};
