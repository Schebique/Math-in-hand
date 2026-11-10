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
  UserCheck,
} from 'lucide-react';
import { StudentProfile } from '../types';
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
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onChangeTab('practice')}
            className="flex items-center gap-2 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <span className="text-lg font-bold">π</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display block leading-tight">
                MathHero
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Matematika s AI mentorem
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onChangeTab('practice')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'practice'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Procvičování</span>
          </button>

          <button
            onClick={() => onChangeTab('review')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'review'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Rozložené opakování</span>
          </button>

          <button
            onClick={() => onChangeTab('gamification')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'gamification'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Ligy & Odznaky</span>
          </button>

          <button
            onClick={() => onChangeTab('parent')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'parent'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Rodičovský panel</span>
            {isParentUnlocked && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Odemčeno" />
            )}
          </button>
        </nav>

        {/* Zone 3: Gamification Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Student Switcher */}
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {students.map((st) => {
              const isSelected = st.id === activeStudent.id;
              return (
                <button
                  key={st.id}
                  onClick={() => onSelectStudent(st)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title={
                    st.role === 'daughter'
                      ? 'Dcera: 2. ročník obchodního lycea'
                      : 'Syn: 9. třída (přijímačky CERMAT)'
                  }
                >
                  <span className="text-sm">{st.avatarEmoji}</span>
                  <span className="hidden sm:inline">{st.name}</span>
                </button>
              );
            })}
          </div>

          {/* Streak Flame */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-lg text-amber-600 dark:text-amber-400 font-semibold text-xs whitespace-nowrap"
            title={`Denní série: ${activeStudent.streak} dní v řadě`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="font-mono tabular-nums">{activeStudent.streak}</span>
          </div>

          {/* MathCoins */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800/60 rounded-lg text-yellow-700 dark:text-yellow-400 font-semibold text-xs whitespace-nowrap"
            title={`MathCoins: ${activeStudent.coins}`}
          >
            <Coins className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            <span className="font-mono tabular-nums">{activeStudent.coins}</span>
          </div>

          {/* Cloud Sync Button */}
          <button
            onClick={onOpenSync}
            title="Cloud synchronizace a záloha"
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Přepnout na denní režim' : 'Přepnout na tmavý režim pro večerní studium'}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* PWA Install */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
