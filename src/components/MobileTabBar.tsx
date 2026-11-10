import React from 'react';
import { BookOpen, CalendarCheck, Award, Shield } from 'lucide-react';

interface MobileTabBarProps {
  activeTab: 'practice' | 'review' | 'gamification' | 'parent';
  onChangeTab: (tab: 'practice' | 'review' | 'gamification' | 'parent') => void;
  reviewCount: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onChangeTab,
  reviewCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 safe-area-pb">
      <div className="grid grid-cols-4 items-center h-14">
        {/* Practice Tab */}
        <button
          onClick={() => onChangeTab('practice')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'practice'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Trénink</span>
        </button>

        {/* Review Tab (SM-2) */}
        <button
          onClick={() => onChangeTab('review')}
          className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'review'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Opakování</span>
          {reviewCount > 0 && (
            <span className="absolute top-1 right-1/4 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {reviewCount}
            </span>
          )}
        </button>

        {/* Gamification Tab */}
        <button
          onClick={() => onChangeTab('gamification')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'gamification'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Ligy</span>
        </button>

        {/* Parent Tab */}
        <button
          onClick={() => onChangeTab('parent')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'parent'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Rodič</span>
        </button>
      </div>
    </nav>
  );
};
