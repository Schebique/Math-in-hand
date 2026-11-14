import { GradeLevel, Problem, SchoolType, TopicCategory } from '../types';
import {
  ALL_ARCHETYPES,
  QuestionBank,
  QuestionBankStats,
  inferSchoolTypeFromGrade,
  questionBank,
} from './QuestionBank';
import { ProblemArchetype, TopicOption } from './datasets/types';

export { ALL_ARCHETYPES, QuestionBank, inferSchoolTypeFromGrade, questionBank };
export type { QuestionBankStats };

export function getMatchingArchetypes(
  grade: GradeLevel,
  topic?: TopicCategory,
  schoolType?: SchoolType,
  gradeYear?: number
): ProblemArchetype[] {
  return questionBank.selectArchetypes({
    grade,
    topic,
    schoolType,
    gradeYear,
  });
}

/**
 * Generates a fresh, non-repeating problem strictly aligned with Czech RVP / CERMAT / VŠ curricula
 * via the QuestionBank engine.
 */
export function generateCurriculumProblem(
  grade: GradeLevel,
  topic?: TopicCategory,
  schoolType?: SchoolType,
  studentId?: string,
  gradeYear?: number
): Problem {
  return questionBank.nextProblem({
    grade,
    topic,
    schoolType,
    studentId,
    gradeYear,
  });
}

export function getCurriculumTopicsForSchool(
  schoolType: SchoolType,
  gradeYear?: number
): TopicOption[] {
  return questionBank.getAvailableTopics(schoolType, gradeYear);
}

export function getArchetypeCountForSchool(
  schoolType: SchoolType,
  gradeYear?: number
): number {
  return questionBank.getArchetypeCount(schoolType, gradeYear);
}

export function getQuestionBankStats(
  schoolType?: SchoolType,
  gradeYear?: number
): QuestionBankStats {
  return questionBank.getStats(schoolType, gradeYear);
}
