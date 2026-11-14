import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  Clock,
  TrendingUp,
  Download,
  KeyRound,
  Check,
  BarChart3,
  Sliders,
  AlertCircle,
  Lock,
  Unlock,
  UserCheck,
  Users,
  UserPlus,
  Mail,
  Copy,
  Trash2,
  Unlink,
  Link2,
  Pencil,
  Loader2,
  XCircle,
} from 'lucide-react';
import {
  StudentProfile,
  ProblemHistoryItem,
  ParentSettings,
  AuthSession,
  FamilyInvite,
  FamilyLink,
} from '../types';
import { generateTeacherReportPDF } from '../utils/pdfExport';
import {
  verifyPinHash,
  hashPin,
  loadPinLockout,
  recordFailedPinAttempt,
  resetPinLockout,
  PinLockoutState,
} from '../utils/storage';

interface ParentDashboardProps {
  students: StudentProfile[];
  history: ProblemHistoryItem[];
  settings: ParentSettings;
  onUpdateSettings: (newSettings: ParentSettings) => void;
  isUnlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
  authSession?: AuthSession | null;
  invites?: FamilyInvite[];
  familyLinks?: FamilyLink[];
  requestedTab?: 'stats' | 'children' | 'limits' | 'reports' | null;
  onClearRequestedTab?: () => void;
  onAddLocalChild: () => void;
  onEditLocalChild: (student: StudentProfile) => void;
  onDeleteLocalChild: (studentId: string) => Promise<void>;
  onCreateInvite: (options: {
    invitedEmail?: string;
    childLabel?: string;
  }) => Promise<FamilyInvite>;
  onRevokeInvite: (code: string) => Promise<void>;
  onDeleteInvite: (code: string) => Promise<void>;
  onUnlinkChild: (link: FamilyLink) => Promise<void>;
  onUpdateLinkedLimit: (linkId: string, minutes: number) => Promise<void>;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  students,
  history,
  settings,
  onUpdateSettings,
  isUnlocked,
  onUnlock,
  onLock,
  authSession,
  invites = [],
  familyLinks = [],
  requestedTab,
  onClearRequestedTab,
  onAddLocalChild,
  onEditLocalChild,
  onDeleteLocalChild,
  onCreateInvite,
  onRevokeInvite,
  onDeleteInvite,
  onUnlinkChild,
  onUpdateLinkedLimit,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'stats' | 'children' | 'limits' | 'reports'>('stats');
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [lockoutState, setLockoutState] = useState<PinLockoutState>(loadPinLockout);
  const [remainingLockSec, setRemainingLockSec] = useState<number>(0);

  // Children & Invite form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteChildLabel, setInviteChildLabel] = useState('');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<string | null>(null);
  const [confirmUnlinkId, setConfirmUnlinkId] = useState<string | null>(null);
  const [busyActionId, setBusyActionId] = useState<string | null>(null);

