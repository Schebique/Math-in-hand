import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  Problem,
  ProblemHistoryItem,
  ParentSettings,
  GradeLevel,
} from './types';
import {
  loadProfiles,
  saveProfiles,
  loadActiveStudentId,
  saveActiveStudentId,
  loadHistory,
  appendHistoryItem,
  loadParentSettings,
  saveParentSettings,
  loadDarkMode,
  saveDarkMode,
} from './utils/storage';
import { calculateSM2, getProblemsDueForReview } from './utils/spacedRepetition';
import { Navbar } from './components/Navbar';
import { MobileTabBar } from './components/MobileTabBar';
import { ProblemView } from './components/ProblemView';
import { SpacedRepetitionView } from './components/SpacedRepetitionView';
import { GamificationView } from './components/GamificationView';
import { ParentDashboard } from './components/ParentDashboard';
import { SyncModal } from './components/SyncModal';
import { WifiOff, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [profiles, setProfiles] = useState<StudentProfile[]>(loadProfiles);
  const [activeStudentId, setActiveStudentId] = useState<string>(loadActiveStudentId);
  const [history, setHistory] = useState<ProblemHistoryItem[]>(loadHistory);
  const [parentSettings, setParentSettings] = useState<ParentSettings>(loadParentSettings);
  const [activeTab, setActiveTab] = useState<'practice' | 'review' | 'gamification' | 'parent'>('practice');
  const [darkMode, setDarkMode] = useState<boolean>(loadDarkMode);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [recentBadge, setRecentBadge] = useState<string | null>(null);

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

  // Time tracker for active student
  useEffect(() => {
    const timer = setInterval(() => {
      setProfiles((prev) => {
        const updated = prev.map((s) => {
          if (s.id === activeStudentId) {
            return {
              ...s,
              todayMinutesStudied: s.todayMinutesStudied + 1,
            };
          }
          return s;
        });
        saveProfiles(updated);
        return updated;
      });
    }, 60000); // every minute

    return () => clearInterval(timer);
  }, [activeStudentId]);

  const activeStudent =
    profiles.find((s) => s.id === activeStudentId) || profiles[0];

  const handleSelectStudent = (st: StudentProfile) => {
    setActiveStudentId(st.id);
    saveActiveStudentId(st.id);
  };

  const handleUpdateStudent = (updated: StudentProfile) => {
    const newProfiles = profiles.map((p) => (p.id === updated.id ? updated : p));
    setProfiles(newProfiles);
    saveProfiles(newProfiles);
  };

  const handleUpdateParentSettings = (newSettings: ParentSettings) => {
    setParentSettings(newSettings);
    saveParentSettings(newSettings);
  };

  const checkBadgeUnlocks = (
    currentStudent: StudentProfile,
    newHistoryItem: ProblemHistoryItem,
    allHistory: ProblemHistoryItem[]
  ): string[] => {
    const unlocked = [...currentStudent.unlockedBadges];
    const newBadges: string[] = [];

    // First solve
    if (newHistoryItem.isCorrect && !unlocked.includes('badge_first_solve')) {
      newBadges.push('badge_first_solve');
    }

    // No hint master
    if (newHistoryItem.isCorrect && newHistoryItem.hintsUsed === 0 && !unlocked.includes('badge_no_hint')) {
      const recentFive = allHistory
        .filter((h) => h.studentId === currentStudent.id && h.isCorrect && h.hintsUsed === 0)
        .slice(-5);
      if (recentFive.length >= 5) {
        newBadges.push('badge_no_hint');
      }
    }

    // Finance master
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

    // CERMAT ready
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

    // Night owl badge (if solved between 19:00 and 05:00)
    const hour = new Date().getHours();
    if ((hour >= 19 || hour < 5) && !unlocked.includes('badge_night_owl')) {
      newBadges.push('badge_night_owl');
    }

    return newBadges;
  };

  // Called when student submits a solution
  const handleProblemSolved = (
    problem: Problem,
    isCorrect: boolean,
    hintsUsed: number,
    timeSpentSec: number
  ) => {
    // Quality for SM-2
    let quality = 1;
    if (isCorrect) {
      if (hintsUsed === 0) quality = 5;
      else if (hintsUsed === 1) quality = 4;
      else quality = 3;
    }

    // Find previous SM-2 metrics for this problem
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
      userAnswer: problem.correctAnswer, // recorded
      isCorrect,
      hintsUsed,
      timeSpentSeconds: timeSpentSec,
      timestamp: Date.now(),
      nextReviewDate: sm2.nextReviewDate,
      interval: sm2.interval,
      repetitions: sm2.repetitions,
      easeFactor: sm2.easeFactor,
    };

    appendHistoryItem(historyItem);
    const updatedHistory = [...history, historyItem];
    setHistory(updatedHistory);

    // XP and Coins rewards
    let addedXp = isCorrect ? 15 : 5;
    let addedCoins = isCorrect ? 5 : 1;
    if (isCorrect && hintsUsed === 0) {
      addedCoins += 2; // Bonus for independent solution
      addedXp += 5;
    }

    // Check newly unlocked badges
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
    };

    handleUpdateStudent(updatedStudent);
  };

  const studentDueItems = getProblemsDueForReview(
    history.filter((h) => h.studentId === activeStudent.id)
  );

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
      />

      {/* Badge Unlock Celebration Banner */}
      {recentBadge && (
        <div className="sticky top-16 z-40 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-bold py-2 px-4 shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <Award className="w-4 h-4 text-slate-950" />
          <span>Gratulujeme! Odemkl(a) jsi nový matematický odznak!</span>
        </div>
      )}

      {/* Daily Study Time Warning if reached limit */}
      {activeStudent.todayMinutesStudied >= parentSettings.dailyTimeLimitMinutes && (
        <div className="max-w-4xl mx-auto px-4 mt-3 w-full">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
            <span>
              🎉 Dnes máš splněný stanovený cíl {parentSettings.dailyTimeLimitMinutes} minut studia! Můžeš si odpočinout nebo pokračovat dál.
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
            todaySolvedCount={
              history.filter((h) => h.studentId === activeStudent.id).length
            }
          />
        )}

        {activeTab === 'parent' && (
          <ParentDashboard
            students={profiles}
            history={history}
            settings={parentSettings}
            onUpdateSettings={handleUpdateParentSettings}
            isUnlocked={isParentUnlocked}
            onUnlock={() => setIsParentUnlocked(true)}
            onLock={() => setIsParentUnlocked(false)}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        reviewCount={studentDueItems.length}
      />

      {/* Cloud Sync / Export Modal */}
      <SyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        onDataImported={() => {
          setProfiles(loadProfiles());
          setHistory(loadHistory());
          setParentSettings(loadParentSettings());
        }}
      />
    </div>
  );
}
