import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, LogOut, MapPin, Ticket } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { registrationService } from '../../services/registrationService/registrationService';
import { STORAGE_KEYS, storageService } from '../../services/storageService/storageService';
import { RegistrationRecord } from '../../types';

export const StudentRegistrationsPage: React.FC = () => {
  const { signOutStudent } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    const res = await registrationService.fetchMyRegistrations();
    setRecords(res.records);
    setError(res.error ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadRegistrations();
    return storageService.subscribe([STORAGE_KEYS.REGISTRATIONS], () => {
      void loadRegistrations();
    });
  }, [loadRegistrations]);

  const handleLogout = () => {
    signOutStudent();
    navigate('/student/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#080B18] text-slate-100 relative">
      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Student Dashboard
            </Link>
            <h1 className="font-display text-3xl font-bold text-white">
              My Registration History
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-200 bg-rose-500/12 hover:bg-rose-500/20 border border-rose-500/25 cursor-pointer self-start"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/12 border border-rose-500/35 p-4 text-xs text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-[#11121D] border border-white/10 p-10 text-center text-sm text-slate-400">
            Loading your registration records...
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl bg-[#11121D] border border-white/10 p-10 text-center space-y-4">
            <Ticket className="w-8 h-8 text-[#3AD4F5] mx-auto" />
            <p className="font-display text-lg font-semibold text-white">
              No registrations found for your account
            </p>
            <Link
              to="/events"
              className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold text-white reg-cta-gradient"
            >
              Explore GDG UPES Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl bg-[#11121D]/95 border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono-tech">
                    <span className="text-[#3AD4F5] font-semibold tabular-nums">
                      {rec.registrationId}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="uppercase text-[#34A853] font-semibold">
                      {rec.registrationStatus}
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {rec.eventName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#4285F4]" />
                      <span className="tabular-nums">{rec.eventDate}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#34A853]" />
                      <span>{rec.eventVenue}</span>
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 md:text-right">
                  <p className="text-slate-200 font-medium">{rec.fullName}</p>
                  <p>
                    {rec.university} · {rec.branch}
                  </p>
                  <p className="tabular-nums">
                    Registered{' '}
                    {new Date(rec.registrationTimestamp).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
