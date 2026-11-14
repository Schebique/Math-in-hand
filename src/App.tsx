import React, { useState, useEffect, useRef, useMemo } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  StudentProfile,
  Problem,
  ProblemHistoryItem,
  ParentSettings,
  AuthSession,
  FamilyInvite,
  FamilyLink,
} from './types';
import {
  loadProfiles,
  saveProfiles,
  loadActiveStudentId,
  saveActiveStudentId,
  loadHistory,
  appendHistoryItem,
  saveHistory,
  loadParentSettings,
  saveParentSettings,
  loadDarkMode,
  saveDarkMode,
  loadAuthSession,
  saveAuthSession,
} from './utils/storage';
import { auth } from './firebase';
import {
  ensureUserVaultInFirestore,
  subscribeToFamilyVault,
  upsertStudentInFirestore,
  deleteStudentInFirestore,
  saveParentSettingsInFirestore,
  appendHistoryInFirestore,
  createFamilyInvite,
  revokeFamilyInvite,
  deleteFamilyInvite,
  acceptFamilyInvite,
  unlinkFamilyAccount,
  updateLinkedChildTimeLimit,
  subscribeToParentInvites,
  subscribeToPendingInvitesForEmail,
  subscribeToFamilyLinks,
  subscribeToLinkedChildVault,
  normalizeInviteCode,
} from './utils/firestoreVault';
import { calculateSM2, getProblemsDueForReview } from './utils/spacedRepetition';
import { Navbar } from './components/Navbar';
import { MobileTabBar } from './components/MobileTabBar';
import { ProblemView } from './components/ProblemView';
import { SpacedRepetitionView } from './components/SpacedRepetitionView';
import { GamificationView } from './components/GamificationView';
import { ParentDashboard } from './components/ParentDashboard';
import { SyncModal } from './components/SyncModal';
import { SSOAuthModal } from './components/SSOAuthModal';
import { OnboardingWizardModal } from './components/OnboardingWizardModal';
import { WifiOff, Award, School, Link2, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(loadAuthSession);
  const [profiles, setProfiles] = useState<StudentProfile[]>(() =>
    loadProfiles(loadAuthSession()?.userId)
  );
  const [activeStudentId, setActiveStudentId] = useState<string>(() =>
    loadActiveStudentId(loadAuthSession()?.userId)
  );
  const [history, setHistory] = useState<ProblemHistoryItem[]>(() =>
    loadHistory(loadAuthSession()?.userId)
  );
  const [parentSettings, setParentSettings] = useState<ParentSettings>(() =>
    loadParentSettings(loadAuthSession()?.userId)
  );
  const [activeTab, setActiveTab] = useState<'practice' | 'review' | 'gamification' | 'parent'>(
    'practice'
  );
  const [requestedParentTab, setRequestedParentTab] = useState<
    'stats' | 'children' | 'limits' | 'reports' | null
  >(null);
  const [darkMode, setDarkMode] = useState<boolean>(loadDarkMode);

  // Family invites & cross-account parent-child linking
  const [familyInvites, setFamilyInvites] = useState<FamilyInvite[]>([]);
  const [familyLinks, setFamilyLinks] = useState<FamilyLink[]>([]);
  const [pendingEmailInvites, setPendingEmailInvites] = useState<FamilyInvite[]>([]);
  const [linkedChildProfilesByUid, setLinkedChildProfilesByUid] = useState<
    Record<string, StudentProfile[]>
  >({});
  const [linkedChildHistoryByUid, setLinkedChildHistoryByUid] = useState<
    Record<string, ProblemHistoryItem[]>
  >({});
  const [pendingUrlInviteCode, setPendingUrlInviteCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const raw = new URLSearchParams(window.location.search).get('invite');
    if (!raw) return null;
    const norm = normalizeInviteCode(raw);
    return norm.length >= 6 ? norm : null;
  });
  const [inviteBannerStatus, setInviteBannerStatus] = useState<string | null>(null);
  const [inviteBannerError, setInviteBannerError] = useState<string | null>(null);
  const [isAcceptingInviteBanner, setIsAcceptingInviteBanner] = useState(false);

  // Modals state
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [ssoPreferredRole, setSsoPreferredRole] = useState<
    'individual_student' | 'family_parent' | undefined
  >(undefined);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingTargetProfile, setOnboardingTargetProfile] = useState<
    Partial<StudentProfile> | undefined
  >(undefined);
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [recentBadge, setRecentBadge] = useState<string | null>(null);

  const vaultUnsubRef = useRef<(() => void) | null>(null);
  const invitesUnsubRef = useRef<(() => void) | null>(null);
  const linksUnsubRef = useRef<(() => void) | null>(null);
  const emailInvitesUnsubRef = useRef<(() => void) | null>(null);
  const linkedChildrenUnsubsRef = useRef<(() => void)[]>([]);

  const isParentRole = authSession?.accountType === 'family_parent';

  const clearCloudPairingListeners = () => {
    if (invitesUnsubRef.current) {
      invitesUnsubRef.current();
      invitesUnsubRef.current = null;
    }
    if (linksUnsubRef.current) {
      linksUnsubRef.current();
      linksUnsubRef.current = null;
    }
    if (emailInvitesUnsubRef.current) {
      emailInvitesUnsubRef.current();
      emailInvitesUnsubRef.current = null;
    }
    linkedChildrenUnsubsRef.current.forEach((u) => u());
    linkedChildrenUnsubsRef.current = [];
  };

  // Ensure non-parent users never remain on hidden Parent tab
  useEffect(() => {
    if (!isParentRole && activeTab === 'parent') {
      setActiveTab('practice');
    }
  }, [isParentRole, activeTab]);

  // Real Firebase Auth + Firestore live synchronization
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (vaultUnsubRef.current) {
        vaultUnsubRef.current();
        vaultUnsubRef.current = null;
      }
      clearCloudPairingListeners();

      if (user && user.emailVerified) {
        try {
          const cached = loadAuthSession();
          const preferredRole = cached?.userId === user.uid ? cached.accountType : undefined;
          const { accountType } = await ensureUserVaultInFirestore(user, preferredRole);

          const session: AuthSession = {
            userId: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || 'Uživatel',
            provider: 'google',
            accountType,
            avatarUrl: user.photoURL || '',
          };
          setAuthSession(session);
          saveAuthSession(session);

          vaultUnsubRef.current = subscribeToFamilyVault(user.uid, {
            onStudents: (cloudStudents) => {
              if (cloudStudents.length > 0) {
                setProfiles(cloudStudents);
                saveProfiles(cloudStudents, user.uid);
                setActiveStudentId((prev) =>
                  cloudStudents.some((s) => s.id === prev) ? prev : cloudStudents[0].id
                );
              }
            },
            onHistory: (cloudHistory) => {
              setHistory(cloudHistory);
              saveHistory(cloudHistory, user.uid);
            },
            onSettings: (cloudSettings) => {
              setParentSettings(cloudSettings);
              saveParentSettings(cloudSettings, user.uid);
            },
            onError: (err) => {
              console.error('Chyba synchronizace Firestore trezoru:', err);
            },
          });

          if (accountType === 'family_parent') {
            invitesUnsubRef.current = subscribeToParentInvites(user.uid, setFamilyInvites);
            linksUnsubRef.current = subscribeToFamilyLinks(user.uid, 'parent', setFamilyLinks);
            setPendingEmailInvites([]);
          } else {
            setFamilyInvites([]);
            linksUnsubRef.current = subscribeToFamilyLinks(user.uid, 'child', setFamilyLinks);
            if (user.email) {
              emailInvitesUnsubRef.current = subscribeToPendingInvitesForEmail(
                user.email,
                setPendingEmailInvites
              );
            }
          }
        } catch (err) {
          console.error('Nepodařilo se inicializovat Firestore trezor:', err);
        }
      } else {
        setFamilyInvites([]);
        setFamilyLinks([]);
        setPendingEmailInvites([]);
        setLinkedChildProfilesByUid({});
        setLinkedChildHistoryByUid({});
        if (loadAuthSession()) {
          setAuthSession(null);
          saveAuthSession(null);
          setIsParentUnlocked(false);
          const demoProfiles = loadProfiles(null);
          setProfiles(demoProfiles);
          setActiveStudentId(loadActiveStudentId(null));
          setHistory(loadHistory(null));
          setParentSettings(loadParentSettings(null));
        }
      }
    });

    return () => {
      unsubAuth();
      if (vaultUnsubRef.current) {
        vaultUnsubRef.current();
        vaultUnsubRef.current = null;
      }
      clearCloudPairingListeners();
    };
  }, []);

  // Dynamically subscribe to all linked children's Firestore vaults when logged in as parent
  useEffect(() => {
    linkedChildrenUnsubsRef.current.forEach((u) => u());
    linkedChildrenUnsubsRef.current = [];

    if (!authSession?.userId || !isParentRole || familyLinks.length === 0) {
      setLinkedChildProfilesByUid({});
      setLinkedChildHistoryByUid({});
      return;
    }

    const activeChildUids = new Set(familyLinks.map((l) => l.childUid));
    setLinkedChildProfilesByUid((prev) => {
      const next: Record<string, StudentProfile[]> = {};
      for (const key of Object.keys(prev)) {
        if (activeChildUids.has(key)) next[key] = prev[key];
      }
      return next;
    });
    setLinkedChildHistoryByUid((prev) => {
      const next: Record<string, ProblemHistoryItem[]> = {};
      for (const key of Object.keys(prev)) {
        if (activeChildUids.has(key)) next[key] = prev[key];
      }
      return next;
    });

    for (const link of familyLinks) {
      const unsub = subscribeToLinkedChildVault(authSession.userId, link.childUid, {
        onStudents: (childStudents) => {
          setLinkedChildProfilesByUid((prev) => ({
            ...prev,
            [link.childUid]: childStudents,
          }));
        },
        onHistory: (childHistory) => {
          setLinkedChildHistoryByUid((prev) => ({
            ...prev,
            [link.childUid]: childHistory,
          }));
        },
        onError: (err) => {
          console.warn('Chyba odběru dat připojeného dítěte:', err);
        },
      });
      linkedChildrenUnsubsRef.current.push(unsub);
    }

    return () => {
      linkedChildrenUnsubsRef.current.forEach((u) => u());
      linkedChildrenUnsubsRef.current = [];
    };
  }, [authSession?.userId, isParentRole, familyLinks]);

  // Sync dark mode class on initial mount and change
  useEffect(() => {
    saveDarkMode(darkMode);
  }, [darkMode]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeChildParentLink: FamilyLink | null =
    !isParentRole && authSession ? familyLinks[0] || null : null;

  const activeDailyTimeLimit = activeChildParentLink
    ? activeChildParentLink.dailyTimeLimitMinutes
    : parentSettings.dailyTimeLimitMinutes;

  // Time tracker for active student
  useEffect(() => {
    const timer = setInterval(() => {
      setProfiles((prev) => {
        const updated = prev.map((s) => {
          if (s.id === activeStudentId) {
            const nextStudent: StudentProfile = {
              ...s,
              todayMinutesStudied: s.todayMinutesStudied + 1,
              linkedParentUid: activeChildParentLink?.parentUid || s.linkedParentUid,
            };
            if (auth.currentUser && auth.currentUser.uid === authSession?.userId) {
              void upsertStudentInFirestore(auth.currentUser.uid, nextStudent).catch(() => {});
            }
            return nextStudent;
          }
          return s;
        });
        saveProfiles(updated, authSession?.userId);
        return updated;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [activeStudentId, authSession?.userId, activeChildParentLink?.parentUid]);

  const activeStudent =
    profiles.find((s) => s.id === activeStudentId) ||
    profiles[0] || {
      id: 'fallback',
      name: 'Marie',
      role: 'daughter',
      schoolType: 'business_lyceum',
      gradeYear: 2,
      studyGoal: 'regular_grades',
      grade: 'lyceum_2',
      avatarId: 'avatar_business',
      avatarEmoji: '💼',
      xp: 0,
      coins: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      streakFreezeCount: 1,
      unlockedAvatars: ['avatar_business'],
      unlockedBadges: [],
      todayMinutesStudied: 0,
    };

  const parentDashboardStudents = useMemo(() => {
    const linkedList = Object.values(linkedChildProfilesByUid).flat();
    return [...profiles, ...linkedList];
  }, [profiles, linkedChildProfilesByUid]);

  const parentDashboardHistory = useMemo(() => {
    const linkedHist = Object.values(linkedChildHistoryByUid).flat();
    return [...history, ...linkedHist];
  }, [history, linkedChildHistoryByUid]);

  const handleSelectStudent = (st: StudentProfile) => {
    setActiveStudentId(st.id);
    saveActiveStudentId(st.id, authSession?.userId);
  };

  const handleUpdateStudent = (updated: StudentProfile) => {
    const enriched: StudentProfile = activeChildParentLink
      ? { ...updated, linkedParentUid: activeChildParentLink.parentUid }
      : updated;
    const newProfiles = profiles.map((p) => (p.id === enriched.id ? enriched : p));
    setProfiles(newProfiles);
    saveProfiles(newProfiles, authSession?.userId);
    if (auth.currentUser && auth.currentUser.uid === authSession?.userId) {
      void upsertStudentInFirestore(auth.currentUser.uid, enriched).catch((err) => {
        console.error('Chyba zápisu profilu do Firestore:', err);
      });
    }
  };

  const handleUpdateParentSettings = (newSettings: ParentSettings) => {
    setParentSettings(newSettings);
    saveParentSettings(newSettings, authSession?.userId);
    if (auth.currentUser && auth.currentUser.uid === authSession?.userId) {
      void saveParentSettingsInFirestore(auth.currentUser.uid, newSettings).catch((err) => {
        console.error('Chyba zápisu nastavení do Firestore:', err);
      });
    }
  };

  // Verified Google SSO Authentication handler
  const handleAuthSuccess = (session: AuthSession, isNewUser: boolean) => {
    setAuthSession(session);
    saveAuthSession(session);

    const localProfiles = loadProfiles(session.userId);
    if (localProfiles.length > 0) {
      setProfiles(localProfiles);
      setActiveStudentId(loadActiveStudentId(session.userId));
    }
    setHistory(loadHistory(session.userId));
    setParentSettings(loadParentSettings(session.userId));

    if (session.accountType !== 'family_parent' && activeTab === 'parent') {
      setActiveTab('practice');
    }

    if (isNewUser && session.accountType !== 'family_parent') {
      setOnboardingTargetProfile({
        name: session.name,
      });
      setIsOnboardingOpen(true);
    }
  };

  const handleSignOut = () => {
    if (vaultUnsubRef.current) {
      vaultUnsubRef.current();
      vaultUnsubRef.current = null;
    }
    clearCloudPairingListeners();
    if (auth.currentUser) {
      void signOut(auth);
    }
    setAuthSession(null);
    saveAuthSession(null);
    setIsParentUnlocked(false);
    setFamilyInvites([]);
    setFamilyLinks([]);
    setPendingEmailInvites([]);
    setLinkedChildProfilesByUid({});
    setLinkedChildHistoryByUid({});
    if (activeTab === 'parent') {
      setActiveTab('practice');
    }

    const demoProfiles = loadProfiles(null);
    setProfiles(demoProfiles);
    const demoActiveId = loadActiveStudentId(null);
    setActiveStudentId(demoActiveId);
    setHistory(loadHistory(null));
    setParentSettings(loadParentSettings(null));
  };

  const handleOnboardingComplete = (newProfile: StudentProfile) => {
    const currentUid = authSession?.userId || null;
    const enriched: StudentProfile = {
      ...newProfile,
      ownerUid: currentUid || undefined,
      linkedParentUid: activeChildParentLink?.parentUid || newProfile.linkedParentUid || '',
    };
    const exists = profiles.some((p) => p.id === enriched.id);
    const updatedProfiles = exists
      ? profiles.map((p) => (p.id === enriched.id ? enriched : p))
      : [...profiles, enriched];

    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles, currentUid);
    setActiveStudentId(enriched.id);
    saveActiveStudentId(enriched.id, currentUid);

    if (auth.currentUser && auth.currentUser.uid === currentUid) {
      void upsertStudentInFirestore(auth.currentUser.uid, enriched).catch((err) => {
        console.error('Chyba uložení profilu do Firestore:', err);
      });
    }

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleOpenSchoolWizardForCurrent = () => {
    setOnboardingTargetProfile(activeStudent);
    setIsOnboardingOpen(true);
  };

  const handleAddNewLocalChild = () => {
    setOnboardingTargetProfile({
      name: '',
      schoolType: 'primary_school',
      gradeYear: 7,
      role: 'custom',
    });
    setIsOnboardingOpen(true);
  };

  const handleDeleteLocalChild = async (studentId: string) => {
    if (profiles.length <= 1) return;
    const currentUid = authSession?.userId || null;
    const remaining = profiles.filter((p) => p.id !== studentId);
    setProfiles(remaining);
    saveProfiles(remaining, currentUid);
    if (activeStudentId === studentId && remaining[0]) {
      setActiveStudentId(remaining[0].id);
      saveActiveStudentId(remaining[0].id, currentUid);
    }
    if (auth.currentUser && auth.currentUser.uid === currentUid) {
      await deleteStudentInFirestore(auth.currentUser.uid, studentId);
    }
  };

  const handleOpenParentChildrenFromNavbar = () => {
    setRequestedParentTab('children');
    setActiveTab('parent');
  };

  const handleAcceptInviteCode = async (code: string) => {
    if (!auth.currentUser) {
      throw new Error('Pro přijetí pozvánky se nejprve přihlaste Google účtem.');
    }
    await acceptFamilyInvite(code, auth.currentUser, activeStudent);
    setPendingUrlInviteCode(null);
    setInviteBannerStatus('Propojení s rodičem je aktivní!');
    setTimeout(() => setInviteBannerStatus(null), 5000);
    if (typeof window !== 'undefined' && window.location.search.includes('invite=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('invite');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  };

  const handleUnlinkAsChild = async () => {
    if (!activeChildParentLink || !auth.currentUser) return;
    await unlinkFamilyAccount(activeChildParentLink.id, auth.currentUser.uid, true);
  };

  const handleCreateInvite = async (options: {
    invitedEmail?: string;
    childLabel?: string;
  }): Promise<FamilyInvite> => {
    if (!auth.currentUser || !authSession) {
      throw new Error('Pro odeslání pozvánky musíte být přihlášeni jako rodič.');
    }
    return createFamilyInvite(auth.currentUser.uid, authSession.name, options);
  };

  const handleUnlinkChildAsParent = async (link: FamilyLink) => {
    await unlinkFamilyAccount(link.id, link.childUid, false);
  };

  const checkBadgeUnlocks = (
    currentStudent: StudentProfile,
    newHistoryItem: ProblemHistoryItem,
    allHistory: ProblemHistoryItem[]
  ): string[] => {
    const unlocked = [...currentStudent.unlockedBadges];
    const newBadges: string[] = [];

    if (newHistoryItem.isCorrect && !unlocked.includes('badge_first_solve')) {
      newBadges.push('badge_first_solve');
    }

    if (newHistoryItem.isCorrect && newHistoryItem.hintsUsed === 0 && !unlocked.includes('badge_no_hint')) {
      const recentFive = allHistory
        .filter((h) => h.studentId === currentStudent.id && h.isCorrect && h.hintsUsed === 0)
        .slice(-5);
      if (recentFive.length >= 5) {
        newBadges.push('badge_no_hint');
      }
    }

    if (
      newHistoryItem.topic === 'finance' &&
      newHistoryItem.isCorrect &&
      !unlocked.includes('badge_finance_master')
    ) {
      const financeCount = allHistory.filter(
        (h) => h.studentId === currentStudent.id && h.topic === 'finance' && h.isCorrect
      ).length;
      if (financeCount >= 5) {
        newBadges.push('badge_finance_master');
      }
    }

    if (
      newHistoryItem.grade === 'grade_9' &&
      newHistoryItem.isCorrect &&
      !unlocked.includes('badge_cermat_ready')
    ) {
      const cermatCount = allHistory.filter(
        (h) => h.studentId === currentStudent.id && h.grade === 'grade_9' && h.isCorrect
      ).length;
      if (cermatCount >= 5) {
        newBadges.push('badge_cermat_ready');
      }
    }

    const hour = new Date().getHours();
    if ((hour >= 19 || hour < 5) && !unlocked.includes('badge_night_owl')) {
      newBadges.push('badge_night_owl');
    }

    return newBadges;
  };

  const handleProblemSolved = (
    problem: Problem,
    isCorrect: boolean,
    hintsUsed: number,
    timeSpentSec: number
  ) => {
    let quality = 1;
    if (isCorrect) {
      if (hintsUsed === 0) quality = 5;
      else if (hintsUsed === 1) quality = 4;
      else quality = 3;
    }

    const prevAttempts = history.filter(
      (h) => h.studentId === activeStudent.id && h.problemId === problem.id
    );
    const lastAttempt = prevAttempts[prevAttempts.length - 1];

    const sm2 = calculateSM2(
      quality,
      lastAttempt?.repetitions || 0,
      lastAttempt?.interval || 1,
      lastAttempt?.easeFactor || 2.5
    );

    const historyItem: ProblemHistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      problemId: problem.id,
      studentId: activeStudent.id,
      topic: problem.topic,
      topicName: problem.topicName,
      grade: problem.grade,
      title: problem.title,
      userAnswer: problem.correctAnswer,
      isCorrect,
      hintsUsed,
      timeSpentSeconds: timeSpentSec,
      timestamp: Date.now(),
      nextReviewDate: sm2.nextReviewDate,
      interval: sm2.interval,
      repetitions: sm2.repetitions,
      easeFactor: sm2.easeFactor,
      linkedParentUid: activeChildParentLink?.parentUid || activeStudent.linkedParentUid || '',
    };

    appendHistoryItem(historyItem, authSession?.userId);
    const updatedHistory = [...history, historyItem];
    setHistory(updatedHistory);

    if (auth.currentUser && auth.currentUser.uid === authSession?.userId) {
      void appendHistoryInFirestore(auth.currentUser.uid, historyItem).catch((err) => {
        console.error('Chyba zápisu historie do Firestore:', err);
      });
    }

    let addedXp = isCorrect ? 15 : 5;
    let addedCoins = isCorrect ? 5 : 1;
    if (isCorrect && hintsUsed === 0) {
      addedCoins += 2;
      addedXp += 5;
    }

    const newBadges = checkBadgeUnlocks(activeStudent, historyItem, updatedHistory);
    if (newBadges.length > 0) {
      setRecentBadge(newBadges[0]);
      setTimeout(() => setRecentBadge(null), 4000);
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
      });
    }

    const updatedStudent: StudentProfile = {
      ...activeStudent,
      xp: activeStudent.xp + addedXp,
      coins: activeStudent.coins + addedCoins,
      unlockedBadges: Array.from(new Set([...activeStudent.unlockedBadges, ...newBadges])),
      linkedParentUid: activeChildParentLink?.parentUid || activeStudent.linkedParentUid || '',
    };

    handleUpdateStudent(updatedStudent);
  };

  const studentDueItems = getProblemsDueForReview(
    history.filter((h) => h.studentId === activeStudent.id)
  );

  const firstPendingEmailInvite =
    !isParentRole && !activeChildParentLink && pendingEmailInvites.length > 0
      ? pendingEmailInvites[0]
      : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 pb-20 md:pb-8">
      {/* Offline Toast */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline režim aktivní — aplikace plně funguje z lokální databáze příkladů.</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        students={profiles}
        activeStudent={activeStudent}
        onSelectStudent={handleSelectStudent}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onOpenSync={() => setIsSyncOpen(true)}
        isParentUnlocked={isParentUnlocked}
        authSession={authSession}
        onOpenAuth={() => {
          setSsoPreferredRole(undefined);
          setIsAuthOpen(true);
        }}
        onSignOut={handleSignOut}
        onOpenSchoolWizard={handleOpenSchoolWizardForCurrent}
        onAddStudent={handleOpenParentChildrenFromNavbar}
      />

      {/* Invite Acceptance / Pairing Feedback Banner */}
      {inviteBannerStatus && (
        <div className="max-w-4xl mx-auto px-4 mt-3 w-full">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{inviteBannerStatus}</span>
          </div>
        </div>
      )}

      {(pendingUrlInviteCode || firstPendingEmailInvite) && !activeChildParentLink && (
        <div className="max-w-4xl mx-auto px-4 mt-3 w-full">
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-950 dark:text-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
              <div className="space-y-0.5">
                {pendingUrlInviteCode ? (
                  <p>
                    Obdrželi jste pozvánku k rodinnému propojení (klíč{' '}
                    <strong className="font-mono tabular-nums">{pendingUrlInviteCode}</strong>).
                  </p>
                ) : firstPendingEmailInvite ? (
                  <p>
                    Rodič <strong>{firstPendingEmailInvite.parentName}</strong> vám poslal pozvánku ke sdílení pokroku (klíč{' '}
                    <strong className="font-mono tabular-nums">{firstPendingEmailInvite.code}</strong>).
                  </p>
                ) : null}
                {inviteBannerError && (
                  <p className="text-rose-600 dark:text-rose-400 font-medium">{inviteBannerError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!authSession ? (
                <button
                  type="button"
                  onClick={() => {
                    setSsoPreferredRole('individual_student');
                    setIsAuthOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs whitespace-nowrap"
                >
                  Přihlásit se jako žák a přijmout
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isAcceptingInviteBanner}
                  onClick={async () => {
                    const codeToAccept =
                      pendingUrlInviteCode || firstPendingEmailInvite?.code || '';
                    if (!codeToAccept) return;
                    setInviteBannerError(null);
                    setIsAcceptingInviteBanner(true);
                    try {
                      await handleAcceptInviteCode(codeToAccept);
                    } catch (err) {
                      setInviteBannerError(
                        err instanceof Error ? err.message : 'Nepodařilo se přijmout pozvánku.'
                      );
                    } finally {
                      setIsAcceptingInviteBanner(false);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs whitespace-nowrap"
                >
                  {isAcceptingInviteBanner ? 'Propojuji...' : 'Přijmout propojení'}
                </button>
              )}

              {pendingUrlInviteCode && (
                <button
                  type="button"
                  onClick={() => {
                    setPendingUrlInviteCode(null);
                    setInviteBannerError(null);
                    if (typeof window !== 'undefined' && window.location.search.includes('invite=')) {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('invite');
                      window.history.replaceState({}, '', url.pathname + url.search);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  title="Zavřít"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Badge Unlock Celebration Banner */}
      {recentBadge && (
        <div className="sticky top-16 z-40 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-bold py-2 px-4 shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <Award className="w-4 h-4 text-slate-950" />
          <span>Gratulujeme! Odemkl(a) jsi nový matematický odznak!</span>
        </div>
      )}

      {/* Active Student & School Ribbon on Mobile/Tablet (hidden on Parent Dashboard) */}
      {activeTab !== 'parent' && (
        <div className="lg:hidden max-w-4xl mx-auto px-4 pt-3 w-full">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 min-w-0">
              <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">
                {activeStudent.name} ·{' '}
                {activeStudent.schoolType === 'cermat_prep'
                  ? 'CERMAT 9. třída'
                  : activeStudent.schoolType === 'business_lyceum'
                  ? `Obchodní lyceum (${activeStudent.gradeYear}. roč.)`
                  : activeStudent.schoolType === 'grammar_school'
                  ? `Gymnázium (${activeStudent.gradeYear}. roč.)`
                  : activeStudent.schoolType === 'primary_school'
                  ? `ZŠ (${activeStudent.gradeYear}. třída)`
                  : `Matematika (${activeStudent.gradeYear}. roč.)`}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {(!authSession || isParentRole) && profiles.length > 1 && (
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                  {profiles.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleSelectStudent(st)}
                      className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                        st.id === activeStudent.id
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {st.avatarEmoji} {st.name}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleOpenSchoolWizardForCurrent}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 underline underline-offset-2 whitespace-nowrap"
              >
                Změnit školu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Study Time Warning if reached limit */}
      {activeStudent.todayMinutesStudied >= activeDailyTimeLimit && (
        <div className="max-w-4xl mx-auto px-4 mt-3 w-full">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
            <span>
              Dnes máš splněný stanovený cíl {activeDailyTimeLimit} minut studia! Můžeš si odpočinout nebo pokračovat dál.
            </span>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {activeTab === 'practice' && (
          <ProblemView
            student={activeStudent}
            onProblemSolved={handleProblemSolved}
            onOpenSchoolWizard={handleOpenSchoolWizardForCurrent}
          />
        )}

        {activeTab === 'review' && (
          <SpacedRepetitionView
            student={activeStudent}
            history={history}
            onStartReview={() => setActiveTab('practice')}
          />
        )}

        {activeTab === 'gamification' && (
          <GamificationView
            student={activeStudent}
            onUpdateStudent={handleUpdateStudent}
            todaySolvedCount={history.filter((h) => h.studentId === activeStudent.id).length}
          />
        )}

        {activeTab === 'parent' && (
          <ParentDashboard
            students={parentDashboardStudents}
            history={parentDashboardHistory}
            settings={parentSettings}
            onUpdateSettings={handleUpdateParentSettings}
            isUnlocked={isParentUnlocked}
            onUnlock={() => setIsParentUnlocked(true)}
            onLock={() => setIsParentUnlocked(false)}
            authSession={authSession}
            invites={familyInvites}
            familyLinks={familyLinks}
            requestedTab={requestedParentTab}
            onClearRequestedTab={() => setRequestedParentTab(null)}
            onAddLocalChild={handleAddNewLocalChild}
            onEditLocalChild={(st) => {
              setOnboardingTargetProfile(st);
              setIsOnboardingOpen(true);
            }}
            onDeleteLocalChild={handleDeleteLocalChild}
            onCreateInvite={handleCreateInvite}
            onRevokeInvite={revokeFamilyInvite}
            onDeleteInvite={deleteFamilyInvite}
            onUnlinkChild={handleUnlinkChildAsParent}
            onUpdateLinkedLimit={updateLinkedChildTimeLimit}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        reviewCount={studentDueItems.length}
        isParentRole={isParentRole}
      />

      {/* SSO Authentication Modal */}
      <SSOAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        currentSession={authSession}
        onSignOut={handleSignOut}
        initialAccountType={ssoPreferredRole}
        initialInviteCode={pendingUrlInviteCode || undefined}
        activeParentLink={activeChildParentLink}
        pendingInvitesForEmail={pendingEmailInvites}
        onAcceptInvite={handleAcceptInviteCode}
        onUnlinkParent={handleUnlinkAsChild}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialProfile={onboardingTargetProfile}
        onComplete={handleOnboardingComplete}
      />

      {/* Cloud Sync / Export Modal */}
      <SyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        userId={authSession?.userId || null}
        onDataImported={() => {
          const uid = authSession?.userId || null;
          setProfiles(loadProfiles(uid));
          setHistory(loadHistory(uid));
          setParentSettings(loadParentSettings(uid));
        }}
      />
    </div>
  );
}
