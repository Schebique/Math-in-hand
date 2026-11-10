import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Clock,
  TrendingUp,
  Download,
  KeyRound,
  Check,
  Settings,
  BarChart3,
  Sliders,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { StudentProfile, ProblemHistoryItem, ParentSettings, GradeLevel } from '../types';
import { generateTeacherReportPDF } from '../utils/pdfExport';

interface ParentDashboardProps {
  students: StudentProfile[];
  history: ProblemHistoryItem[];
  settings: ParentSettings;
  onUpdateSettings: (newSettings: ParentSettings) => void;
  isUnlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  students,
  history,
  settings,
  onUpdateSettings,
  isUnlocked,
  onUnlock,
  onLock,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'stats' | 'limits' | 'reports'>('stats');
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

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

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.pin) {
      onUnlock();
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleUpdateLimit = (minutes: number) => {
    onUpdateSettings({
      ...settings,
      dailyTimeLimitMinutes: minutes,
    });
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      onUpdateSettings({
        ...settings,
        pin: newPin,
      });
      setNewPin('');
      setPinSuccess(true);
      setTimeout(() => setPinSuccess(false), 3000);
    }
  };

  // If locked, render PIN Gate
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              Rodičovský panel
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Zadejte 4místný PIN pro přístup k detailním statistikám a nastavení
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setPinError(false);
                }}
                placeholder="PIN (výchozí: 1234)"
                className="w-48 mx-auto text-center tracking-[0.5em] text-2xl font-mono py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {pinError && (
                <p className="text-xs text-rose-500 mt-2 font-medium">
                  Nesprávný PIN kód. Výchozí je 1234.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pinInput.length !== 4}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Odemknout dashboard
            </button>
          </form>

          <p className="text-[11px] text-slate-400 italic">
            Výchozí rodičovský kód je 1234. V nastavení si jej můžete kdykoli změnit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Rodičovský dohled & statistiky
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Odemčeno
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Podrobný přehled pro rodiče s exportem školních zpráv a časovým limitem
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Student Selector */}
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role === 'daughter' ? '2. ročník lycea' : '9. třída ZŠ'})
              </option>
            ))}
          </select>

          <button
            onClick={onLock}
            className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Zamknout
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Statistiky & témata</span>
        </button>
        <button
          onClick={() => setActiveTab('limits')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'limits'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Časové limity</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Report pro učitele</span>
        </button>
      </div>

      {/* Tab: Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Vyřešeno úloh
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {totalSolved} ks
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Celková úspěšnost
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {accuracy} %
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Doba u matematiky
              </span>
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                {totalMinutes + selectedStudent.todayMinutesStudied} min
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Aktuální série
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                {selectedStudent.streak} dní
              </span>
            </div>
          </div>

          {/* Topic Mastery Progress Bars */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Úspěšnost podle matematických oblastí:</span>
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
                        <span className="font-mono text-slate-500 dark:text-slate-400">
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

      {/* Tab: Time limits & settings */}
      {activeTab === 'limits' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Denní časový limit a studijní cíl</span>
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
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                {settings.dailyTimeLimitMinutes} minut denně
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[15, 20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleUpdateLimit(mins)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    settings.dailyTimeLimitMinutes === mins
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
                className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={newPin.length !== 4}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shrink-0"
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
      {activeTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
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
                {selectedStudent.name} ({selectedStudent.grade === 'lyceum_2' ? 'Obchodní lyceum' : '9. třída ZŠ'})
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Zahrnutý počet úloh:</span>
              <span className="font-mono font-semibold">{totalSolved} příkladů</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Úspěšnost v reportu:</span>
              <span className="font-mono font-semibold text-emerald-600">{accuracy} %</span>
            </div>

            <button
              onClick={() => generateTeacherReportPDF(selectedStudent, history)}
              className="mt-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
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
