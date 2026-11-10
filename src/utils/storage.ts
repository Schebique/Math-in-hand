import { StudentProfile, ProblemHistoryItem, ParentSettings, GradeLevel } from '../types';

const STORAGE_KEYS = {
  PROFILES: 'mathhero_profiles_v1',
  ACTIVE_STUDENT_ID: 'mathhero_active_student_id_v1',
  HISTORY: 'mathhero_history_v1',
  PARENT_SETTINGS: 'mathhero_parent_settings_v1',
  DARK_MODE: 'mathhero_dark_mode_v1',
  LAST_DATE: 'mathhero_last_study_date_v1',
};

export const DEFAULT_PROFILES: StudentProfile[] = [
  {
    id: 'student_daughter',
    name: 'Eliška',
    role: 'daughter',
    grade: 'lyceum_2',
    avatarId: 'avatar_business',
    avatarEmoji: '💼',
    xp: 240,
    coins: 75,
    streak: 4,
    lastActiveDate: new Date().toISOString().split('T')[0],
    streakFreezeCount: 1,
    unlockedAvatars: ['avatar_scholar', 'avatar_business'],
    unlockedBadges: ['badge_first_solve', 'badge_streak_3', 'badge_finance_master'],
    todayMinutesStudied: 14,
  },
  {
    id: 'student_son',
    name: 'Matěj',
    role: 'son',
    grade: 'grade_9',
    avatarId: 'avatar_engineer',
    avatarEmoji: '📐',
    xp: 180,
    coins: 60,
    streak: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    streakFreezeCount: 1,
    unlockedAvatars: ['avatar_scholar', 'avatar_engineer'],
    unlockedBadges: ['badge_first_solve', 'badge_cermat_ready'],
    todayMinutesStudied: 10,
  },
];

export const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  pin: '1234',
  dailyTimeLimitMinutes: 30,
  allowedGrades: ['lyceum_2', 'grade_9', 'university'],
  soundEnabled: true,
};

// Storage helpers
export function loadProfiles(): StudentProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      saveProfiles(DEFAULT_PROFILES);
      return DEFAULT_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: StudentProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Chyba při ukládání profilů:', e);
  }
}

export function loadActiveStudentId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT_ID) || DEFAULT_PROFILES[0].id;
  } catch {
    return DEFAULT_PROFILES[0].id;
  }
}

export function saveActiveStudentId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT_ID, id);
  } catch (e) {
    console.error('Chyba při ukládání aktivního studenta:', e);
  }
}

export function loadHistory(): ProblemHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHistory(history: ProblemHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Chyba při ukládání historie:', e);
  }
}

export function appendHistoryItem(item: ProblemHistoryItem): void {
  const current = loadHistory();
  current.push(item);
  saveHistory(current);
}

export function loadParentSettings(): ParentSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARENT_SETTINGS);
    if (!raw) return DEFAULT_PARENT_SETTINGS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PARENT_SETTINGS;
  }
}

export function saveParentSettings(settings: ParentSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PARENT_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Chyba při ukládání nastavení rodiče:', e);
  }
}

export function loadDarkMode(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (saved !== null) {
      return saved === 'true';
    }
    // Default to system preference or light
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function saveDarkMode(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(enabled));
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.error('Chyba při ukládání tmavého režimu:', e);
  }
}

/**
 * Cloud Sync / Export data package
 */
export interface SyncDataPackage {
  version: number;
  exportedAt: string;
  profiles: StudentProfile[];
  history: ProblemHistoryItem[];
  parentSettings: ParentSettings;
}

export function exportSyncPackage(): string {
  const pkg: SyncDataPackage = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profiles: loadProfiles(),
    history: loadHistory(),
    parentSettings: loadParentSettings(),
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(pkg))));
}

export function importSyncPackage(syncCode: string): boolean {
  try {
    const decoded = decodeURIComponent(escape(atob(syncCode.trim())));
    const pkg: SyncDataPackage = JSON.parse(decoded);
    if (pkg && pkg.profiles && Array.isArray(pkg.profiles)) {
      saveProfiles(pkg.profiles);
      if (pkg.history) saveHistory(pkg.history);
      if (pkg.parentSettings) saveParentSettings(pkg.parentSettings);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Neplatný synchronizační kód:', e);
    return false;
  }
}
