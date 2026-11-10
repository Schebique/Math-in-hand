import React, { useState } from 'react';
import { Sparkles, MessageCircle, Lightbulb, Send, X, ArrowRight, ShieldCheck, Compass } from 'lucide-react';
import { Problem, GradeLevel } from '../types';

interface SocraticDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
  userAnswer: string;
  studentGrade: GradeLevel;
  onHintUsed: () => void;
}

interface SocraticResponse {
  hint: string;
  guidingQuestion: string;
  encouragement: string;
  isOfflineFallback?: boolean;
}

export const SocraticDrawer: React.FC<SocraticDrawerProps> = ({
  isOpen,
  onClose,
  problem,
  userAnswer,
  studentGrade,
  onHintUsed,
}) => {
  const [loading, setLoading] = useState(false);
  const [hintHistory, setHintHistory] = useState<string[]>([]);
  const [responses, setResponses] = useState<SocraticResponse[]>([]);
  const [studentQuestion, setStudentQuestion] = useState('');

  if (!isOpen) return null;

  const fetchHint = async (followUpQuestion?: string) => {
    setLoading(true);
    onHintUsed();

    try {
      const res = await fetch('/api/socratic-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          userAnswer: followUpQuestion || userAnswer || 'Nevím jak začít s postupem',
          studentGrade,
          previousHints: hintHistory,
        }),
      });

      if (!res.ok) {
        throw new Error('Chyba komunikace se serverem');
      }

      const data: SocraticResponse = await res.json();
      setResponses((prev) => [...prev, data]);
      setHintHistory((prev) => [...prev, data.hint]);
      setStudentQuestion('');
    } catch (e) {
      // Local Socratic Fallback
      const fallbackHint =
        problem.hints && problem.hints[hintHistory.length % problem.hints.length]
          ? problem.hints[hintHistory.length % problem.hints.length]
          : 'Zkontroluj si úpravu rovnice na obou stranách a dávej pozor na znaménka.';

      const fallback: SocraticResponse = {
        hint: fallbackHint,
        guidingQuestion: 'Jaký je tvůj první krok při rozboru tohoto zadání?',
        encouragement: 'Každý matematik se učí na chybách, pokračuj v přemýšlení!',
        isOfflineFallback: true,
      };

      setResponses((prev) => [...prev, fallback]);
      setHintHistory((prev) => [...prev, fallbackHint]);
      setStudentQuestion('');
    } finally {
      setLoading(false);
    }
  };

  // Trigger initial hint if empty
  if (responses.length === 0 && !loading) {
    fetchHint();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-sm">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
              Sokratovský AI průvodce
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Učí tě logickému postupu bez prozrazení konečného řešení
            </p>
          </div>
        </div>

        {/* Real-World Context reminder */}
        {problem.realWorldContext && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">K čemu ti to bude v životě:</span>
              <p className="leading-relaxed opacity-90">{problem.realWorldContext}</p>
            </div>
          </div>
        )}

        {/* Socratic Dialogue Stream */}
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 mb-5">
          {responses.map((resp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
            >
              {/* Hint badge */}
              <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Nápověda #{idx + 1}
                </span>
                {resp.isOfflineFallback && (
                  <span className="text-[10px] text-slate-400 normal-case font-normal">
                    (offline režim)
                  </span>
                )}
              </div>

              {/* Main concept explanation */}
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                {resp.hint}
              </p>

              {/* Guiding Socratic Question */}
              {resp.guidingQuestion && (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                  <span className="text-base leading-none">🤔</span>
                  <div>
                    <span className="font-bold block text-[11px] text-amber-800 dark:text-amber-300">
                      Otázka k zamyšlení:
                    </span>
                    <p className="mt-0.5">{resp.guidingQuestion}</p>
                  </div>
                </div>
              )}

              {/* Warm encouragement */}
              {resp.encouragement && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  „{resp.encouragement}“
                </p>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center justify-center p-6 gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>AI rádce promýšlí návodnou otázku...</span>
            </div>
          )}
        </div>

        {/* Ask follow-up step to the Socratic Mentor */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Napiš svůj mezikrok nebo co ti není jasné:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={studentQuestion}
              onChange={(e) => setStudentQuestion(e.target.value)}
              placeholder="Např. Vyšlo mi x = 15, ale nevím co se zbytkem..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && studentQuestion.trim() && !loading) {
                  fetchHint(studentQuestion);
                }
              }}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              onClick={() => studentQuestion.trim() && fetchHint(studentQuestion)}
              disabled={loading || !studentQuestion.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Zeptat se</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => fetchHint('Chci další záchytný bod')}
              disabled={loading}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium underline underline-offset-4"
            >
              Potřebuji další záchytný bod
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors"
            >
              Zkusit znovu spočítat
            </button>
          </div>
        </div>

        {/* Footer guarantee */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Sokratovský princip: AI tě navádí krok za krokem, aby tě zkouška nepřekvapila.</span>
        </div>
      </div>
    </div>
  );
};
