import { PAST_EVENTS_ARCHIVE_CONFIG, UPCOMING_EVENTS_CONFIG } from '../../data/events/eventsConfig';
import {
  EventCategory,
  EventFormat,
  EventStatus,
  FeeType,
  GdgEvent,
  RegistrationRecord,
} from '../../types';
import { generateUniqueId } from '../../utils/crypto';
import { STORAGE_KEYS, storageService } from '../storageService/storageService';

export interface UpsertEventInput {
  title: string;
  shortDescription: string;
  description: string;
  category: EventCategory;
  eventDate: string;
  eventTime: string;
  venue: string;
  format: EventFormat;
  status: EventStatus;
  isPublished: boolean;
  registrationOpen: boolean;
  registrationDeadline?: string;
  capacity: number | null;
  feeType: FeeType;
  feeAmount: number;
  officialUrl?: string;
}

function getActiveRegistrationCounts(): Record<string, number> {
  const regRes = storageService.readLocalJson<RegistrationRecord[]>(
    STORAGE_KEYS.REGISTRATIONS,
    [],
  );
  const rows = regRes.ok && Array.isArray(regRes.data) ? regRes.data : [];
  const counts: Record<string, number> = {};

  for (const row of rows) {
    if (row.registrationStatus === 'cancelled') continue;
    counts[row.eventId] = (counts[row.eventId] ?? 0) + 1;
  }
  return counts;
}

function readStoredCustomEvents(): { events: GdgEvent[]; error?: string } {
  const res = storageService.readLocalJson<GdgEvent[]>(STORAGE_KEYS.EVENTS, []);
  if (!res.ok) {
    return { events: [], error: res.error };
  }
  return { events: Array.isArray(res.data) ? res.data : [] };
}

function mergeEventsWithArchive(customEvents: GdgEvent[]): GdgEvent[] {
  const counts = getActiveRegistrationCounts();
  const customMap = new Map<string, GdgEvent>();

  for (const ev of customEvents) {
    customMap.set(ev.id, {
      ...ev,
      isPublished: ev.isPublished ?? true,
      registeredCount: counts[ev.id] ?? 0,
    });
  }

  // Verified historical archive (merged for display/management; closed by default unless reopened by admin)
  const archiveMerged = PAST_EVENTS_ARCHIVE_CONFIG.map((arch) => {
    const override = customMap.get(arch.id);
    if (override) {
      customMap.delete(arch.id);
      return override;
    }
    return {
      ...arch,
      isPublished: true,
      registeredCount: counts[arch.id] ?? 0,
    };
  });

  // Explicitly created events (plus any UPCOMING_EVENTS_CONFIG entries if configured)
  const createdOrUpcoming: GdgEvent[] = [
    ...Array.from(customMap.values()),
    ...UPCOMING_EVENTS_CONFIG.filter((u) => !customMap.has(u.id)).map((u) => ({
      ...u,
      isPublished: true,
      registeredCount: counts[u.id] ?? 0,
    })),
  ];

  return [...createdOrUpcoming, ...archiveMerged];
}

