import {
  StudentProfile,
  ProblemHistoryItem,
  ParentSettings,
  AuthSession,
} from '../types';

const STORAGE_KEYS = {
  DEMO_PROFILES: 'mathhero_demo_profiles_v3',
  DEMO_HISTORY: 'mathhero_demo_history_v3',
  DEMO_SETTINGS: 'mathhero_demo_parent_settings_v3',
  ACTIVE_STUDENT_ID: 'mathhero_active_student_id_v3',
  DARK_MODE: 'mathhero_dark_mode_v3',
  AUTH_SESSION: 'mathhero_auth_session_v3',
  PIN_LOCKOUT: 'mathhero_pin_lockout_v3',
};

export const DEFAULT_PROFILES: StudentProfile[] = [
  {
    id: 'demo_marie',
    name: 'Marie',
    role: 'daughter',
    schoolType: 'business_lyceum',
    gradeYear: 2,
    studyGoal: 'regular_grades',
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
    id: 'demo_sam',
    name: 'Sam',
    role: 'son',
    schoolType: 'cermat_prep',
    gradeYear: 9,
    studyGoal: 'cermat_entry',
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

// Default salt and hash for "1234"
export const DEFAULT_PIN_SALT = 'mathhero_salt_2026';
// SHA-256("1234_mathhero_salt_2026")
export const DEFAULT_PIN_HASH = '5986d128e6e1c3071ae899070034ed87f685107cbe9063d4748061610f9f37e3';

export const DEFAULT_PARENT_SETTINGS: ParentSettings & { pinHash?: string; pinSalt?: string } = {
  pin: '',
  dailyTimeLimitMinutes: 30,
  allowedGrades: ['lyceum_2', 'grade_9', 'university', 'primary_mid', 'grammar_school'],
  soundEnabled: true,
  pinHash: DEFAULT_PIN_HASH,
  pinSalt: DEFAULT_PIN_SALT,
};

/**
 * Cryptographic SHA-256 hash using Web Crypto API
 */
export async function hashPin(pin: string, salt: string = DEFAULT_PIN_SALT): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${pin}_${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPinHash(
  inputPin: string,
  storedHash: string = DEFAULT_PIN_HASH,
  storedSalt: string = DEFAULT_PIN_SALT
): Promise<boolean> {
  const computed = await hashPin(inputPin, storedSalt);
  return computed === storedHash;
}

/**
 * Sandboxed Vault Key Resolver
 * Each account has an isolated sandbox; unauthenticated users use demo sandbox
 */
function getVaultKey(prefix: string, userId?: string | null): string {
  if (userId) {
    // Sanitize userId to safe alphanumeric
    const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `mathhero_vault_${safeId}_${prefix}`;
  }
  return `mathhero_demo_${prefix}`;
}

// Sandboxed Profiles loader/saver
export function loadProfiles(userId?: string | null): StudentProfile[] {
  try {
    const key = getVaultKey('profiles', userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (!userId) {
        // Save demo default
        localStorage.setItem(key, JSON.stringify(DEFAULT_PROFILES));
        return DEFAULT_PROFILES;
      }
      return [];
    }
    const parsed: StudentProfile[] = JSON.parse(raw);
    return parsed;
  } catch {
    return userId ? [] : DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: StudentProfile[], userId?: string | null): void {
  try {
    const key = getVaultKey('profiles', userId);
    localStorage.setItem(key, JSON.stringify(profiles));
  } catch (e) {
    console.error('Chyba při ukládání profilů do trezoru:', e);
  }
}

export function loadActiveStudentId(userId?: string | null): string {
  try {
    const key = getVaultKey('active_student_id', userId);
    const saved = localStorage.getItem(key);
    if (saved) return saved;

    const profiles = loadProfiles(userId);
    return profiles[0]?.id || DEFAULT_PROFILES[0].id;
  } catch {
    return DEFAULT_PROFILES[0].id;
  }
}

export function saveActiveStudentId(id: string, userId?: string | null): void {
  try {
    const key = getVaultKey('active_student_id', userId);
    localStorage.setItem(key, id);
  } catch (e) {
    console.error('Chyba při ukládání aktivního studenta:', e);
  }
}

export function loadHistory(userId?: string | null): ProblemHistoryItem[] {
  try {
    const key = getVaultKey('history', userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHistory(history: ProblemHistoryItem[], userId?: string | null): void {
  try {
    const key = getVaultKey('history', userId);
    localStorage.setItem(key, JSON.stringify(history));
  } catch (e) {
    console.error('Chyba při ukládání historie:', e);
  }
}

export function appendHistoryItem(item: ProblemHistoryItem, userId?: string | null): void {
  const current = loadHistory(userId);
  current.push(item);
  saveHistory(current, userId);
}

export function loadParentSettings(userId?: string | null): ParentSettings {
  try {
    const key = getVaultKey('parent_settings', userId);
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_PARENT_SETTINGS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PARENT_SETTINGS;
  }
}

export function saveParentSettings(settings: ParentSettings, userId?: string | null): void {
  try {
    const key = getVaultKey('parent_settings', userId);
    localStorage.setItem(key, JSON.stringify(settings));
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

// Auth Session Storage
export function loadAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  } catch (e) {
    console.error('Chyba při ukládání relace přihlášení:', e);
  }
}

// PIN Brute Force Lockout
export interface PinLockoutState {
  failedAttempts: number;
  lockedUntil: number; // timestamp
}

export function loadPinLockout(): PinLockoutState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PIN_LOCKOUT);
    if (!raw) return { failedAttempts: 0, lockedUntil: 0 };
    return JSON.parse(raw);
  } catch {
    return { failedAttempts: 0, lockedUntil: 0 };
  }
}

export function savePinLockout(state: PinLockoutState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PIN_LOCKOUT, JSON.stringify(state));
  } catch (e) {
    console.error('Chyba při ukládání PIN zámku:', e);
  }
}

export function recordFailedPinAttempt(): PinLockoutState {
  const current = loadPinLockout();
  const failed = current.failedAttempts + 1;
  let lockedUntil = current.lockedUntil;

  // After 5 attempts, lock for 5 minutes (300,000 ms)
  if (failed >= 5) {
    lockedUntil = Date.now() + 5 * 60 * 1000;
  }

  const updated: PinLockoutState = { failedAttempts: failed, lockedUntil };
  savePinLockout(updated);
  return updated;
}

export function resetPinLockout(): void {
  savePinLockout({ failedAttempts: 0, lockedUntil: 0 });
}

export interface SyncDataPackage {
  version: number;
  exportedAt: string;
  profiles: StudentProfile[];
  history: ProblemHistoryItem[];
  parentSettings: ParentSettings;
  session?: AuthSession | null;
}

export function exportSyncPackage(userId?: string | null): string {
  const pkg: SyncDataPackage = {
    version: 3,
    exportedAt: new Date().toISOString(),
    profiles: loadProfiles(userId),
    history: loadHistory(userId),
    parentSettings: loadParentSettings(userId),
    session: loadAuthSession(),
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(pkg))));
}

export function importSyncPackage(syncCode: string, currentUserId?: string | null): boolean {
  try {
    const decoded = decodeURIComponent(escape(atob(syncCode.trim())));
    const pkg: SyncDataPackage = JSON.parse(decoded);
    if (pkg && pkg.profiles && Array.isArray(pkg.profiles)) {
      saveProfiles(pkg.profiles, currentUserId);
      if (pkg.history) saveHistory(pkg.history, currentUserId);
      if (pkg.parentSettings) saveParentSettings(pkg.parentSettings, currentUserId);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Neplatný synchronizační kód:', e);
    return false;
  }
}
