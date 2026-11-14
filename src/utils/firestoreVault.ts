import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  FamilyInvite,
  FamilyLink,
  ParentSettings,
  ProblemHistoryItem,
  StudentProfile,
} from '../types';
import { DEFAULT_PARENT_SETTINGS, DEFAULT_PIN_HASH, DEFAULT_PIN_SALT } from './storage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function sanitizeFirestoreId(raw: string, fallback = 'doc_1'): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned.length > 0 ? cleaned : fallback;
}

export function normalizeInviteCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 16);
}

export function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let suffix = '';
  for (let i = 0; i < bytes.length; i++) {
    suffix += alphabet[bytes[i] % alphabet.length];
  }
  return `MH-${suffix}`;
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const s = typeof val === 'string' ? val.trim() : fallback;
  return s.slice(0, maxLen) || fallback.slice(0, maxLen);
}

function clampInt(val: unknown, min: number, max: number, fallback: number): number {
  const n = typeof val === 'number' && Number.isFinite(val) ? Math.round(val) : fallback;
  return Math.min(max, Math.max(min, n));
}

function mapStudentDoc(docId: string, data: Record<string, any>): StudentProfile {
  return {
    id: data.id || docId,
    name: data.name,
    role: data.role,
    schoolType: data.schoolType,
    gradeYear: data.gradeYear,
    studyGoal: data.studyGoal,
    grade: data.grade,
    avatarId: data.avatarId,
    avatarEmoji: data.avatarEmoji,
    xp: data.xp ?? 0,
    coins: data.coins ?? 0,
    streak: data.streak ?? 1,
    lastActiveDate: data.lastActiveDate,
    streakFreezeCount: data.streakFreezeCount ?? 1,
    unlockedAvatars: Array.isArray(data.unlockedAvatars)
      ? data.unlockedAvatars
      : ['avatar_scholar'],
    unlockedBadges: Array.isArray(data.unlockedBadges) ? data.unlockedBadges : [],
    todayMinutesStudied: data.todayMinutesStudied ?? 0,
    ownerUid: data.ownerUid,
    linkedParentUid: typeof data.linkedParentUid === 'string' ? data.linkedParentUid : '',
  };
}

function mapHistoryDoc(docId: string, data: Record<string, any>): ProblemHistoryItem {
  return {
    id: data.id || docId,
    problemId: data.problemId,
    studentId: data.studentId,
    topic: data.topic,
    topicName: data.topicName,
    grade: data.grade,
    title: data.title,
    userAnswer: data.userAnswer,
    isCorrect: Boolean(data.isCorrect),
    hintsUsed: data.hintsUsed ?? 0,
    timeSpentSeconds: data.timeSpentSeconds ?? 0,
    timestamp: data.timestamp ?? Date.now(),
    nextReviewDate: data.nextReviewDate ?? Date.now(),
    interval: data.interval ?? 1,
    repetitions: data.repetitions ?? 0,
    easeFactor: data.easeFactor ?? 2.5,
    linkedParentUid: typeof data.linkedParentUid === 'string' ? data.linkedParentUid : '',
  };
}