export const eventService = {
  async fetchPublicEvents(): Promise<{
    upcomingEvents: GdgEvent[];
    pastEvents: GdgEvent[];
    openEvents: GdgEvent[];
    error?: string;
  }> {
    const { events: customEvents, error } = readStoredCustomEvents();
    const merged = mergeEventsWithArchive(customEvents).filter(
      (ev) => ev.isPublished !== false,
    );

    const nowMs = Date.now();
    const upcomingEvents = merged.filter((e) => e.status === 'upcoming');
    const pastEvents = merged.filter((e) => e.status === 'completed');
    const openEvents = merged.filter((e) => {
      if (e.isPublished === false || e.registrationOpen !== true) return false;
      if (e.registrationDeadline) {
        const deadlineMs = new Date(`${e.registrationDeadline}T23:59:59`).getTime();
        if (!Number.isNaN(deadlineMs) && nowMs > deadlineMs) {
          return false;
        }
      }
      return true;
    });

    return { upcomingEvents, pastEvents, openEvents, error };
  },

  async fetchPublicEventById(
    eventId: string,
  ): Promise<{ event: GdgEvent | null; error?: string }> {
    const { events: customEvents, error } = readStoredCustomEvents();
    const merged = mergeEventsWithArchive(customEvents).filter(
      (ev) => ev.isPublished !== false,
    );
    const found = merged.find((ev) => ev.id === eventId) ?? null;
    return { event: found, error };
  },

  async fetchAdminEvents(): Promise<{ events: GdgEvent[]; error?: string }> {
    const { events: customEvents, error } = readStoredCustomEvents();
    return { events: mergeEventsWithArchive(customEvents), error };
  },

  async createEvent(
    input: UpsertEventInput,
  ): Promise<{ ok: boolean; event?: GdgEvent; error?: string }> {
    const { events: existing, error: readErr } = readStoredCustomEvents();
    if (readErr) {
      return { ok: false, error: readErr };
    }

    const now = new Date().toISOString();
    const slugBase = input.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newEvent: GdgEvent = {
      id: generateUniqueId(slugBase.slice(0, 24) || 'gdg-event'),
      slug: slugBase || null,
      name: input.title.trim(),
      shortDescription: input.shortDescription.trim(),
      description: input.description.trim(),
      category: input.category,
      date: input.eventDate.trim(),
      time: input.eventTime.trim() || 'TBA',
      venue: input.venue.trim(),
      format: input.format,
      status: input.status,
      isPublished: input.isPublished,
      registrationOpen: input.registrationOpen,
      registrationDeadline: input.registrationDeadline?.trim() || undefined,
      capacity: input.capacity,
      feeType: input.feeType,
      feeAmount: input.feeType === 'free' ? 0 : Math.max(0, input.feeAmount),
      officialUrl: input.officialUrl?.trim() || undefined,
      registeredCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const writeRes = storageService.writeLocalJson(STORAGE_KEYS.EVENTS, [newEvent, ...existing]);
    if (!writeRes.ok) {
      return { ok: false, error: writeRes.error ?? 'Failed to save new event.' };
    }

    return { ok: true, event: newEvent };
  },

  async updateEvent(
    eventId: string,
    input: Partial<UpsertEventInput>,
  ): Promise<{ ok: boolean; event?: GdgEvent; error?: string }> {
    const { events: stored, error: readErr } = readStoredCustomEvents();
    if (readErr) {
      return { ok: false, error: readErr };
    }

    const existingCustomIndex = stored.findIndex((e) => e.id === eventId);
    const archiveBase = PAST_EVENTS_ARCHIVE_CONFIG.find((e) => e.id === eventId);
    const baseEvent =
      existingCustomIndex >= 0 ? stored[existingCustomIndex] : archiveBase;

    if (!baseEvent) {
      return { ok: false, error: 'Event record could not be found.' };
    }

    const nextFeeType = input.feeType ?? baseEvent.feeType;
    const nextStatus = input.status ?? baseEvent.status;
    const nextRegOpen =
      input.registrationOpen !== undefined
        ? input.registrationOpen
        : baseEvent.registrationOpen;

    const updatedEvent: GdgEvent = {
      ...baseEvent,
      name: input.title !== undefined ? input.title.trim() : baseEvent.name,
      shortDescription:
        input.shortDescription !== undefined
          ? input.shortDescription.trim()
          : baseEvent.shortDescription,
      description:
        input.description !== undefined ? input.description.trim() : baseEvent.description,
      category: input.category ?? baseEvent.category,
      date: input.eventDate !== undefined ? input.eventDate.trim() : baseEvent.date,
      time: input.eventTime !== undefined ? input.eventTime.trim() : baseEvent.time,
      venue: input.venue !== undefined ? input.venue.trim() : baseEvent.venue,
      format: input.format ?? baseEvent.format,
      status: nextStatus,
      isPublished:
        input.isPublished !== undefined ? input.isPublished : (baseEvent.isPublished ?? true),
      registrationOpen: nextRegOpen,
      registrationDeadline:
        input.registrationDeadline !== undefined
          ? input.registrationDeadline.trim() || undefined
          : baseEvent.registrationDeadline,
      capacity: input.capacity !== undefined ? input.capacity : baseEvent.capacity,
      feeType: nextFeeType,
      feeAmount:
        nextFeeType === 'free'
          ? 0
          : input.feeAmount !== undefined
            ? Math.max(0, input.feeAmount)
            : baseEvent.feeAmount,
      officialUrl:
        input.officialUrl !== undefined
          ? input.officialUrl.trim() || undefined
          : baseEvent.officialUrl,
      updatedAt: new Date().toISOString(),
    };

    const nextStored = [...stored];
    if (existingCustomIndex >= 0) {
      nextStored[existingCustomIndex] = updatedEvent;
    } else {
      nextStored.unshift(updatedEvent);
    }

    const writeRes = storageService.writeLocalJson(STORAGE_KEYS.EVENTS, nextStored);
    if (!writeRes.ok) {
      return { ok: false, error: writeRes.error ?? 'Failed to update event.' };
    }

    return { ok: true, event: updatedEvent };
  },

  async deleteEvent(eventId: string): Promise<{ ok: boolean; error?: string }> {
    const { events: stored, error: readErr } = readStoredCustomEvents();
    if (readErr) {
      return { ok: false, error: readErr };
    }

    const isArchive = PAST_EVENTS_ARCHIVE_CONFIG.some((e) => e.id === eventId);
    if (isArchive) {
      return {
        ok: false,
        error:
          'Verified chapter archive entries cannot be deleted; you can unpublish them if you want them hidden from the public archive.',
      };
    }

    const nextStored = stored.filter((e) => e.id !== eventId);
    const writeRes = storageService.writeLocalJson(STORAGE_KEYS.EVENTS, nextStored);
    if (!writeRes.ok) {
      return { ok: false, error: writeRes.error ?? 'Failed to delete event.' };
    }

    return { ok: true };
  },
};
