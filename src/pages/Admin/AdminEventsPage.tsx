import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { eventService, UpsertEventInput } from '../../services/eventService/eventService';
import { STORAGE_KEYS, storageService } from '../../services/storageService/storageService';
import { EventCategory, EventFormat, EventStatus, FeeType, GdgEvent } from '../../types';

const CATEGORIES: EventCategory[] = [
  'AI & ML',
  'Cloud & DevOps',
  'Web & Cohort',
  'Design',
  'Security & Systems',
  'Community & Info',
];

const FORMATS: EventFormat[] = ['In-Person', 'Virtual', 'Hybrid'];
const STATUSES: EventStatus[] = ['upcoming', 'completed'];

const EMPTY_FORM: UpsertEventInput = {
  title: '',
  shortDescription: '',
  description: '',
  category: 'AI & ML',
  eventDate: '',
  eventTime: '',
  venue: 'UPES Bidholi Campus, Dehradun',
  format: 'In-Person',
  status: 'upcoming',
  isPublished: true,
  registrationOpen: true,
  registrationDeadline: '',
  capacity: null,
  feeType: 'free',
  feeAmount: 0,
  officialUrl: '',
};

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<GdgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertEventInput>(EMPTY_FORM);
  const [capacityInput, setCapacityInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const res = await eventService.fetchAdminEvents();
    if (res.error) setError(res.error);
    setEvents(res.events);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadEvents();
    return storageService.subscribe(
      [STORAGE_KEYS.EVENTS, STORAGE_KEYS.REGISTRATIONS],
      () => {
        void loadEvents();
      },
    );
  }, [loadEvents]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCapacityInput('');
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (ev: GdgEvent) => {
    setEditingId(ev.id);
    setForm({
      title: ev.name,
      shortDescription: ev.shortDescription,
      description: ev.description,
      category: ev.category,
      eventDate: ev.date,
      eventTime: ev.time,
      venue: ev.venue,
      format: ev.format,
      status: ev.status,
      isPublished: Boolean(ev.isPublished),
      registrationOpen: ev.registrationOpen,
      registrationDeadline: ev.registrationDeadline ?? '',
      capacity: ev.capacity,
      feeType: ev.feeType,
      feeAmount: ev.feeAmount,
      officialUrl: ev.officialUrl ?? '',
    });
    setCapacityInput(ev.capacity !== null ? String(ev.capacity) : '');
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionMsg(null);

    if (!form.title.trim() || !form.eventDate.trim() || !form.venue.trim()) {
      setError('Title, event date, and venue are required.');
      return;
    }

    const parsedCap = capacityInput.trim() === '' ? null : Math.max(1, Number(capacityInput));
    if (capacityInput.trim() !== '' && Number.isNaN(parsedCap)) {
      setError('Capacity must be a valid positive number or left blank for unlimited.');
      return;
    }

    const payload: UpsertEventInput = {
      ...form,
      shortDescription: form.shortDescription.trim() || form.description.trim().slice(0, 140),
      description: form.description.trim() || form.shortDescription.trim(),
      capacity: parsedCap,
    };

    setSaving(true);
    const res = editingId
      ? await eventService.updateEvent(editingId, payload)
      : await eventService.createEvent(payload);
    setSaving(false);

    if (!res.ok) {
      setError(res.error ?? 'Failed to save event.');
      return;
    }

    setModalOpen(false);
    setActionMsg(editingId ? 'Event updated successfully.' : 'New event created.');
    await loadEvents();
  };

  const handleQuickToggle = async (
    ev: GdgEvent,
    field: 'isPublished' | 'registrationOpen',
  ) => {
    setError(null);
    setActionMsg(null);
    const nextValue = field === 'isPublished' ? !ev.isPublished : !ev.registrationOpen;
    const res = await eventService.updateEvent(ev.id, {
      [field]: nextValue,
    });
    if (!res.ok) {
      setError(res.error ?? 'Unable to update event state.');
      return;
    }
    if (field === 'registrationOpen') {
      setActionMsg(
        nextValue
          ? `Registration opened for "${ev.name}".`
          : `Registration closed for "${ev.name}".`,
      );
    } else {
      setActionMsg(
        nextValue
          ? `"${ev.name}" published to the public site.`
          : `"${ev.name}" unpublished to draft.`,
      );
    }
    await loadEvents();
  };

  const handleDelete = async (eventId: string) => {
    setError(null);
    const res = await eventService.deleteEvent(eventId);
    setConfirmDeleteId(null);
    if (!res.ok) {
      setError(res.error ?? 'Unable to delete event.');
      return;
    }
    setActionMsg('Event deleted.');
    await loadEvents();
  };

  return (
    <AdminLayout
      title="Event Management"
      subtitle="Create upcoming GDG UPES events, toggle publishing & registration gates, and monitor capacity."
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs font-mono-tech text-slate-400">
          {events.length} total event{events.length === 1 ? '' : 's'} configured locally
        </p>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white reg-cta-gradient cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/12 border border-rose-500/35 p-4 text-xs text-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {actionMsg && (
        <div className="rounded-2xl bg-emerald-500/12 border border-emerald-500/30 p-4 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-[#11121D] border border-white/10 p-10 text-center text-xs text-slate-400">
          Loading GDG UPES events...
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl bg-[#11121D] border border-white/10 p-10 text-center space-y-3">
          <p className="font-display text-lg font-semibold text-white">No events configured</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create a new upcoming event using the button above to publish it to the event gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl bg-[#11121D] border border-white/10 p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech mb-2">
                  <span className="text-[#61D9FF]">
                    {ev.category} · {ev.format}
                  </span>
                  <span className="text-slate-300 tabular-nums">
                    {ev.registeredCount ?? 0}
                    {ev.capacity !== null ? ` / ${ev.capacity}` : ''} registered
                  </span>
                </div>

                <h2 className="font-display text-lg font-bold text-white">{ev.name}</h2>
                <p className="mt-1 text-xs text-slate-400 tabular-nums">
                  {ev.date} · {ev.time || 'TBA'} · {ev.venue}
                </p>
                {ev.registrationDeadline && (
                  <p className="mt-1 text-[11px] font-mono-tech text-[#FBBC05] tabular-nums">
                    Registration deadline: {ev.registrationDeadline}
                  </p>
                )}
                <p className="mt-2.5 text-xs text-slate-300 line-clamp-2">
                  {ev.shortDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickToggle(ev, 'isPublished')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                      ev.isPublished
                        ? 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30'
                        : 'bg-[#242631] text-slate-400 border border-white/10'
                    }`}
                  >
                    {ev.isPublished ? 'Published' : 'Unpublished'}
                  </button>
                  <span
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono-tech ${
                      ev.registrationOpen
                        ? 'bg-[#3AD4F5]/10 text-[#3AD4F5] border border-[#3AD4F5]/25'
                        : 'bg-amber-500/10 text-[#FBBC05] border border-amber-500/25'
                    }`}
                  >
                    {ev.registrationOpen ? 'Registration Open' : 'Registration Closed'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickToggle(ev, 'registrationOpen')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                      ev.registrationOpen
                        ? 'bg-rose-500/15 text-rose-200 border border-rose-500/30 hover:bg-rose-500/25'
                        : 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 hover:bg-[#34A853]/25'
                    }`}
                  >
                    {ev.registrationOpen ? 'Close Registration' : 'Open Registration'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(ev)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  {confirmDeleteId === ev.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-slate-300 bg-white/5 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(ev.id)}
                      aria-label={`Delete ${ev.name}`}
                      className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-500/15 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#11121D] border border-white/15 p-6 sm:p-8 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">
                {editingId ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Build with AI Workshop 2026"
                  className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value as EventCategory }))
                    }
                    className="w-full rounded-xl bg-[#242631] border border-white/10 px-3 py-2.5 text-sm text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Format</label>
                  <select
                    value={form.format}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, format: e.target.value as EventFormat }))
                    }
                    className="w-full rounded-xl bg-[#242631] border border-white/10 px-3 py-2.5 text-sm text-white"
                  >
                    {FORMATS.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Lifecycle Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as EventStatus }))
                    }
                    className="w-full rounded-xl bg-[#242631] border border-white/10 px-3 py-2.5 text-sm text-white"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Date *</label>
                  <input
                    type="text"
                    required
                    value={form.eventDate}
                    onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                    placeholder="e.g., May 18, 2026"
                    className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={form.eventTime}
                    onChange={(e) => setForm((f) => ({ ...f, eventTime: e.target.value }))}
                    placeholder="e.g., 10:00 AM IST"
                    className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Capacity (blank = unlimited)</label>
                  <input
                    type="number"
                    min={1}
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={form.venue}
                    onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                    className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Reg. Deadline</label>
                  <input
                    type="date"
                    value={form.registrationDeadline ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, registrationDeadline: e.target.value }))
                    }
                    className="w-full rounded-xl bg-[#242631] border border-white/10 px-3 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Fee Type</label>
                  <select
                    value={form.feeType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, feeType: e.target.value as FeeType }))
                    }
                    className="w-full rounded-xl bg-[#242631] border border-white/10 px-3 py-2.5 text-sm text-white"
                  >
                    <option value="free">Free (₹0)</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {form.feeType === 'paid' && (
                <div>
                  <label className="block text-slate-300 mb-1">Fee Amount (INR)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.feeAmount}
                    onChange={(e) => setForm((f) => ({ ...f, feeAmount: Number(e.target.value) }))}
                    className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1">Short Description</label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                  placeholder="Concise summary for event cards"
                  className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Detailed session agenda, prerequisites, and takeaways"
                  className="w-full rounded-xl bg-[#242631] border border-white/10 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                    className="rounded"
                  />
                  Published on Public Website
                </label>

                <label className="inline-flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.registrationOpen}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, registrationOpen: e.target.checked }))
                    }
                    className="rounded"
                  />
                  Registration Open
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white reg-cta-gradient cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