function sanitizeStudentPayload(uid: string, student: StudentProfile) {
  const id = sanitizeFirestoreId(student.id, `st_${Date.now()}`);
  const linkedParentUid =
    student.linkedParentUid && student.linkedParentUid.trim().length > 0
      ? sanitizeFirestoreId(student.linkedParentUid)
      : '';

  return {
    id,
    ownerUid: uid,
    name: clampString(student.name, 50, 'Student'),
    role: ['daughter', 'son', 'custom', 'student'].includes(student.role)
      ? student.role
      : 'student',
    schoolType: [
      'primary_school',
      'cermat_prep',
      'grammar_school',
      'business_lyceum',
      'vocational_sos',
      'university',
    ].includes(student.schoolType)
      ? student.schoolType
      : 'cermat_prep',
    gradeYear: clampInt(student.gradeYear, 1, 12, 9),
    studyGoal: [
      'cermat_entry',
      'regular_grades',
      'graduation_maturita',
      'college_math',
    ].includes(student.studyGoal)
      ? student.studyGoal
      : 'regular_grades',
    grade: ['lyceum_2', 'grade_9', 'university', 'primary_mid', 'grammar_school'].includes(
      student.grade
    )
      ? student.grade
      : 'grade_9',
    avatarId: clampString(student.avatarId, 64, 'avatar_scholar'),
    avatarEmoji: clampString(student.avatarEmoji, 16, '🎓'),
    xp: clampInt(student.xp, 0, 10000000, 0),
    coins: clampInt(student.coins, 0, 10000000, 25),
    streak: clampInt(student.streak, 0, 10000, 1),
    lastActiveDate: clampString(
      student.lastActiveDate,
      20,
      new Date().toISOString().split('T')[0]
    ),
    streakFreezeCount: clampInt(student.streakFreezeCount, 0, 100, 1),
    unlockedAvatars: Array.isArray(student.unlockedAvatars)
      ? student.unlockedAvatars.map((a) => clampString(a, 64, 'avatar_scholar')).slice(0, 20)
      : ['avatar_scholar'],
    unlockedBadges: Array.isArray(student.unlockedBadges)
      ? student.unlockedBadges.map((b) => clampString(b, 64, 'badge')).slice(0, 30)
      : [],
    todayMinutesStudied: clampInt(student.todayMinutesStudied, 0, 1440, 0),
    linkedParentUid,
    updatedAt: serverTimestamp(),
  };
}

function sanitizeParentSettingsPayload(uid: string, settings: ParentSettings) {
  return {
    ownerUid: uid,
    dailyTimeLimitMinutes: clampInt(settings.dailyTimeLimitMinutes, 5, 300, 30),
    soundEnabled: Boolean(settings.soundEnabled),
    allowedGrades: Array.isArray(settings.allowedGrades)
      ? settings.allowedGrades.map((g) => clampString(g, 32, 'grade_9')).slice(0, 10)
      : [...DEFAULT_PARENT_SETTINGS.allowedGrades],
    pinHash: clampString(settings.pinHash, 128, DEFAULT_PIN_HASH),
    pinSalt: clampString(settings.pinSalt, 64, DEFAULT_PIN_SALT),
    updatedAt: serverTimestamp(),
  };
}

function sanitizeHistoryPayload(uid: string, item: ProblemHistoryItem) {
  const id = sanitizeFirestoreId(item.id, `hist_${Date.now()}`);
  const linkedParentUid =
    item.linkedParentUid && item.linkedParentUid.trim().length > 0
      ? sanitizeFirestoreId(item.linkedParentUid)
      : '';

  return {
    id,
    ownerUid: uid,
    problemId: clampString(item.problemId, 128, 'prob_1'),
    studentId: sanitizeFirestoreId(item.studentId, 'st_1'),
    topic: clampString(item.topic, 50, 'equations'),
    topicName: clampString(item.topicName, 150, 'Matematika'),
    grade: ['lyceum_2', 'grade_9', 'university', 'primary_mid', 'grammar_school'].includes(
      item.grade
    )
      ? item.grade
      : 'grade_9',
    title: clampString(item.title, 200, 'Příklad'),
    userAnswer: clampString(item.userAnswer, 200, ''),
    isCorrect: Boolean(item.isCorrect),
    hintsUsed: clampInt(item.hintsUsed, 0, 50, 0),
    timeSpentSeconds: clampInt(item.timeSpentSeconds, 0, 86400, 10),
    timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
    nextReviewDate: typeof item.nextReviewDate === 'number' ? item.nextReviewDate : Date.now(),
    interval: typeof item.interval === 'number' ? item.interval : 1,
    repetitions: clampInt(item.repetitions, 0, 1000, 0),
    easeFactor: typeof item.easeFactor === 'number' ? item.easeFactor : 2.5,
    linkedParentUid,
    createdAt: serverTimestamp(),
  };
}

const inflightVaultPromises = new Map<
  string,
  Promise<{ accountType: 'family_parent' | 'individual_student'; isNewUser: boolean }>
>();
let pendingRoleSelection: 'family_parent' | 'individual_student' | null = null;

export function setPendingRoleForSignIn(
  role: 'family_parent' | 'individual_student' | null
): void {
  pendingRoleSelection = role;
}

/**
 * Ensures the verified Google user's root account, PII private doc, parent settings,
 * and initial student profiles exist inside their strictly isolated Firestore vault.
 */
