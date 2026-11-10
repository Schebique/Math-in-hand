import React from 'react';
import {
  CalendarCheck,
  Brain,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ProblemHistoryItem, StudentProfile, Problem } from '../types';
import { getProblemsDueForReview, calculateRetentionRate } from '../utils/spacedRepetition';

interface SpacedRepetitionViewProps {
  student: StudentProfile;
  history: ProblemHistoryItem[];
  onStartReview: (item: ProblemHistoryItem) => void;
}

export const SpacedRepetitionView: React.FC<SpacedRepetitionViewProps> = ({
  student,
  history,
  onStartReview,
}) => {
  const studentHistory = history.filter((h) => h.studentId === student.id);
  const dueItems = getProblemsDueForReview(studentHistory);
  const retention = calculateRetentionRate(studentHistory);

  // Group items by topic
  const recentMistakes = studentHistory
    .filter((h) => !h.isCorrect)
    .slice(-5)
    .reverse();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
            Rozložené opakování (Spaced Repetition)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Metoda založená na vědecké křivce zapomínání (SM-2 algoritmus)
          </p>
        </div>

        {/* Retention score badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80">
          <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
              Míra udržení v paměti
            </span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-mono tabular-nums">
              {retention} %
            </span>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Methodology Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-900/50 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-teal-950 dark:text-teal-100 space-y-1">
          <p className="font-bold">Jak funguje chytré opakování?</p>
          <p className="leading-relaxed opacity-90">
            Když příklad vyřešíš správně na první pokus, systém ti ho připomene za 3 dny, pak za 7 dní a poté za měsíc. 
            Pokud v něm uděláš chybu, vrátí se do tvého seznamu už zítra. Tím se látka uloží do dlouhodobé paměti bez zbytečného biflování.
          </p>
        </div>
      </div>

      {/* Due Today Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>K procvičení dnes</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
              {dueItems.length}
            </span>
          </h3>
        </div>

        {dueItems.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Všechny revize pro dnešek máš splněné!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Skvělá práce. Můžeš pokračovat v procvičování nových témat nebo se vrátit k dalším úlohám zítra.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dueItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.topicName}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Interval: {item.interval} {item.interval === 1 ? 'den' : 'dní'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                </div>

                <button
                  onClick={() => onStartReview(item)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Zopakovat nyní</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Trouble Areas (Need reinforcement) */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>Poslední příklady s chybou (Doporučeno posílit)</span>
        </h3>

        {recentMistakes.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Žádné zaznamenané chyby v poslední sérii úloh!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentMistakes.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                    {m.topicName}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {m.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Zadaná odpověď: <span className="font-mono text-rose-500">{m.userAnswer || '—'}</span>
                  </p>
                </div>
                <button
                  onClick={() => onStartReview(m)}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                  title="Procvičit znovu"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
