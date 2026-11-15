import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, CheckCircle2, Clock, RefreshCw, Users } from 'lucide-react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { eventService } from '../../services/eventService/eventService';
import { registrationService } from '../../services/registrationService/registrationService';
import { STORAGE_KEYS, storageService } from '../../services/storageService/storageService';
import { BackendRegistrationStatus, GdgEvent, RegistrationRecord } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [events, setEvents] = useState<GdgEvent[]>([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [statusBreakdown, setStatusBreakdown] = useState<Record<BackendRegistrationStatus, number>>({
    confirmed: 0,
    waitlisted: 0,
    cancelled: 0,
    checked_in: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [eventsRes, summaryRes] = await Promise.all([
      eventService.fetchAdminEvents(),
      registrationService.fetchAdminDashboardSummary(),
    ]);
    if (eventsRes.error || summaryRes.error) {
      setError(eventsRes.error ?? summaryRes.error ?? 'Failed to load dashboard metrics.');
    }
    setEvents(eventsRes.events);
    setTotalRegistrations(summaryRes.totalRegistrations);
    setStatusBreakdown(summaryRes.statusBreakdown);
    setRecentRegistrations(summaryRes.recentRegistrations);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
    return storageService.subscribe(
      [STORAGE_KEYS.EVENTS, STORAGE_KEYS.REGISTRATIONS],
      () => {
        void loadDashboard();
      },
    );
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const published = events.filter((e) => e.isPublished).length;
    const upcoming = events.filter((e) => e.status === 'upcoming').length;
    const open = events.filter((e) => e.isPublished && e.registrationOpen).length;
    return { published, upcoming, open };
  }, [events]);

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Live browser-local metrics across GDG on Campus UPES events, capacity, and participant registrations."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white reg-cta-gradient"
          >
            Manage Events
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/admin/participants"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-[#242631] hover:bg-[#30313E] border border-white/10"
          >
            View All Participants
          </Link>
        </div>

        <button
          type="button"
          onClick={() => {
            void loadDashboard();
          }}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-[#11121D] border border-white/10 hover:text-white cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/12 border border-rose-500/35 p-4 text-xs text-rose-200">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl bg-[#11121D] border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Registrations</span>
            <Users className="w-4 h-4 text-[#3AD4F5]" />
          </div>
          <p className="font-display text-3xl font-bold text-white tabular-nums">
            {loading ? '—' : totalRegistrations}
          </p>
          <p className="text-[11px] text-slate-400">Locally stored entries</p>
        </div>

        <div className="rounded-2xl bg-[#11121D] border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Published Events</span>
            <Calendar className="w-4 h-4 text-[#5C67F9]" />
          </div>
          <p className="font-display text-3xl font-bold text-white tabular-nums">
            {loading ? '—' : metrics.published}
          </p>
          <p className="text-[11px] text-slate-400">Of {events.length} total stored events</p>
        </div>

        <div className="rounded-2xl bg-[#11121D] border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Upcoming Events</span>
            <Clock className="w-4 h-4 text-[#FBBC05]" />
          </div>
          <p className="font-display text-3xl font-bold text-white tabular-nums">
            {loading ? '—' : metrics.upcoming}
          </p>
          <p className="text-[11px] text-slate-400">{metrics.open} open for registration</p>
        </div>

        <div className="rounded-2xl bg-[#11121D] border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Confirmed / Checked In</span>
            <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
          </div>
          <p className="font-display text-3xl font-bold text-[#34A853] tabular-nums">
            {loading ? '—' : statusBreakdown.confirmed + statusBreakdown.checked_in}
          </p>
          <p className="text-[11px] text-slate-400">
            {statusBreakdown.waitlisted} waitlisted · {statusBreakdown.cancelled} cancelled
          </p>
        </div>
      </div>

      {/* Status Breakdown + Event-wise Counts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl bg-[#11121D] border border-white/10 p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-white">
            Registration Status Breakdown
          </h2>
          <div className="space-y-3 text-xs">
            {(
              [
                ['Confirmed', statusBreakdown.confirmed, 'bg-[#34A853]'],
                ['Checked In', statusBreakdown.checked_in, 'bg-[#3AD4F5]'],
                ['Waitlisted', statusBreakdown.waitlisted, 'bg-[#FBBC05]'],
                ['Cancelled', statusBreakdown.cancelled, 'bg-rose-500'],
              ] as const
            ).map(([label, count, color]) => {
              const pct = totalRegistrations > 0 ? Math.round((count / totalRegistrations) * 100) : 0;
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>{label}</span>
                    <span className="font-mono-tech tabular-nums text-white">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl bg-[#11121D] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">
              Event-wise Registration Counts
            </h2>
            <Link to="/admin/events" className="text-xs text-[#3AD4F5] hover:text-white">
              Edit Events
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="text-xs text-slate-400">
              No events created in the database yet. Create an upcoming event or run the archive seed script.
            </p>
          ) : (
            <div className="divide-y divide-white/8">
              {events.slice(0, 6).map((ev) => (
                <div key={ev.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{ev.name}</p>
                    <p className="text-slate-400 tabular-nums">
                      {ev.date} · {ev.status} ·{' '}
                      {ev.registrationOpen ? 'Open' : 'Closed'}
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono-tech tabular-nums">
                    <span className="text-sm font-bold text-[#3AD4F5]">
                      {ev.registeredCount ?? 0}
                    </span>
                    {ev.capacity !== null && (
                      <span className="text-slate-400"> / {ev.capacity}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="rounded-2xl bg-[#11121D] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">
            Recent Registrations
          </h2>
          <Link to="/admin/participants" className="text-xs text-[#3AD4F5] hover:text-white">
            Open Participant Directory
          </Link>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400">Loading recent registrations...</p>
        ) : recentRegistrations.length === 0 ? (
          <p className="text-xs text-slate-400">No registrations recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono-tech uppercase">
                  <th className="py-2.5 pr-4">Reference</th>
                  <th className="py-2.5 pr-4">Participant</th>
                  <th className="py-2.5 pr-4">Event</th>
                  <th className="py-2.5 pr-4">Status</th>
                  <th className="py-2.5 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {recentRegistrations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-mono-tech text-[#3AD4F5] tabular-nums whitespace-nowrap">
                      {rec.registrationId}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-white">{rec.fullName}</p>
                      <p className="text-slate-400">{rec.normalizedEmail}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-200">{rec.eventName}</td>
                    <td className="py-3 pr-4 uppercase font-semibold text-[#34A853]">
                      {rec.registrationStatus}
                    </td>
                    <td className="py-3 text-right text-slate-400 tabular-nums whitespace-nowrap">
                      {new Date(rec.registrationTimestamp).toLocaleDateString('en-IN', {
                        dateStyle: 'medium',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