export async function ensureUserVaultInFirestore(
  user: User,
  requestedAccountType?: 'family_parent' | 'individual_student'
): Promise<{ accountType: 'family_parent' | 'individual_student'; isNewUser: boolean }> {
  const uid = sanitizeFirestoreId(user.uid);
  const existingInflight = inflightVaultPromises.get(uid);
  if (existingInflight) {
    return existingInflight;
  }

  const effectiveRequestedRole = requestedAccountType || pendingRoleSelection || undefined;
  pendingRoleSelection = null;

  const task = runEnsureUserVaultInFirestore(user, uid, effectiveRequestedRole).finally(() => {
    inflightVaultPromises.delete(uid);
  });
  inflightVaultPromises.set(uid, task);
  return task;
}

async function runEnsureUserVaultInFirestore(
  user: User,
  uid: string,
  requestedAccountType?: 'family_parent' | 'individual_student'
): Promise<{ accountType: 'family_parent' | 'individual_student'; isNewUser: boolean }> {
  const userPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/profile`;
  const settingsPath = `users/${uid}/settings/parent`;

  let isNewUser = false;
  let resolvedAccountType: 'family_parent' | 'individual_student' =
    requestedAccountType || 'family_parent';

  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    const displayName = clampString(
      user.displayName || user.email?.split('@')[0] || 'Rodič',
      80,
      'Rodič'
    );

    if (!userSnap.exists()) {
      isNewUser = true;
      await setDoc(userRef, {
        uid,
        displayName,
        accountType: resolvedAccountType,
        provider: 'google',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = userSnap.data();
      resolvedAccountType =
        requestedAccountType ||
        (existingData.accountType === 'individual_student' ? 'individual_student' : 'family_parent');

      if (
        (requestedAccountType && existingData.accountType !== requestedAccountType) ||
        existingData.displayName !== displayName
      ) {
        await updateDoc(userRef, {
          displayName,
          accountType: resolvedAccountType,
          updatedAt: serverTimestamp(),
        });
      }
    }

    if (user.email) {
      const privRef = doc(db, 'users', uid, 'private', 'profile');
      const privSnap = await getDoc(privRef);
      const cleanEmail = clampString(user.email, 200, 'user@example.com');
      if (!privSnap.exists()) {
        await setDoc(privRef, {
          uid,
          email: cleanEmail,
          updatedAt: serverTimestamp(),
        });
      } else if (privSnap.data().email !== cleanEmail) {
        await updateDoc(privRef, {
          email: cleanEmail,
          updatedAt: serverTimestamp(),
        });
      }
    }

    const settingsRef = doc(db, 'users', uid, 'settings', 'parent');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, sanitizeParentSettingsPayload(uid, DEFAULT_PARENT_SETTINGS));
    }

    if (isNewUser) {
      const today = new Date().toISOString().split('T')[0];
      if (resolvedAccountType === 'family_parent') {
        const marie: StudentProfile = {
          id: sanitizeFirestoreId(`st_${uid}_marie`),
          name: 'Marie',
          role: 'daughter',
          schoolType: 'business_lyceum',
          gradeYear: 2,
          studyGoal: 'regular_grades',
          grade: 'lyceum_2',
          avatarId: 'avatar_business',
          avatarEmoji: '💼',
          xp: 0,
          coins: 25,
          streak: 1,
          lastActiveDate: today,
          streakFreezeCount: 1,
          unlockedAvatars: ['avatar_scholar', 'avatar_business'],
          unlockedBadges: [],
          todayMinutesStudied: 0,
          ownerUid: uid,
          linkedParentUid: '',
        };
        const sam: StudentProfile = {
          id: sanitizeFirestoreId(`st_${uid}_sam`),
          name: 'Sam',
          role: 'son',
          schoolType: 'cermat_prep',
          gradeYear: 9,
          studyGoal: 'cermat_entry',
          grade: 'grade_9',
          avatarId: 'avatar_engineer',
          avatarEmoji: '📐',
          xp: 0,
          coins: 25,
          streak: 1,
          lastActiveDate: today,
          streakFreezeCount: 1,
          unlockedAvatars: ['avatar_scholar', 'avatar_engineer'],
          unlockedBadges: [],
          todayMinutesStudied: 0,
          ownerUid: uid,
          linkedParentUid: '',
        };
        await upsertStudentInFirestore(uid, marie);
        await upsertStudentInFirestore(uid, sam);
      } else {
        const student: StudentProfile = {
          id: sanitizeFirestoreId(`st_${uid}_self`),
          name: displayName.slice(0, 50),
          role: 'student',
          schoolType: 'cermat_prep',
          gradeYear: 9,
          studyGoal: 'cermat_entry',
          grade: 'grade_9',
          avatarId: 'avatar_scholar',
          avatarEmoji: '🎓',
          xp: 0,
          coins: 25,
          streak: 1,
          lastActiveDate: today,
          streakFreezeCount: 1,
          unlockedAvatars: ['avatar_scholar'],
          unlockedBadges: [],
          todayMinutesStudied: 0,
          ownerUid: uid,
          linkedParentUid: '',
        };
        await upsertStudentInFirestore(uid, student);
      }
    }

    return { accountType: resolvedAccountType, isNewUser };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${userPath} | ${privatePath} | ${settingsPath}`);
  }
}

