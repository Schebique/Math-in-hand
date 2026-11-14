import React from 'react';
import {
  Flame,
  Coins,
  Moon,
  Sun,
  Shield,
  RefreshCw,
  Award,
  BookOpen,
  CalendarCheck,
  User,
  LogIn,
  Sliders,
  Plus,
  School,
} from 'lucide-react';
import { StudentProfile, AuthSession } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  students: StudentProfile[];
  activeStudent: StudentProfile;
  onSelectStudent: (student: StudentProfile) => void;
  activeTab: 'practice' | 'review' | 'gamification' | 'parent';
  onChangeTab: (tab: 'practice' | 'review' | 'gamification' | 'parent') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSync: () => void;
  isParentUnlocked: boolean;
  authSession: AuthSession | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSchoolWizard: () => void;
  onAddStudent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  students,
  activeStudent,
  onSelectStudent,
  activeTab,
  onChangeTab,
  darkMode,
  onToggleDarkMode,
  onOpenSync,
  isParentUnlocked,
  authSession,
  onOpenAuth,
  onSignOut,
  onOpenSchoolWizard,
  onAddStudent,
}) => {
  const getSchoolBadgeLabel = (st: StudentProfile) => {
    if (st.schoolType === 'cermat_prep') return 'CERMAT 9. třída';
    if (st.schoolType === 'business_lyceum') return `Obchodní lyceum ${st.gradeYear}. ročník`;
    if (st.schoolType === 'grammar_school') return `Gymnázium ${st.gradeYear}. ročník`;
    if (st.schoolType === 'primary_school') return `ZŠ ${st.gradeYear}. třída`;
    if (st.schoolType === 'vocational_sos') return `SOŠ ${st.gradeYear}. ročník`;
    if (st.schoolType === 'university') return `VŠ ${st.gradeYear}. ročník`;
    return 'Matematika';
  };

  const isParentRole = authSession?.accountType === 'family_parent';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-2.5 md:px-4 lg:px-6 h-16 flex items-center justify-between gap-1.5 md:gap-2 lg:gap-3">
        {/* Zone 1: Brand Wordmark & Active School Badge */}
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 shrink-0">
          <button
            onClick={() => onChangeTab('practice')}
            className="flex items-center gap-1.5 sm:gap-2 text-left focus:outline-none"
          >
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 shrink-0">
              <span className="text-base lg:text-lg font-bold">π</span>
            </div>
            <div className="min-w-0">
              <span className="text-base lg:text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display block leading-tight whitespace-nowrap">
                MathHero
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden lg:block whitespace-nowrap">
                SSO & Adaptivní osnovy
              </span>
            </div>
          </button>

          {/* Quick Change School Button (only on student tabs, hidden when parent is in Parent Dashboard) */}
          {activeTab !== 'parent' && (
            <button
              onClick={onOpenSchoolWizard}
              title="Klikněte pro změnu školy a ročníku"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap"
            >
              <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{getSchoolBadgeLabel(activeStudent)}</span>
              {!isParentRole && (
                <span className="text-[10px] text-slate-400 font-normal underline ml-0.5">změnit</span>
              )}
            </button>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 min-w-0">
          <button
            onClick={() => onChangeTab('practice')}
            className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'practice'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Trénink</span>
          </button>

          <button
            onClick={() => onChangeTab('review')}
            className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'review'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <CalendarCheck className="w-4 h-4 shrink-0" />
            <span>Opakování</span>
          </button>

          <button
            onClick={() => onChangeTab('gamification')}
            className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'gamification'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Ligy & Mise</span>
          </button>

          {isParentRole && (
            <button
              onClick={() => onChangeTab('parent')}
              className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'parent'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Rodič</span>
              {isParentUnlocked && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Odemčeno" />
              )}
            </button>
          )}
        </nav>

        {/* Zone 3: Gamification Stats, Profiles & SSO */}
        <div className="flex items-center gap-1.5 lg:gap-2.5 shrink-0">
          {/* Active Students Switcher: Hidden on mobile/tablet (rendered in Mobile/Tablet Ribbon below header), shown on desktop */}
          {!authSession ? (
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {students.map((st) => {
                const isSelected = st.id === activeStudent.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => onSelectStudent(st)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                    title={`${st.name} – ${getSchoolBadgeLabel(st)}`}
                  >
                    <span className="text-sm">{st.avatarEmoji}</span>
                    <span className="hidden sm:inline">{st.name}</span>
                  </button>
                );
              })}
            </div>
          ) : authSession.accountType === 'family_parent' ? (
            /* Family parent account: show children switcher on desktop */
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {students.map((st) => {
                const isSelected = st.id === activeStudent.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => onSelectStudent(st)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                    title={`${st.name} – ${getSchoolBadgeLabel(st)}`}
                  >
                    <span className="text-sm">{st.avatarEmoji}</span>
                    <span>{st.name}</span>
                  </button>
                );
              })}
              <button
                onClick={onAddStudent}
                title="Přidat nebo pozvat dítě v menu Rodič"
                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

          {/* Streak Flame */}
          <div
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-lg text-amber-600 dark:text-amber-400 font-semibold text-xs whitespace-nowrap shrink-0"
            title={`Denní série: ${activeStudent.streak} dní v řadě`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="font-mono tabular-nums">{activeStudent.streak}</span>
          </div>

          {/* MathCoins */}
          <div
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800/60 rounded-lg text-yellow-700 dark:text-yellow-400 font-semibold text-xs whitespace-nowrap shrink-0"
            title={`MathCoins: ${activeStudent.coins}`}
          >
            <Coins className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            <span className="font-mono tabular-nums">{activeStudent.coins}</span>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* SSO Authentication Status / Trigger */}
          {authSession ? (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onOpenAuth}
                title={`Přihlášen jako: ${authSession.name} (${authSession.email})`}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline">{authSession.name}</span>
              </button>
              <button
                onClick={onSignOut}
                title="Odhlásit se"
                className="hidden lg:inline text-[11px] text-slate-400 hover:text-rose-500 px-1 py-1 whitespace-nowrap"
              >
                Odhlásit
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Přihlásit</span>
            </button>
          )}

          {/* Cloud Sync Button (Desktop only to prevent mobile clutter) */}
          <button
            onClick={onOpenSync}
            title="Cloud synchronizace a záloha"
            className="hidden sm:flex p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Denní režim' : 'Tmavý večerní režim'}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
