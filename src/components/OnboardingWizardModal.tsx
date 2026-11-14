import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  School,
  GraduationCap,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Compass,
} from 'lucide-react';
import { SchoolType, StudyGoal, GradeLevel, StudentProfile } from '../types';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile?: Partial<StudentProfile>;
  onComplete: (profile: StudentProfile) => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [goal, setGoal] = useState<StudyGoal>(initialProfile?.studyGoal || 'regular_grades');
  const [schoolType, setSchoolType] = useState<SchoolType>(initialProfile?.schoolType || 'primary_school');
  const [gradeYear, setGradeYear] = useState<number>(initialProfile?.gradeYear || 8);
  const [studentName, setStudentName] = useState<string>(initialProfile?.name || 'Student');
  const [selectedAvatar, setSelectedAvatar] = useState<{ id: string; emoji: string }>({
    id: initialProfile?.avatarId || 'avatar_scholar',
    emoji: initialProfile?.avatarEmoji || '🎓',
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setGoal(initialProfile?.studyGoal || 'regular_grades');
      setSchoolType(initialProfile?.schoolType || 'primary_school');
      setGradeYear(initialProfile?.gradeYear || 8);
      setStudentName(initialProfile?.name || 'Student');
      setSelectedAvatar({
        id: initialProfile?.avatarId || 'avatar_scholar',
        emoji: initialProfile?.avatarEmoji || '🎓',
      });
    }
  }, [isOpen, initialProfile]);

  if (!isOpen) return null;

  // Determine GradeLevel for problem generator
  const mapToGradeLevel = (sSchool: SchoolType, sGoal: StudyGoal, sYear: number): GradeLevel => {
    if (sGoal === 'cermat_entry' || sSchool === 'cermat_prep') {
      return 'grade_9';
    }
    if (sSchool === 'business_lyceum') {
      return 'lyceum_2';
    }
    if (sSchool === 'university' || sGoal === 'college_math') {
      return 'university';
    }
    if (sSchool === 'primary_school') {
      return sYear >= 9 ? 'grade_9' : 'primary_mid';
    }
    return 'grammar_school';
  };

  const handleFinish = () => {
    const computedGrade = mapToGradeLevel(schoolType, goal, gradeYear);

    const completedProfile: StudentProfile = {
      id: initialProfile?.id || `student_${Date.now()}`,
      name: studentName.trim() || 'Student',
      role: initialProfile?.role || 'student',
      schoolType,
      gradeYear,
      studyGoal: goal,
      grade: computedGrade,
      avatarId: selectedAvatar.id,
      avatarEmoji: selectedAvatar.emoji,
      xp: initialProfile?.xp ?? 50,
      coins: initialProfile?.coins ?? 20,
      streak: initialProfile?.streak ?? 1,
      lastActiveDate: initialProfile?.lastActiveDate || new Date().toISOString().split('T')[0],
      streakFreezeCount: initialProfile?.streakFreezeCount ?? 1,
      unlockedAvatars: initialProfile?.unlockedAvatars || ['avatar_scholar', selectedAvatar.id],
      unlockedBadges: initialProfile?.unlockedBadges || ['badge_first_solve'],
      todayMinutesStudied: initialProfile?.todayMinutesStudied ?? 0,
    };

    onComplete(completedProfile);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 pt-16 pb-20 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              1
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cíl studia
            </span>
          </div>

          <div className="h-0.5 w-6 bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Škola & Ročník
            </span>
          </div>

          <div className="h-0.5 w-6 bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Profil
            </span>
          </div>
        </div>

        {/* STEP 1: Main Goal */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Co je tvůj hlavní matematický cíl?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aplikace ti podle toho přizpůsobí doporučené příklady a cvičení
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'cermat_entry',
                  title: '🎯 Příprava na CERMAT přijímací zkoušky',
                  desc: 'Trénink jednotných přijímačkových testů na střední školy a gymnázia',
                },
                {
                  id: 'regular_grades',
                  title: '📈 Běžné studium a zlepšení známek',
                  desc: 'Procvičování aktuálního učiva podle ročníku a příprava na písemky',
                },
                {
                  id: 'graduation_maturita',
                  title: '🎓 Příprava k maturitě z matematiky',
                  desc: 'Komplexní zopakování středoškolských celků a didaktických testů',
                },
                {
                  id: 'college_math',
                  title: '🔬 Vysokoškolská matematika',
                  desc: 'Kalkulus, derivace, integrály a lineární algebra pro VŠ studenty',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setGoal(item.id as StudyGoal);
                    if (item.id === 'cermat_entry') {
                      setSchoolType('cermat_prep');
                      setGradeYear(9);
                    } else if (item.id === 'college_math') {
                      setSchoolType('university');
                      setGradeYear(1);
                    }
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    goal === item.id
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-bold">{item.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Pokračovat k výběru školy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: School Type & Grade Year */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Jakou školu a ročník studuješ?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Příklady vybereme přímo ze školních osnov tvého oboru
              </p>
            </div>

            {/* School Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'primary_school',
                  name: '2. stupeň ZŠ',
                  sub: '6.–9. třída',
                  years: [6, 7, 8, 9],
                },
                {
                  id: 'cermat_prep',
                  name: 'CERMAT přijímačky',
                  sub: 'Intenzivní trénink',
                  years: [9],
                },
                {
                  id: 'business_lyceum',
                  name: 'Obchodní lyceum / akademie',
                  sub: 'Zaměření na finance a byznys',
                  years: [1, 2, 3, 4],
                },
                {
                  id: 'grammar_school',
                  name: 'Gymnázium',
                  sub: 'Všeobecné / přírodovědné',
                  years: [1, 2, 3, 4],
                },
                {
                  id: 'vocational_sos',
                  name: 'Střední odborná škola (SOŠ)',
                  sub: 'Technické a aplikované obory',
                  years: [1, 2, 3, 4],
                },
                {
                  id: 'university',
                  name: 'Vysoká škola',
                  sub: 'Matematika na VŠ',
                  years: [1, 2],
                },
              ].map((sch) => {
                const isSelected = schoolType === sch.id;
                return (
                  <button
                    key={sch.id}
                    type="button"
                    onClick={() => {
                      setSchoolType(sch.id as SchoolType);
                      setGradeYear(sch.years[0]);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {sch.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {sch.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grade Year Selection */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Aktuální ročník / třída:
              </label>
              <div className="flex flex-wrap gap-2">
                {schoolType === 'primary_school' &&
                  [6, 7, 8, 9].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setGradeYear(yr)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        gradeYear === yr
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {yr}. třída
                    </button>
                  ))}

                {(schoolType === 'business_lyceum' ||
                  schoolType === 'grammar_school' ||
                  schoolType === 'vocational_sos') &&
                  [1, 2, 3, 4].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setGradeYear(yr)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        gradeYear === yr
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {yr}. ročník
                    </button>
                  ))}

                {schoolType === 'cermat_prep' && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-1">
                    ✓ Příprava na přijímačky pro 9. třídu ZŠ na maturitní obory
                  </span>
                )}

                {schoolType === 'university' &&
                  [1, 2].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setGradeYear(yr)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        gradeYear === yr
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {yr}. ročník VŠ
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Zpět</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Pokračovat k profilu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Student Name & Avatar */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Jak ti máme říkat?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pojmenuj svůj profil a vyber si svého startovního hrdinu
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Tvé jméno nebo přezdívka:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Např. Marie, Sam, Tomáš..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Vyber si startovního avatara:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'avatar_scholar', emoji: '🎓', label: 'Student' },
                  { id: 'avatar_business', emoji: '💼', label: 'Ekonomka' },
                  { id: 'avatar_engineer', emoji: '📐', label: 'Inženýr' },
                  { id: 'avatar_astronaut', emoji: '🚀', label: 'Kosmonaut' },
                  { id: 'avatar_wizard', emoji: '🧙‍♂️', label: 'Alchymista' },
                ].map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${
                      selectedAvatar.id === av.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                      {av.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Zpět</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Začít procvičovat matematiku</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
