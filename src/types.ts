export type GradeLevel = 'lyceum_2' | 'grade_9' | 'university' | 'primary_mid' | 'grammar_school';

export type SchoolType =
  | 'primary_school' // 2. stupeň ZŠ (6.–9. třída)
  | 'cermat_prep' // Intenzivní CERMAT přijímačky
  | 'grammar_school' // Gymnázium (4leté / víceleté)
  | 'business_lyceum' // Obchodní lyceum / akademie
  | 'vocational_sos' // Střední odborná škola SOŠ
  | 'university'; // Vysoká škola

export type StudyGoal =
  | 'cermat_entry' // Přijímačky na SŠ
  | 'regular_grades' // Běžné učení a zlepšení známek
  | 'graduation_maturita' // Příprava k maturitě
  | 'college_math'; // VŠ zkoušky a kalkulus

export type TopicCategory =
  | 'finance'
  | 'functions'
  | 'equations'
  | 'fractions_percentages'
  | 'word_problems'
  | 'geometry'
  | 'sequences'
  | 'probability'
  | 'calculus'
  | 'matrices'
  | 'arithmetic_basic';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Problem {
  id: string;
  grade: GradeLevel;
  schoolType?: SchoolType;
  topic: TopicCategory;
  topicName: string;
  title: string;
  question: string;
  realWorldContext: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  unit?: string;
  difficulty: DifficultyLevel;
  stepByStepSolution: string;
  hints: string[];
  options?: string[];
  type: 'number' | 'text' | 'choice';
  archetypeId?: string;
  curriculumRef?: string;
  variantSeed?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  provider: 'google' | 'apple' | 'guest';
  accountType: 'family_parent' | 'individual_student';
  avatarUrl?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  role: 'daughter' | 'son' | 'custom' | 'student';
  schoolType: SchoolType;
  gradeYear: number; // e.g. 6-9 for primary, 1-4 for secondary, 1-2 for university
  studyGoal: StudyGoal;
  grade: GradeLevel;
  avatarId: string;
  avatarEmoji: string;
  xp: number;
  coins: number;
  streak: number;
  lastActiveDate: string;
  streakFreezeCount: number;
  unlockedAvatars: string[];
  unlockedBadges: string[];
  todayMinutesStudied: number;
  ownerUid?: string;
  linkedParentUid?: string;
}

export interface ProblemHistoryItem {
  id: string;
  problemId: string;
  studentId: string;
  topic: TopicCategory;
  topicName: string;
  grade: GradeLevel;
  title: string;
  userAnswer: string;
  isCorrect: boolean;
  hintsUsed: number;
  timeSpentSeconds: number;
  timestamp: number;
  // SM-2 Spaced repetition metrics
  nextReviewDate: number;
  interval: number; // in days
  repetitions: number;
  easeFactor: number;
  linkedParentUid?: string;
}

export interface FamilyInvite {
  code: string;
  parentUid: string;
  parentName: string;
  childLabel: string;
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'revoked';
  acceptedByUid: string;
  acceptedChildName: string;
  expiresAt: number;
}

export interface FamilyLink {
  id: string;
  parentUid: string;
  parentName: string;
  childUid: string;
  childName: string;
  childEmail: string;
  inviteCode: string;
  dailyTimeLimitMinutes: number;
}

export interface ParentSettings {
  pin: string;
  dailyTimeLimitMinutes: number;
  allowedGrades: GradeLevel[];
  soundEnabled: boolean;
  pinHash?: string;
  pinSalt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'volume' | 'topic';
  unlockedAt?: number;
}

export interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  roleDescription: string;
  price: number;
}

export interface DailyMission {
  id: string;
  title: string;
  current: number;
  target: number;
  rewardCoins: number;
  rewardXp: number;
  completed: boolean;
}
