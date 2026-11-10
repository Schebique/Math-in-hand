import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  BookOpen,
  TrendingUp,
  Brain,
  ChevronDown,
} from 'lucide-react';
import { Problem, StudentProfile, TopicCategory } from '../types';
import { STATIC_PROBLEMS, generateDynamicProblem } from '../data/problems';
import { SocraticDrawer } from './SocraticDrawer';

interface ProblemViewProps {
  student: StudentProfile;
  onProblemSolved: (problem: Problem, isCorrect: boolean, hintsUsed: number, timeSpentSec: number) => void;
}

export const ProblemView: React.FC<ProblemViewProps> = ({
  student,
  onProblemSolved,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [currentProblem, setCurrentProblem] = useState<Problem>(() =>
    generateDynamicProblem(student.grade)
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showSocratic, setShowSocratic] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [shake, setShake] = useState(false);

  // Update problem when student grade changes
  useEffect(() => {
    loadNewProblem();
  }, [student.grade]);

  const loadNewProblem = (topicOverride?: string) => {
    const topicToUse = topicOverride !== undefined ? topicOverride : selectedTopic;
    const cat = topicToUse === 'all' ? undefined : (topicToUse as TopicCategory);
    const nextProb = generateDynamicProblem(student.grade, cat);
    setCurrentProblem(nextProb);
    setUserAnswer('');
    setIsEvaluated(false);
    setIsCorrect(false);
    setHintsUsedCount(0);
    setShowSolution(false);
    setStartTime(Date.now());
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const topic = e.target.value;
    setSelectedTopic(topic);
    loadNewProblem(topic);
  };

  const cleanAnswer = (ans: string) => {
    return ans
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/,/g, '.')
      .replace(/kč/g, '')
      .replace(/ks/g, '')
      .replace(/m/g, '')
      .replace(/%/g, '')
      .replace(/hodin/g, '')
      .replace(/h/g, '');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim()) return;

    const timeSpent = Math.max(5, Math.round((Date.now() - startTime) / 1000));
    const cleanedInput = cleanAnswer(userAnswer);
    const cleanedCorrect = cleanAnswer(currentProblem.correctAnswer);

    let match = cleanedInput === cleanedCorrect;

    // Check acceptable answers if any
    if (!match && currentProblem.acceptableAnswers) {
      match = currentProblem.acceptableAnswers.some(
        (acc) => cleanAnswer(acc) === cleanedInput
      );
    }

    setIsEvaluated(true);
    setIsCorrect(match);

    if (match) {
      // Trigger confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      });
      onProblemSolved(currentProblem, true, hintsUsedCount, timeSpent);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      onProblemSolved(currentProblem, false, hintsUsedCount, timeSpent);
    }
  };

  // Virtual key pad appender for mobile touch convenience
  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setUserAnswer((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setUserAnswer('');
    } else {
      setUserAnswer((prev) => prev + val);
    }
  };

  const gradeBadgeTitle =
    student.grade === 'lyceum_2'
      ? '2. ročník – Obchodní lyceum'
      : student.grade === 'grade_9'
      ? '9. třída – CERMAT přijímačky'
      : 'Vysoká škola – Matematika';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Meta Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            {gradeBadgeTitle}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {currentProblem.topicName}
          </span>
        </div>

        {/* Topic filter selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="topic-select" className="text-xs text-slate-500 dark:text-slate-400">
            Filtrovat téma:
          </label>
          <div className="relative">
            <select
              id="topic-select"
              value={selectedTopic}
              onChange={handleTopicChange}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-3 pr-8 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
            >
              <option value="all">Všechna témata ročníku</option>
              {student.grade === 'lyceum_2' && (
                <>
                  <option value="finance">Finanční matematika & úročení</option>
                  <option value="functions">Funkce & Bod zvratu</option>
                  <option value="sequences">Posloupnosti</option>
                  <option value="probability">Pravděpodobnost & Riziko</option>
                </>
              )}
              {student.grade === 'grade_9' && (
                <>
                  <option value="equations">Lineární rovnice</option>
                  <option value="word_problems">Slovní úlohy (pohyb, práce)</option>
                  <option value="fractions_percentages">Zlomky & Procenta</option>
                  <option value="geometry">Geometrie & Pythagorova věta</option>
                </>
              )}
              {student.grade === 'university' && (
                <>
                  <option value="calculus">Diferenciální a integrální počet</option>
                  <option value="matrices">Lineární algebra & Matice</option>
                </>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Real-World Application Card ("K čemu je to v praxi dobré?") */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-900/50 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5 shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
              K čemu je tato matematická dovednost dobrá v praxi?
            </h4>
            <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-100 leading-relaxed font-medium">
              {currentProblem.realWorldContext}
            </p>
          </div>
        </div>
      </div>

      {/* Main Problem Interactive Card */}
      <div
        className={`relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl transition-all ${
          shake ? 'animate-shake' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white font-display">
            {currentProblem.title}
          </h2>

          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              currentProblem.difficulty === 'easy'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : currentProblem.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
            }`}
          >
            {currentProblem.difficulty === 'easy'
              ? 'Snadná'
              : currentProblem.difficulty === 'medium'
              ? 'Střední'
              : 'Pokročilá'}
          </span>
        </div>

        {/* Problem Statement */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 mb-6">
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line font-medium">
            {currentProblem.question}
          </p>
        </div>

        {/* Input & Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isEvaluated && isCorrect}
                placeholder="Zadej svůj výsledek..."
                className="w-full h-13 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              {currentProblem.unit && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none">
                  {currentProblem.unit}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!userAnswer.trim() || (isEvaluated && isCorrect)}
              className="h-13 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <span>Zkontrolovat výsledek</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Virtual Touchpad for Mobile */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline">
              Rychlé symboly:
            </span>
            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', 'x', 'backspace'].map(
              (sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleKeypadPress(sym)}
                  className="min-h-[36px] min-w-[36px] px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {sym === 'backspace' ? '⌫' : sym}
                </button>
              )
            )}
          </div>
        </form>

        {/* Evaluation Banner */}
        {isEvaluated && (
          <div
            className={`mt-6 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200 ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <p className="font-bold text-sm sm:text-base">
                  {isCorrect
                    ? 'Skvělá práce! Výsledek je správně.'
                    : 'Tento výsledek zatím nesedí. Nevadí, chyby jsou součástí učení!'}
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  {isCorrect
                    ? `Získáváš +15 XP a +5 MathCoins do své pokladničky!`
                    : 'Chceš nápovědu od AI mentora, která tě navede správným směrem?'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isCorrect && (
                <button
                  onClick={() => setShowSocratic(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sokratovská AI nápověda</span>
                </button>
              )}

              {isCorrect ? (
                <button
                  onClick={() => loadNewProblem()}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <span>Další příklad</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsEvaluated(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                >
                  Zkusit znovu
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSocratic(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Požádat o sokratovskou nápovědu</span>
            </button>

            <button
              onClick={() => setShowSolution((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showSolution ? 'Skrýt podrobný postup' : 'Ukázat podrobný postup'}</span>
            </button>
          </div>

          <button
            onClick={() => loadNewProblem()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Vygenerovat jiný příklad</span>
          </button>
        </div>

        {/* Step-by-step complete solution breakdown */}
        {showSolution && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Podrobný matematický postup:
            </h4>
            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-mono">
              {currentProblem.stepByStepSolution}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>Správný výsledek:</span>
              <span className="font-mono text-sm bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-1 rounded-md">
                {currentProblem.correctAnswer} {currentProblem.unit || ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Socratic Assistant Drawer */}
      <SocraticDrawer
        isOpen={showSocratic}
        onClose={() => setShowSocratic(false)}
        problem={currentProblem}
        userAnswer={userAnswer}
        studentGrade={student.grade}
        onHintUsed={() => setHintsUsedCount((prev) => prev + 1)}
      />
    </div>
  );
};