  // Sync requested tab from Navbar / external triggers
  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
      onClearRequestedTab?.();
    }
  }, [requestedTab, onClearRequestedTab]);

  // Keep selectedStudentId valid when students list changes
  useEffect(() => {
    if (students.length > 0 && !students.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Periodic lockout check
  useEffect(() => {
    const checkLockout = () => {
      const state = loadPinLockout();
      setLockoutState(state);
      const diff = state.lockedUntil - Date.now();
      if (diff > 0) {
        setRemainingLockSec(Math.ceil(diff / 1000));
      } else {
        setRemainingLockSec(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // 5-minute session inactivity auto-lock
  useEffect(() => {
    if (!isUnlocked) return;
    const autoLockTimer = setTimeout(() => {
      onLock();
    }, 5 * 60 * 1000);

    return () => clearTimeout(autoLockTimer);
  }, [isUnlocked, onLock]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const isSelectedLinked = Boolean(
    selectedStudent?.ownerUid &&
      authSession?.userId &&
      selectedStudent.ownerUid !== authSession.userId
  );
  const selectedLink = isSelectedLinked
    ? familyLinks.find((l) => l.childUid === selectedStudent?.ownerUid)
    : undefined;

  const ownLocalStudents = students.filter(
    (s) => !s.ownerUid || !authSession?.userId || s.ownerUid === authSession.userId
  );

  const studentHistory = history.filter((h) => h.studentId === selectedStudent?.id);
  const totalSolved = studentHistory.length;
  const correctCount = studentHistory.filter((h) => h.isCorrect).length;
  const accuracy = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;
  const totalMinutes = Math.round(
    studentHistory.reduce((acc, cur) => acc + (cur.timeSpentSeconds || 60), 0) / 60
  );

  // Group by topic for accuracy breakdown
  const topicStats: Record<string, { total: number; correct: number; name: string }> = {};
  for (const item of studentHistory) {
    if (!topicStats[item.topic]) {
      topicStats[item.topic] = { total: 0, correct: 0, name: item.topicName || item.topic };
    }
    topicStats[item.topic].total += 1;
    if (item.isCorrect) topicStats[item.topic].correct += 1;
  }

  const getSchoolText = (st: StudentProfile) => {
    if (st.schoolType === 'cermat_prep') return 'CERMAT 9. třída';
    if (st.schoolType === 'business_lyceum') return `Obchodní lyceum (${st.gradeYear}. roč.)`;
    if (st.schoolType === 'grammar_school') return `Gymnázium (${st.gradeYear}. roč.)`;
    if (st.schoolType === 'primary_school') return `ZŠ (${st.gradeYear}. třída)`;
    if (st.schoolType === 'vocational_sos') return `SOŠ (${st.gradeYear}. roč.)`;
    if (st.schoolType === 'university') return `VŠ (${st.gradeYear}. roč.)`;
    return `${st.gradeYear}. ročník`;
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingLockSec > 0) return;

    const isValid = await verifyPinHash(pinInput, settings.pinHash, settings.pinSalt);

    if (isValid) {
      resetPinLockout();
      onUnlock();
      setPinError(false);
      setPinInput('');
    } else {
      const updated = recordFailedPinAttempt();
      setLockoutState(updated);
      setPinError(true);
    }
  };

  const handleUpdateLimit = async (minutes: number) => {
    if (selectedLink) {
      await onUpdateLinkedLimit(selectedLink.id, minutes);
    } else {
      onUpdateSettings({
        ...settings,
        dailyTimeLimitMinutes: minutes,
      });
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      const salt = `mathhero_salt_${Date.now()}`;
      const hash = await hashPin(newPin, salt);
      onUpdateSettings({
        ...settings,
        pin: '',
        pinHash: hash,
        pinSalt: salt,
      });
      setNewPin('');
      setPinSuccess(true);
      setTimeout(() => setPinSuccess(false), 3000);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    const trimmedEmail = inviteEmail.trim().toLowerCase();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setInviteError('Zadejte prosím platnou e-mailovou adresu (např. jmeno@gmail.com).');
      return;
    }

    setIsCreatingInvite(true);
    try {
      await onCreateInvite({
        invitedEmail: trimmedEmail || undefined,
        childLabel: inviteChildLabel.trim() || undefined,
      });
      setInviteEmail('');
      setInviteChildLabel('');
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : 'Nepodařilo se vytvořit pozvánku. Zkuste to prosím znovu.'
      );
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const copyText = async (keyId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(keyId);
      setTimeout(() => setCopiedId((prev) => (prev === keyId ? null : prev)), 2200);
    } catch {
      // Fallback ignored in restricted frames
    }
  };

  const buildInviteUrl = (code: string) => {
    if (typeof window === 'undefined') return `?invite=${code}`;
    return `${window.location.origin}/?invite=${encodeURIComponent(code)}`;
  };

  const buildMailtoHref = (inv: FamilyInvite) => {
    const inviteUrl = buildInviteUrl(inv.code);
    const subject = `Pozvánka do MathHero od ${inv.parentName}`;
    const body = [
      `Ahoj${inv.childLabel ? ` ${inv.childLabel}` : ''},`,
      '',
      `připojuji tě ke svému rodinnému přehledu v matematickém trenažéru MathHero.`,
      '',
      `1. Otevři aplikaci zde: ${inviteUrl}`,
      `2. Přihlas se svým Google (Gmail) účtem jako „Samostatný žák“.`,
      `3. Potvrď pozvánku nebo zadej párovací klíč: ${inv.code}`,
      '',
      `Platnost klíče je 48 hodin.`,
    ].join('\n');
    const recipient = inv.invitedEmail ? encodeURIComponent(inv.invitedEmail) : '';
    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // If locked, render PIN Gate & SSO Parent Verification
  if (!isUnlocked) {
    const isLockedOut = remainingLockSec > 0;
    const isParentSSO = authSession?.accountType === 'family_parent';

    return (
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              Rodičovský panel
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bezpečný přístup k dětem, pozvánkám, limitům a exportům pro učitele
            </p>
          </div>

          {/* Option A: Verified Google Parent 1-click Unlock */}
          {isParentSSO && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-xs">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Ověřený rodič: {authSession.name}</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                Jste přihlášeni přes {authSession.provider === 'apple' ? 'Apple ID' : 'Google'} s oprávněním rodinného správce.
              </p>
              <button
                type="button"
                onClick={() => {
                  resetPinLockout();
                  onUnlock();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] min-h-[44px]"
              >
                <Unlock className="w-4 h-4" />
                <span>Odemknout přes ověřený SSO účet</span>
              </button>
            </div>
          )}

          {isParentSSO && (
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span>nebo použijte PIN</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>
          )}

          {/* Lockout Notice if brute force attempts exceeded */}
          {isLockedOut ? (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs space-y-1 text-left">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Zabezpečení: Zadávání PINu dočasně pozastaveno</span>
              </div>
              <p className="text-[11px]">
                Z důvodu opakovaných chybných pokusů je vstup uzamčen ještě na{' '}
                <strong className="font-mono tabular-nums text-rose-700 dark:text-rose-300">
                  {remainingLockSec} s
                </strong>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  disabled={isLockedOut}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, ''));
                    setPinError(false);
                  }}
                  placeholder="PIN (výchozí: 1234)"
                  className="w-48 mx-auto text-center tracking-[0.5em] text-2xl font-mono py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                {pinError && (
                  <div className="text-xs text-rose-500 mt-2 font-medium space-y-0.5">
                    <p>Nesprávný PIN kód.</p>
                    {lockoutState.failedAttempts > 0 && (
                      <p className="text-[11px] text-slate-400">
                        Zbývající pokusy před zámkem: {Math.max(0, 5 - lockoutState.failedAttempts)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={pinInput.length !== 4 || isLockedOut}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-sm min-h-[44px]"
              >
                Odemknout PINem
              </button>
            </form>
          )}

          <p className="text-[11px] text-slate-400 italic">
            Výchozí rodičovský kód je 1234. PIN je šifrován SHA-256 se solí.
          </p>
        </div>
      </div>
    );
  }

  const activeDailyLimit = selectedLink
    ? selectedLink.dailyTimeLimitMinutes
    : settings.dailyTimeLimitMinutes;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            <span>Rodičovský režim</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Odemčeno</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
            Rodičovský dohled & správa dětí
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Student Selector */}
          {students.length > 0 && (
            <select
              value={selectedStudent?.id || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
            >
              {students.map((s) => {
                const linked =
                  s.ownerUid && authSession?.userId && s.ownerUid !== authSession.userId;
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} · {getSchoolText(s)} {linked ? '(Gmail účet)' : ''}
                  </option>
                );
              })}
            </select>
          )}

          <button
            onClick={onLock}
            className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            Zamknout
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 min-h-[40px] ${
            activeTab === 'stats'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Statistiky</span>
        </button>

        <button
          onClick={() => setActiveTab('children')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 min-h-[40px] ${
            activeTab === 'children'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Děti & Pozvánky ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('limits')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 min-h-[40px] ${
            activeTab === 'limits'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Limity & PIN</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 min-h-[40px] ${
            activeTab === 'reports'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>PDF report</span>
        </button>
      </div>

      {/* Tab: Stats */}
      {activeTab === 'stats' && selectedStudent && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Vyřešeno úloh
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {totalSolved} ks
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Celková úspěšnost
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {accuracy} %
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Doba u matematiky
              </span>
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                {totalMinutes + selectedStudent.todayMinutesStudied} min
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Aktuální série
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                {selectedStudent.streak} dní
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Úspěšnost podle matematických oblastí</span>
            </h3>

            {Object.keys(topicStats).length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic py-3">
                Zatím nebyly zaznamenány žádné vyřešené úlohy pro tohoto studenta.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(topicStats).map(([topicKey, st]) => {
                  const pct = Math.round((st.correct / st.total) * 100);
                  return (
                    <div key={topicKey} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {st.name}
                        </span>
                        <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          {st.correct} z {st.total} správně ({pct} %)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            pct >= 75
                              ? 'bg-emerald-500'
                              : pct >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Children & Gmail Invites */}
      {activeTab === 'children' && (
        <div className="space-y-6">
          {/* Card 1: All Family Children + Add Local Profile */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Děti v rodinném přehledu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Spravujte lokální profily na společném zařízení i děti připojené přes vlastní Gmail účet.
                </p>
              </div>
              <button
                type="button"
                onClick={onAddLocalChild}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Přidat profil dítěte (bez Gmailu)</span>
              </button>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800">
              {students.map((st) => {
                const isLinked =
                  Boolean(st.ownerUid && authSession?.userId && st.ownerUid !== authSession.userId);
                const link = isLinked
                  ? familyLinks.find((l) => l.childUid === st.ownerUid)
                  : undefined;
                const solvedCount = history.filter((h) => h.studentId === st.id).length;

                return (
                  <div
                    key={st.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{st.avatarEmoji}</span>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {st.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {getSchoolText(st)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          <span className={isLinked ? 'text-blue-600 dark:text-blue-400 font-sans font-medium' : 'font-sans'}>
                            {isLinked
                              ? `Propojený Gmail${link?.childEmail ? `: ${link.childEmail}` : ''}`
                              : 'Lokální profil na účtu rodiče'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{st.xp} XP</span>
                          <span aria-hidden="true">·</span>
                          <span>{solvedCount} úloh</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isLinked ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onEditLocalChild(st)}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors min-h-[40px]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Upravit školu</span>
                          </button>

                          {ownLocalStudents.length > 1 && (
                            confirmDeleteStudentId === st.id ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={busyActionId === st.id}
                                  onClick={async () => {
                                    setBusyActionId(st.id);
                                    try {
                                      await onDeleteLocalChild(st.id);
                                      setConfirmDeleteStudentId(null);
                                    } finally {
                                      setBusyActionId(null);
                                    }
                                  }}
                                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold min-h-[40px]"
                                >
                                  {busyActionId === st.id ? 'Mažu...' : 'Potvrdit smazání'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteStudentId(null)}
                                  className="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 min-h-[40px]"
                                >
                                  Zrušit
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteStudentId(st.id)}
                                title="Odebrat lokální profil"
                                className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Odebrat</span>
                              </button>
                            )
                          )}
                        </>
                      ) : link ? (
                        confirmUnlinkId === link.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={busyActionId === link.id}
                              onClick={async () => {
                                setBusyActionId(link.id);
                                try {
                                  await onUnlinkChild(link);
                                  setConfirmUnlinkId(null);
                                } finally {
                                  setBusyActionId(null);
                                }
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold min-h-[40px]"
                            >
                              {busyActionId === link.id ? 'Odpojuji...' : 'Potvrdit odpojení'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmUnlinkId(null)}
                              className="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 min-h-[40px]"
                            >
                              Zrušit
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmUnlinkId(link.id)}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px]"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                            <span>Odpojit účet</span>
                          </button>
                        )
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Invite Child via Gmail + Pairing Key */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Pozvat dítě s vlastním Gmail účtem (Párovací klíč)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Pokud má dítě vlastní Google účet, vygenerujte mu jednorázový párovací klíč. Když vyplníte jeho Gmail, pozvánka se mu zobrazí automaticky po přihlášení do aplikace a zároveň ji můžete jedním kliknutím poslat e-mailem.
              </p>
            </div>

            {!authSession ? (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Pro vytváření cloudových pozvánek se nejprve přihlaste přes Google účet rodiče.
              </p>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="invite-child-label"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Jméno dítěte (volitelné)
                    </label>
                    <input
                      id="invite-child-label"
                      type="text"
                      maxLength={50}
                      value={inviteChildLabel}
                      onChange={(e) => setInviteChildLabel(e.target.value)}
                      placeholder="např. Marie, Sam, Tereza"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="invite-child-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Gmail dítěte (volitelné — pro cílenou pozvánku)
                    </label>
                    <input
                      id="invite-child-email"
                      type="email"
                      maxLength={200}
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setInviteError(null);
                      }}
                      placeholder="např. dite@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[42px]"
                    />
                  </div>
                </div>

                {inviteError && (
                  <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{inviteError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreatingInvite}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                >
                  {isCreatingInvite ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  <span>Vytvořit pozvánku a párovací klíč</span>
                </button>
              </form>
            )}

            {/* Existing Invites List */}
            {invites.length > 0 && (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 pt-2">
                {invites.map((inv) => {
                  const isExpired = inv.status === 'pending' && inv.expiresAt < Date.now();
                  const statusLabel =
                    inv.status === 'accepted'
                      ? `Spárováno (${inv.acceptedChildName || 'Žák'})`
                      : inv.status === 'revoked'
                      ? 'Zrušeno'
                      : isExpired
                      ? 'Vypršela platnost'
                      : 'Čeká na přijetí';

                  return (
                    <div
                      key={inv.code}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono tabular-nums font-bold text-sm text-slate-900 dark:text-white tracking-wider">
                            {inv.code}
                          </span>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                            ·
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              inv.status === 'accepted'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : inv.status === 'pending' && !isExpired
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {inv.childLabel ? `${inv.childLabel} · ` : ''}
                          {inv.invitedEmail ? inv.invitedEmail : 'Otevřený klíč (libovolný Google účet)'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {inv.status === 'pending' && !isExpired && (
                          <>
                            <button
                              type="button"
                              onClick={() => copyText(`code_${inv.code}`, inv.code)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors min-h-[36px]"
                            >
                              {copiedId === `code_${inv.code}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Klíč zkopírován</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Kopírovat klíč</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => copyText(`url_${inv.code}`, buildInviteUrl(inv.code))}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors min-h-[36px]"
                            >
                              {copiedId === `url_${inv.code}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Odkaz zkopírován</span>
                                </>
                              ) : (
                                <>
                                  <Link2 className="w-3.5 h-3.5" />
                                  <span>Odkaz</span>
                                </>
                              )}
                            </button>

                            <a
                              href={buildMailtoHref(inv)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 transition-colors min-h-[36px]"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Poslat e-mailem</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => void onRevokeInvite(inv.code)}
                              title="Zrušit platnost pozvánky"
                              className="px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-colors min-h-[36px]"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Zrušit</span>
                            </button>
                          </>
                        )}

                        {(inv.status !== 'pending' || isExpired) && (
                          <button
                            type="button"
                            onClick={() => void onDeleteInvite(inv.code)}
                            className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 text-xs font-medium flex items-center gap-1 transition-colors min-h-[36px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Smazat</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Time limits & settings */}
      {activeTab === 'limits' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>
                Denní časový limit{' '}
                {selectedLink ? `pro účet ${selectedStudent?.name}` : 'pro domácí profily'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nastavte doporučený denní limit v minutách. Aplikace dítě upozorní na splnění cíle.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nastavený limit:
              </span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                {activeDailyLimit} minut denně
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[15, 20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => void handleUpdateLimit(mins)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors min-h-[40px] ${
                    activeDailyLimit === mins
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Change PIN section */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              Změna rodičovského PIN kódu
            </h4>

            <form onSubmit={handleChangePin} className="flex items-center gap-2 max-w-xs">
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Nový 4místný PIN"
                className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
              />
              <button
                type="submit"
                disabled={newPin.length !== 4}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shrink-0 min-h-[40px]"
              >
                Uložit PIN
              </button>
            </form>
            {pinSuccess && (
              <p className="text-xs text-emerald-600 font-medium">PIN byl úspěšně změněn!</p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Teacher Reports Export */}
      {activeTab === 'reports' && selectedStudent && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Export oficiálního reportu pro učitele do PDF</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vygeneruje strukturovaný dokument formátu A4 se statistikami, zvládnutými tématy a podpisovým polem.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Vybraný student pro report:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedStudent.name} · {getSchoolText(selectedStudent)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Zahrnutý počet úloh:</span>
              <span className="font-mono tabular-nums font-semibold">{totalSolved} příkladů</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Úspěšnost v reportu:</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-600">
                {accuracy} %
              </span>
            </div>

            <button
              onClick={() => generateTeacherReportPDF(selectedStudent, history)}
              className="mt-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>Stáhnout PDF report pro učitele matematiky</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
