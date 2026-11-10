export type GradeLevel = 'lyceum_2' | 'grade_9' | 'university';

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
  | 'matrices';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Problem {
  id: string;
  grade: GradeLevel;
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
}

export interface StudentProfile {
  id: string;
  name: string;
  role: 'daughter' | 'son' | 'custom';
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
}

export interface ParentSettings {
  pin: string;
  dailyTimeLimitMinutes: number;
  allowedGrades: GradeLevel[];
  soundEnabled: boolean;
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
