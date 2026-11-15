export const STORAGE_KEYS = {
  STUDENTS: 'gdg_upes_students_v1',
  ADMIN_ACCOUNT: 'gdg_upes_admin_v1',
  EVENTS: 'gdg_upes_events_v1',
  REGISTRATIONS: 'gdg_upes_registrations_v1',
  STUDENT_SESSION: 'gdg_upes_student_session_v1',
  ADMIN_SESSION: 'gdg_upes_admin_session_v1',
} as const;

export const STORAGE_SYNC_EVENT = 'gdg-upes-storage-sync';

export interface StorageReadResult<T> {
  ok: boolean;
  data: T;
  corrupted?: boolean;
  error?: string;
}

export interface StorageWriteResult {
  ok: boolean;
  error?: string;
}

function getStorage(kind: 'local' | 'session'): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const storage = kind === 'local' ? window.localStorage : window.sessionStorage;
    const probeKey = '__gdg_upes_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

function emitSyncEvent(key: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT, { detail: { key } }));
}

export const storageService = {
  isLocalStorageAvailable(): boolean {
    return getStorage('local') !== null;
  },

  isSessionStorageAvailable(): boolean {
    return getStorage('session') !== null;
  },

  readLocalJson<T>(key: string, fallback: T): StorageReadResult<T> {
    const storage = getStorage('local');
    if (!storage) {
      return {
        ok: false,
        data: fallback,
        error: 'Browser localStorage is unavailable or blocked by privacy settings.',
      };
    }

    try {
      const raw = storage.getItem(key);
      if (raw === null) {
        return { ok: true, data: fallback };
      }
      const parsed = JSON.parse(raw) as T;
      return { ok: true, data: parsed ?? fallback };
    } catch {
      return {
        ok: false,
        data: fallback,
        corrupted: true,
        error: `Stored browser data for "${key}" is corrupted and could not be parsed.`,
      };
    }
  },

  writeLocalJson<T>(key: string, value: T): StorageWriteResult {
    const storage = getStorage('local');
    if (!storage) {
      return {
        ok: false,
        error: 'Browser localStorage is unavailable. Unable to save data locally.',
      };
    }

    try {
      const serialized = JSON.stringify(value);
      storage.setItem(key, serialized);
      // Verify read-back succeeded
      const readBack = storage.getItem(key);
      if (readBack !== serialized) {
        return { ok: false, error: 'Storage write verification failed.' };
      }
      emitSyncEvent(key);
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof Error && err.name === 'QuotaExceededError'
          ? 'Browser storage quota exceeded. Please free up space and try again.'
          : 'Failed to persist data to browser localStorage.';
      return { ok: false, error: message };
    }
  },

  removeLocalItem(key: string): void {
    const storage = getStorage('local');
    if (!storage) return;
    storage.removeItem(key);
    emitSyncEvent(key);
  },

  readSessionJson<T>(key: string, fallback: T): StorageReadResult<T> {
    const storage = getStorage('session');
    if (!storage) {
      return {
        ok: false,
        data: fallback,
        error: 'Browser sessionStorage is unavailable.',
      };
    }

    try {
      const raw = storage.getItem(key);
      if (raw === null) {
        return { ok: true, data: fallback };
      }
      const parsed = JSON.parse(raw) as T;
      return { ok: true, data: parsed ?? fallback };
    } catch {
      return {
        ok: false,
        data: fallback,
        corrupted: true,
        error: 'Active session data was corrupted and has been cleared.',
      };
    }
  },

  writeSessionJson<T>(key: string, value: T): StorageWriteResult {
    const storage = getStorage('session');
    if (!storage) {
      return {
        ok: false,
        error: 'Browser sessionStorage is unavailable. Unable to maintain active session.',
      };
    }

    try {
      const serialized = JSON.stringify(value);
      storage.setItem(key, serialized);
      emitSyncEvent(key);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to store active session.' };
    }
  },

  removeSessionItem(key: string): void {
    const storage = getStorage('session');
    if (!storage) return;
    storage.removeItem(key);
    emitSyncEvent(key);
  },

  subscribe(keys: string[], onUpdate: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const keySet = new Set(keys);

    const handleCustom = (event: Event) => {
      const custom = event as CustomEvent<{ key?: string }>;
      if (!custom.detail?.key || keySet.has(custom.detail.key)) {
        onUpdate();
      }
    };

    const handleNative = (event: StorageEvent) => {
      if (!event.key || keySet.has(event.key)) {
        onUpdate();
      }
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleCustom);
    window.addEventListener('storage', handleNative);

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, handleCustom);
      window.removeEventListener('storage', handleNative);
    };
  },
};
