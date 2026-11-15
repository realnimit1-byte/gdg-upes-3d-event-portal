import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  LogOut,
  MapPin,
  Ticket,
  UserCheck,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { eventService } from '../../services/eventService/eventService';
import { registrationService } from '../../services/registrationService/registrationService';
import { STORAGE_KEYS, storageService } from '../../services/storageService/storageService';
import { GdgEvent, RegistrationRecord } from '../../types';
import { BRANCH_OPTIONS, YEAR_OF_STUDY_OPTIONS } from '../../utils/validation';

export const StudentDashboardPage: React.FC = () => {
  const { student, updateStudentProfile, signOutStudent } = useAuth();
  const navigate = useNavigate();

  const [openEvents, setOpenEvents] = useState<GdgEvent[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editUniversity, setEditUniversity] = useState('UPES, Dehradun');
  const [editBranch, setEditBranch] = useState('');
  const [editYear, setEditYear] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setEditName(student.fullName || '');
      setEditPhone(student.phone || '');
      setEditUniversity(student.university || 'UPES, Dehradun');
      setEditBranch(student.branch || '');
      setEditYear(student.academicYear || '');
    }
  }, [student]);

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    const [evRes, regRes] = await Promise.all([
      eventService.fetchPublicEvents(),
      registrationService.fetchMyRegistrations(),
    ]);
    if (evRes.error || regRes.error) {
      setDataError(evRes.error ?? regRes.error ?? 'Failed to load dashboard data.');
    }
    setOpenEvents(evRes.openEvents);
    setRegistrations(regRes.records);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    void loadDashboardData();
    return storageService.subscribe(
      [STORAGE_KEYS.EVENTS, STORAGE_KEYS.REGISTRATIONS],
      () => {
        void loadDashboardData();
      },
    );
  }, [loadDashboardData]);

  const registeredEventIds = useMemo(
    () =>
      new Set(
        registrations
          .filter((r) => r.registrationStatus !== 'cancelled')
          .map((r) => r.eventId),
      ),
    [registrations],
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    const res = await updateStudentProfile({
      fullName: editName,
      phone: editPhone,
      university: editUniversity,
      branch: editBranch,
      academicYear: editYear,
    });
    setSavingProfile(false);
    setProfileMessage(
      res.ok ? 'Profile details saved.' : res.error ?? 'Could not update profile.',
    );
  };

  const handleLogout = () => {
    signOutStudent();
    navigate('/student/login', { replace: true });
  };

  const displayName = student?.fullName || student?.email?.split('@')[0] || 'Developer';

  return (
    <div className="min-h-screen bg-[#080B18] text-slate-100 relative">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 15% 15%, rgba(66, 133, 244, 0.14), transparent 40%), radial-gradient(circle at 85% 75%, rgba(117, 92, 255, 0.14), transparent 44%)',
        }}
        aria-hidden="true"
      />
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
        {/* Welcome Header */}
        <div className="rounded-3xl bg-[#11121D]/90 border border-white/12 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="font-mono-tech text-xs tracking-[0.2em] uppercase text-[#61D9FF] mb-2">
              Student Portal · GDG on Campus UPES
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-white">
              Welcome back, {displayName}
            </h1>
            <p className="mt-1.5 text-sm text-slate-300">{student?.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/student/registrations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-100 bg-[#242631] hover:bg-[#30313E] border border-white/12 transition-colors"
            >
              <Ticket className="w-4 h-4 text-[#3AD4F5]" />
              Registration History ({registrations.length})
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-200 bg-rose-500/12 hover:bg-rose-500/20 border border-rose-500/25 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {dataError && (
          <div className="rounded-2xl bg-rose-500/12 border border-rose-500/35 p-4 text-xs text-rose-200">
            {dataError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Open Events & My Registrations */}
          <div className="lg:col-span-8 space-y-8">
            {/* Available Open Events */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-white">
                  Open Events for Registration
                </h2>
                <Link
                  to="/events"
                  className="text-xs font-medium text-[#3AD4F5] hover:text-white"
                >
                  Browse All Events
                </Link>
              </div>

              {loadingData ? (
                <div className="rounded-2xl bg-[#11121D]/85 border border-white/10 p-8 text-center text-xs text-slate-400">
                  Loading published GDG UPES events...
                </div>
              ) : openEvents.length === 0 ? (
                <div className="rounded-2xl bg-[#11121D]/85 border border-white/10 p-8 text-center space-y-2">
                  <p className="font-display text-lg font-semibold text-white">
                    Something exciting is on the horizon.
                  </p>
                  <p className="text-sm text-slate-300">
                    No open upcoming events are currently scheduled. Check back soon or explore our verified chapter archive.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {openEvents.map((ev) => {
                    const alreadyRegistered = registeredEventIds.has(ev.id);
                    return (
                      <div
                        key={ev.id}
                        className="rounded-2xl bg-[#11121D]/90 border border-white/10 p-5 flex flex-col justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-[11px] font-mono-tech text-slate-400 mb-2">
                            <span className="text-[#61D9FF]">{ev.category}</span>
                            <span>·</span>
                            <span>{ev.feeType === 'free' ? '₹0 — Free' : `₹${ev.feeAmount}`}</span>
                          </div>
                          <h3 className="font-display text-lg font-semibold text-white">
                            {ev.name}
                          </h3>
                          <p className="mt-1.5 text-xs text-slate-300 line-clamp-2">
                            {ev.shortDescription}
                          </p>
                          <div className="mt-3 space-y-1 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#4285F4]" />
                              <span className="tabular-nums">
                                {ev.date} · {ev.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#34A853]" />
                              <span>{ev.venue}</span>
                            </div>
                          </div>
                        </div>

                        {alreadyRegistered ? (
                          <span className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#34A853] bg-[#34A853]/12 border border-[#34A853]/25">
                            <CheckCircle2 className="w-4 h-4" />
                            Already Registered
                          </span>
                        ) : (
                          <Link
                            to={`/student/register/${encodeURIComponent(ev.id)}`}
                            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white reg-cta-gradient"
                          >
                            Register Now
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Student's Own Registrations */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-white">
                  My Registered Events
                </h2>
                <Link
                  to="/student/registrations"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#3AD4F5] hover:text-white"
                >
                  Full History
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingData ? (
                <div className="rounded-2xl bg-[#11121D]/85 border border-white/10 p-8 text-center text-xs text-slate-400">
                  Loading your registrations...
                </div>
              ) : registrations.length === 0 ? (
                <div className="rounded-2xl bg-[#11121D]/85 border border-white/10 p-8 text-center space-y-2">
                  <Ticket className="w-7 h-7 text-[#3AD4F5] mx-auto" />
                  <p className="font-display text-base font-semibold text-white">
                    No registrations yet
                  </p>
                  <p className="text-xs text-slate-300">
                    When you register for an open GDG UPES event, your reference ID and pass details will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.slice(0, 4).map((reg) => (
                    <div
                      key={reg.id}
                      className="rounded-2xl bg-[#11121D]/90 border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-mono-tech text-xs font-semibold text-[#3AD4F5] tabular-nums">
                          {reg.registrationId}
                        </p>
                        <h3 className="font-display text-base font-semibold text-white mt-0.5">
                          {reg.eventName}
                        </h3>
                        <p className="text-xs text-slate-400 tabular-nums mt-0.5">
                          {reg.eventDate} · {reg.eventVenue}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#34A853]">
                          {reg.registrationStatus}
                        </span>
                        <p className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                          {new Date(reg.registrationTimestamp).toLocaleDateString('en-IN', {
                            dateStyle: 'medium',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Personal Profile */}
          <div className="lg:col-span-4">
            <form
              onSubmit={handleSaveProfile}
              className="rounded-2xl bg-[#11121D]/90 border border-white/12 p-6 space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-[#3AD4F5]" />
                <h2 className="font-display text-lg font-semibold text-white">
                  Personal Profile
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Your saved details automatically pre-fill Step 1 & Step 2 when registering for events.
              </p>

              <div>
                <label htmlFor="prof-name" className="block text-xs text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="prof-phone" className="block text-xs text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  id="prof-phone"
                  type="tel"
                  placeholder="10-digit mobile"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="prof-uni" className="block text-xs text-slate-300 mb-1">
                  University / College
                </label>
                <input
                  id="prof-uni"
                  type="text"
                  value={editUniversity}
                  onChange={(e) => setEditUniversity(e.target.value)}
                  className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="prof-branch" className="block text-xs text-slate-300 mb-1">
                  Branch / Course
                </label>
                <select
                  id="prof-branch"
                  value={BRANCH_OPTIONS.includes(editBranch as never) ? editBranch : ''}
                  onChange={(e) => setEditBranch(e.target.value)}
                  className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                >
                  <option value="">Select Branch</option>
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prof-year" className="block text-xs text-slate-300 mb-1">
                  Year of Study
                </label>
                <select
                  id="prof-year"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                >
                  <option value="">Select Year</option>
                  {YEAR_OF_STUDY_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {profileMessage && <p className="text-xs text-[#3AD4F5]">{profileMessage}</p>}

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white reg-cta-gradient cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? 'SAVING...' : 'SAVE PROFILE'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