export async function upsertStudentInFirestore(uid: string, student: StudentProfile): Promise<void> {
  const safeUid = sanitizeFirestoreId(uid);
  const payload = sanitizeStudentPayload(safeUid, student);
  const path = `users/${safeUid}/students/${payload.id}`;
  try {
    const ref = doc(db, 'users', safeUid, 'students', payload.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, payload);
    } else {
      const { id: _id, ownerUid: _ownerUid, ...updatableFields } = payload;
      await updateDoc(ref, updatableFields);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStudentInFirestore(uid: string, studentId: string): Promise<void> {
  const safeUid = sanitizeFirestoreId(uid);
  const safeStudentId = sanitizeFirestoreId(studentId);
  const path = `users/${safeUid}/students/${safeStudentId}`;
  try {
    await deleteDoc(doc(db, 'users', safeUid, 'students', safeStudentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveParentSettingsInFirestore(
  uid: string,
  settings: ParentSettings
): Promise<void> {
  const safeUid = sanitizeFirestoreId(uid);
  const payload = sanitizeParentSettingsPayload(safeUid, settings);
  const path = `users/${safeUid}/settings/parent`;
  try {
    const ref = doc(db, 'users', safeUid, 'settings', 'parent');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, payload);
    } else {
      const { ownerUid: _ownerUid, ...updatable } = payload;
      await updateDoc(ref, updatable);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function appendHistoryInFirestore(
  uid: string,
  item: ProblemHistoryItem
): Promise<void> {
  const safeUid = sanitizeFirestoreId(uid);
  const payload = sanitizeHistoryPayload(safeUid, item);
  const path = `users/${safeUid}/history/${payload.id}`;
  try {
    await setDoc(doc(db, 'users', safeUid, 'history', payload.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToFamilyVault(
  uid: string,
  callbacks: {
    onStudents: (students: StudentProfile[]) => void;
    onHistory: (history: ProblemHistoryItem[]) => void;
    onSettings: (settings: ParentSettings) => void;
    onError?: (err: Error) => void;
  }
): Unsubscribe {
  const safeUid = sanitizeFirestoreId(uid);

  const studentsPath = `users/${safeUid}/students`;
  const studentsQuery = query(
    collection(db, 'users', safeUid, 'students'),
    where('ownerUid', '==', safeUid)
  );
  const unsubStudents = onSnapshot(
    studentsQuery,
    (snapshot) => {
      const list: StudentProfile[] = snapshot.docs.map((d) => mapStudentDoc(d.id, d.data()));
      callbacks.onStudents(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, studentsPath);
      } catch (wrapped) {
        callbacks.onError?.(wrapped as Error);
      }
    }
  );

  const historyPath = `users/${safeUid}/history`;
  const historyQuery = query(
    collection(db, 'users', safeUid, 'history'),
    where('ownerUid', '==', safeUid)
  );
  const unsubHistory = onSnapshot(
    historyQuery,
    (snapshot) => {
      const items: ProblemHistoryItem[] = snapshot.docs
        .map((d) => mapHistoryDoc(d.id, d.data()))
        .sort((a, b) => a.timestamp - b.timestamp);
      callbacks.onHistory(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, historyPath);
      } catch (wrapped) {
        callbacks.onError?.(wrapped as Error);
      }
    }
  );

  const settingsPath = `users/${safeUid}/settings/parent`;
  const unsubSettings = onSnapshot(
    doc(db, 'users', safeUid, 'settings', 'parent'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callbacks.onSettings({
          pin: '',
          dailyTimeLimitMinutes: data.dailyTimeLimitMinutes ?? 30,
          allowedGrades: Array.isArray(data.allowedGrades)
            ? data.allowedGrades
            : DEFAULT_PARENT_SETTINGS.allowedGrades,
          soundEnabled: data.soundEnabled ?? true,
          pinHash: data.pinHash || DEFAULT_PIN_HASH,
          pinSalt: data.pinSalt || DEFAULT_PIN_SALT,
        });
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, settingsPath);
      } catch (wrapped) {
        callbacks.onError?.(wrapped as Error);
      }
    }
  );

  return () => {
    unsubStudents();
    unsubHistory();
    unsubSettings();
  };
}

// =====================================================
// Family Invites & Parent-Child Account Pairing
// =====================================================

export async function createFamilyInvite(
  parentUid: string,
  parentName: string,
  options: { invitedEmail?: string; childLabel?: string }
): Promise<FamilyInvite> {
  const safeParentUid = sanitizeFirestoreId(parentUid);
  const code = generateInviteCode();
  const cleanEmail = (options.invitedEmail || '').trim().toLowerCase().slice(0, 200);
  const cleanLabel = clampString(options.childLabel || '', 50, '');
  const cleanParentName = clampString(parentName, 80, 'Rodič');
  const expiresAt = Date.now() + 48 * 60 * 60 * 1000;
  const path = `familyInvites/${code}`;

  try {
    await setDoc(doc(db, 'familyInvites', code), {
      code,
      parentUid: safeParentUid,
      parentName: cleanParentName,
      childLabel: cleanLabel,
      invitedEmail: cleanEmail,
      status: 'pending',
      acceptedByUid: '',
      acceptedChildName: '',
      expiresAt,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      code,
      parentUid: safeParentUid,
      parentName: cleanParentName,
      childLabel: cleanLabel,
      invitedEmail: cleanEmail,
      status: 'pending',
      acceptedByUid: '',
      acceptedChildName: '',
      expiresAt,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function revokeFamilyInvite(inviteCode: string): Promise<void> {
  const code = normalizeInviteCode(inviteCode);
  const path = `familyInvites/${code}`;
  try {
    await updateDoc(doc(db, 'familyInvites', code), {
      status: 'revoked',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFamilyInvite(inviteCode: string): Promise<void> {
  const code = normalizeInviteCode(inviteCode);
  const path = `familyInvites/${code}`;
  try {
    await deleteDoc(doc(db, 'familyInvites', code));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function acceptFamilyInvite(
  inviteCodeInput: string,
  childUser: User,
  activeChildStudent: StudentProfile
): Promise<FamilyLink> {
  const code = normalizeInviteCode(inviteCodeInput);
  if (code.length < 6) {
    throw new Error('Párovací klíč musí mít alespoň 6 znaků (např. MH-7K4P9Q).');
  }

  const childUid = sanitizeFirestoreId(childUser.uid);
  const inviteRef = doc(db, 'familyInvites', code);
  let inviteSnap;
  try {
    inviteSnap = await getDoc(inviteRef);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : String(error);
    if (rawMsg.toLowerCase().includes('permission')) {
      throw new Error(
        'Tato pozvánka je vázána na jiný Gmail účet, případně již byla použita nebo zrušena.'
      );
    }
    handleFirestoreError(error, OperationType.GET, `familyInvites/${code}`);
  }

  if (!inviteSnap.exists()) {
    throw new Error('Pozvánka s tímto párovacím klíčem nebyla nalezena.');
  }

  const inv = inviteSnap.data();
  if (inv.status !== 'pending') {
    throw new Error(
      inv.status === 'accepted'
        ? 'Tento párovací klíč už byl použit.'
        : 'Tato pozvánka byla rodičem zrušena.'
    );
  }
  if (typeof inv.expiresAt === 'number' && inv.expiresAt < Date.now()) {
    throw new Error('Platnost tohoto párovacího klíče vypršela. Požádejte rodiče o nový.');
  }
  if (inv.parentUid === childUid) {
    throw new Error('Nelze propojit stejný Google účet sám se sebou. Přihlaste se na účet dítěte.');
  }
  const childEmailLower = (childUser.email || '').trim().toLowerCase();
  if (inv.invitedEmail && inv.invitedEmail !== childEmailLower) {
    throw new Error(`Pozvánka je určena pro e-mail ${inv.invitedEmail}.`);
  }

  const parentUid = sanitizeFirestoreId(inv.parentUid);
  const parentName = clampString(inv.parentName, 80, 'Rodič');
  const childName = clampString(
    activeChildStudent?.name || childUser.displayName || childEmailLower.split('@')[0] || 'Žák',
    50,
    'Žák'
  );
  const linkId = `${parentUid}__${childUid}`;
  const linkRef = doc(db, 'familyLinks', linkId);

  try {
    // Load child's current student docs so all profiles under this child account get linkedParentUid
    const studentQuery = query(
      collection(db, 'users', childUid, 'students'),
      where('ownerUid', '==', childUid)
    );
    const studentsSnap = await getDocs(studentQuery);

    const batch = writeBatch(db);

    batch.update(inviteRef, {
      status: 'accepted',
      acceptedByUid: childUid,
      acceptedChildName: childName,
      updatedAt: serverTimestamp(),
    });

    batch.set(linkRef, {
      id: linkId,
      parentUid,
      parentName,
      childUid,
      childName,
      childEmail: clampString(childUser.email || '', 200, ''),
      inviteCode: code,
      dailyTimeLimitMinutes: 30,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (studentsSnap.empty && activeChildStudent) {
      const payload = sanitizeStudentPayload(childUid, {
        ...activeChildStudent,
        linkedParentUid: parentUid,
      });
      batch.set(doc(db, 'users', childUid, 'students', payload.id), payload);
    } else {
      studentsSnap.docs.forEach((d) => {
        batch.update(d.ref, {
          linkedParentUid: parentUid,
          updatedAt: serverTimestamp(),
        });
      });
    }

    await batch.commit();

    // Backfill up to 400 recent solved problems so parent sees prior progress right away
    try {
      const histQuery = query(
        collection(db, 'users', childUid, 'history'),
        where('ownerUid', '==', childUid),
        orderBy('timestamp', 'desc'),
        limit(400)
      );
      const histSnap = await getDocs(histQuery);
      if (!histSnap.empty) {
        const histBatch = writeBatch(db);
        histSnap.docs.forEach((d) => {
          histBatch.update(d.ref, { linkedParentUid: parentUid });
        });
        await histBatch.commit();
      }
    } catch (backfillErr) {
      console.warn('Backfill historie při párování:', backfillErr);
    }

    return {
      id: linkId,
      parentUid,
      parentName,
      childUid,
      childName,
      childEmail: childUser.email || '',
      inviteCode: code,
      dailyTimeLimitMinutes: 30,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `familyLinks/${linkId}`);
  }
}

export async function unlinkFamilyAccount(
  linkId: string,
  childUid?: string,
  clearChildBackfill = false
): Promise<void> {
  const path = `familyLinks/${linkId}`;
  try {
    await deleteDoc(doc(db, 'familyLinks', linkId));

    if (clearChildBackfill && childUid) {
      const safeChildUid = sanitizeFirestoreId(childUid);
      const studentsSnap = await getDocs(
        query(collection(db, 'users', safeChildUid, 'students'), where('ownerUid', '==', safeChildUid))
      );
      const batch = writeBatch(db);
      studentsSnap.docs.forEach((d) => {
        batch.update(d.ref, { linkedParentUid: '', updatedAt: serverTimestamp() });
      });
      await batch.commit();

      const histSnap = await getDocs(
        query(
          collection(db, 'users', safeChildUid, 'history'),
          where('ownerUid', '==', safeChildUid),
          orderBy('timestamp', 'desc'),
          limit(400)
        )
      );
      if (!histSnap.empty) {
        const histBatch = writeBatch(db);
        histSnap.docs.forEach((d) => {
          histBatch.update(d.ref, { linkedParentUid: '' });
        });
        await histBatch.commit();
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateLinkedChildTimeLimit(linkId: string, minutes: number): Promise<void> {
  const path = `familyLinks/${linkId}`;
  try {
    await updateDoc(doc(db, 'familyLinks', linkId), {
      dailyTimeLimitMinutes: clampInt(minutes, 5, 300, 30),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeToParentInvites(
  parentUid: string,
  onInvites: (invites: FamilyInvite[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const safeUid = sanitizeFirestoreId(parentUid);
  const path = 'familyInvites';
  const q = query(collection(db, 'familyInvites'), where('parentUid', '==', safeUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FamilyInvite[] = snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            code: data.code || d.id,
            parentUid: data.parentUid,
            parentName: data.parentName || 'Rodič',
            childLabel: data.childLabel || '',
            invitedEmail: data.invitedEmail || '',
            status: data.status || 'pending',
            acceptedByUid: data.acceptedByUid || '',
            acceptedChildName: data.acceptedChildName || '',
            expiresAt: data.expiresAt || 0,
          };
        })
        .sort((a, b) => b.expiresAt - a.expiresAt);
      onInvites(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribeToPendingInvitesForEmail(
  email: string,
  onInvites: (invites: FamilyInvite[]) => void
): Unsubscribe {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return () => {};

  const q = query(
    collection(db, 'familyInvites'),
    where('invitedEmail', '==', normalized),
    where('status', '==', 'pending')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const now = Date.now();
      const list: FamilyInvite[] = snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            code: data.code || d.id,
            parentUid: data.parentUid,
            parentName: data.parentName || 'Rodič',
            childLabel: data.childLabel || '',
            invitedEmail: data.invitedEmail || '',
            status: data.status || 'pending',
            acceptedByUid: data.acceptedByUid || '',
            acceptedChildName: data.acceptedChildName || '',
            expiresAt: data.expiresAt || 0,
          };
        })
        .filter((inv) => inv.expiresAt > now);
      onInvites(list);
    },
    (error) => {
      console.warn('Chyba načítání čekajících pozvánek pro e-mail:', error);
    }
  );
}

export function subscribeToFamilyLinks(
  uid: string,
  role: 'parent' | 'child',
  onLinks: (links: FamilyLink[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const safeUid = sanitizeFirestoreId(uid);
  const field = role === 'parent' ? 'parentUid' : 'childUid';
  const q = query(collection(db, 'familyLinks'), where(field, '==', safeUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FamilyLink[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          parentUid: data.parentUid,
          parentName: data.parentName || 'Rodič',
          childUid: data.childUid,
          childName: data.childName || 'Žák',
          childEmail: data.childEmail || '',
          inviteCode: data.inviteCode || '',
          dailyTimeLimitMinutes: data.dailyTimeLimitMinutes ?? 30,
        };
      });
      onLinks(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'familyLinks');
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribeToLinkedChildVault(
  parentUid: string,
  childUid: string,
  callbacks: {
    onStudents: (students: StudentProfile[]) => void;
    onHistory: (history: ProblemHistoryItem[]) => void;
    onError?: (err: Error) => void;
  }
): Unsubscribe {
  const safeParentUid = sanitizeFirestoreId(parentUid);
  const safeChildUid = sanitizeFirestoreId(childUid);

  const studentsQ = query(
    collection(db, 'users', safeChildUid, 'students'),
    where('linkedParentUid', '==', safeParentUid)
  );
  const unsubStudents = onSnapshot(
    studentsQ,
    (snapshot) => {
      const list = snapshot.docs.map((d) => mapStudentDoc(d.id, d.data()));
      callbacks.onStudents(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, `users/${safeChildUid}/students`);
      } catch (wrapped) {
        callbacks.onError?.(wrapped as Error);
      }
    }
  );

  const histQ = query(
    collection(db, 'users', safeChildUid, 'history'),
    where('linkedParentUid', '==', safeParentUid)
  );
  const unsubHistory = onSnapshot(
    histQ,
    (snapshot) => {
      const items = snapshot.docs
        .map((d) => mapHistoryDoc(d.id, d.data()))
        .sort((a, b) => a.timestamp - b.timestamp);
      callbacks.onHistory(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, `users/${safeChildUid}/history`);
      } catch (wrapped) {
        callbacks.onError?.(wrapped as Error);
      }
    }
  );

  return () => {
    unsubStudents();
    unsubHistory();
  };
}
