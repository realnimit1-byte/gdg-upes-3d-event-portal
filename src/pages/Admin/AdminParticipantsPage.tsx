import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Search,
  X,
} from 'lucide-react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { eventService } from '../../services/eventService/eventService';
import { registrationService } from '../../services/registrationService/registrationService';
import { STORAGE_KEYS, storageService } from '../../services/storageService/storageService';
import { BackendRegistrationStatus, GdgEvent, RegistrationRecord } from '../../types';
import { downloadRegistrationsCsv } from '../../utils/csvExport';

const PAGE_SIZE = 20;
const STATUS_OPTIONS: BackendRegistrationStatus[] = [
  'confirmed',
  'checked_in',
  'waitlisted',
  'cancelled',
];

export const AdminParticipantsPage: React.FC = () => {
  const [events, setEvents] = useState<GdgEvent[]>([]);
  const [records, setRecords] = useState<RegistrationRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<BackendRegistrationStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  const [selectedParticipant, setSelectedParticipant] = useState<RegistrationRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const loadEvents = () => {
      eventService.fetchAdminEvents().then((res) => {
        setEvents(res.events);
      });
    };
    loadEvents();
    return storageService.subscribe([STORAGE_KEYS.EVENTS], loadEvents);
  }, []);

  const loadParticipants = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await registrationService.fetchAdminRegistrations({
      search: debouncedSearch,
      eventId: eventFilter,
      status: statusFilter,
      sortOrder,
      page,
      pageSize: PAGE_SIZE,
    });
    if (res.error) setError(res.error);
    setRecords(res.records);
    setTotalCount(res.totalCount);
    setLoading(false);
  }, [debouncedSearch, eventFilter, statusFilter, sortOrder, page]);

  useEffect(() => {
    void loadParticipants();
    return storageService.subscribe([STORAGE_KEYS.REGISTRATIONS], () => {
      void loadParticipants();
    });
  }, [loadParticipants]);

  const handleStatusUpdate = async (
    registrationUuid: string,
    nextStatus: BackendRegistrationStatus,
  ) => {
    setUpdatingId(registrationUuid);
    const res = await registrationService.updateRegistrationStatus(registrationUuid, nextStatus);
    setUpdatingId(null);
    if (!res.ok) {
      setError(res.error ?? 'Failed to update registration status.');
      return;
    }
    setRecords((prev) =>
      prev.map((r) =>
        r.id === registrationUuid ? { ...r, registrationStatus: nextStatus } : r,
      ),
    );
    if (selectedParticipant?.id === registrationUuid) {
      setSelectedParticipant((prev) =>
        prev ? { ...prev, registrationStatus: nextStatus } : null,
      );
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    setError(null);
    const res = await registrationService.fetchAllAuthorizedRegistrationsForExport({
      search: debouncedSearch,
      eventId: eventFilter,
      status: statusFilter,
      sortOrder,
    });
    setExporting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    downloadRegistrationsCsv(res.records);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <AdminLayout
      title="Participant Directory"
      subtitle="Search, filter, update check-in status, inspect details, and export authorized registrations to CSV."
    >
      {/* Filters Toolbar */}
      <div className="rounded-2xl bg-[#11121D] border border-white/10 p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search by name, email, or reference code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl bg-[#242631] border border-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-400"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by event"
              className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-xs sm:text-sm text-white"
            >
              <option value="all">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as BackendRegistrationStatus | 'all');
                setPage(1);
              }}
              aria-label="Filter by status"
              className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-xs sm:text-sm text-white"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#242631] hover:bg-[#30313E] border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-200 cursor-pointer whitespace-nowrap"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/8 text-xs">
          <span className="font-mono-tech text-slate-400 tabular-nums">
            Showing {records.length} of {totalCount} participant{totalCount === 1 ? '' : 's'}
          </span>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting || totalCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#5C67F9] hover:bg-[#4e59e8] transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? 'Exporting CSV...' : 'Export Filtered CSV'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/12 border border-rose-500/35 p-4 text-xs text-rose-200">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-[#11121D] border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">
            Loading participant records...
          </div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No participant registrations match the active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#161826] text-slate-400 font-mono-tech uppercase">
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">University / Branch</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-mono-tech text-[#3AD4F5] tabular-nums whitespace-nowrap">
                      {rec.registrationId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-white">{rec.fullName}</p>
                      <p className="text-slate-400">{rec.normalizedEmail}</p>
                      <p className="text-slate-500 tabular-nums">{rec.phoneNumber}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-200">{rec.university}</p>
                      <p className="text-slate-400">
                        {rec.branch} · {rec.yearOfStudy}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-white font-medium">{rec.eventName}</p>
                      <p className="text-slate-400 tabular-nums">{rec.eventDate}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={rec.registrationStatus}
                        disabled={updatingId === rec.id}
                        onChange={(e) =>
                          handleStatusUpdate(rec.id, e.target.value as BackendRegistrationStatus)
                        }
                        aria-label={`Registration status for ${rec.fullName}`}
                        className="rounded-lg bg-[#242631] border border-white/12 px-2.5 py-1.5 text-xs text-white"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedParticipant(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-mono-tech tabular-nums">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#11121D] border border-white/10 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#11121D] border border-white/10 disabled:opacity-40 cursor-pointer"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Participant Detail Modal */}
      {selectedParticipant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedParticipant(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#11121D] border border-white/15 p-6 sm:p-8 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono-tech text-xs text-[#3AD4F5]">
                  {selectedParticipant.registrationId}
                </p>
                <h2 className="font-display text-xl font-bold text-white mt-0.5">
                  {selectedParticipant.fullName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParticipant(null)}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl bg-[#1A1C28] border border-white/10 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Email</span>
                <span className="text-white break-all">{selectedParticipant.normalizedEmail}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Phone</span>
                <span className="text-white tabular-nums">{selectedParticipant.phoneNumber}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">University</span>
                <span className="text-white text-right">{selectedParticipant.university}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Branch & Year</span>
                <span className="text-white text-right">
                  {selectedParticipant.branch} · {selectedParticipant.yearOfStudy}
                </span>
              </div>
              <div className="flex justify-between gap-3 pt-2 border-t border-white/10">
                <span className="text-slate-400">Event</span>
                <span className="text-white font-medium text-right">
                  {selectedParticipant.eventName}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Status</span>
                <span className="text-[#34A853] font-semibold uppercase">
                  {selectedParticipant.registrationStatus}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Payment</span>
                <span className="text-slate-200">{selectedParticipant.paymentStatus}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Submitted</span>
                <span className="text-slate-300 tabular-nums">
                  {new Date(selectedParticipant.registrationTimestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
