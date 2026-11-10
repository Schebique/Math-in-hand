import { ProblemHistoryItem } from '../types';

/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm Implementation
 * Quality score:
 * 5: Correct on 1st attempt with no hints
 * 4: Correct on 1st attempt after 1 hint
 * 3: Correct on subsequent attempt
 * 1: Incorrect attempt
 */
export function calculateSM2(
  quality: number,
  previousRepetitions = 0,
  previousInterval = 1,
  previousEaseFactor = 2.5
): {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: number;
} {
  let repetitions = previousRepetitions;
  let interval = previousInterval;
  let easeFactor = previousEaseFactor;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else if (repetitions === 2) {
      interval = 7;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

  return {
    interval,
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
    nextReviewDate,
  };
}

/**
 * Identifies problems that are due for spaced review
 */
export function getProblemsDueForReview(history: ProblemHistoryItem[]): ProblemHistoryItem[] {
  const now = Date.now();
  // Group by problemId and take the latest attempt
  const latestByProblem = new Map<string, ProblemHistoryItem>();

  for (const item of history) {
    const existing = latestByProblem.get(item.problemId);
    if (!existing || item.timestamp > existing.timestamp) {
      latestByProblem.set(item.problemId, item);
    }
  }

  const dueList: ProblemHistoryItem[] = [];
  for (const item of latestByProblem.values()) {
    if (item.nextReviewDate && item.nextReviewDate <= now) {
      dueList.push(item);
    }
  }

  // Sort by urgency: lowest nextReviewDate first
  return dueList.sort((a, b) => a.nextReviewDate - b.nextReviewDate);
}

/**
 * Calculates retention score based on history
 */
export function calculateRetentionRate(history: ProblemHistoryItem[]): number {
  if (history.length === 0) return 100;
  const correct = history.filter((h) => h.isCorrect).length;
  return Math.round((correct / history.length) * 100);
}
