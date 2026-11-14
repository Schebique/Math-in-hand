import { DifficultyLevel, GradeLevel, Problem, SchoolType, TopicCategory } from '../../types';

export interface GenerationContext {
  grade: GradeLevel;
  schoolType: SchoolType;
  gradeYear?: number;
}

export interface ProblemArchetype {
  id: string;
  schoolTypes: SchoolType[];
  grades: GradeLevel[];
  gradeYears?: number[];
  topic: TopicCategory;
  topicName: string;
  curriculumRef: string;
  difficulty: DifficultyLevel;
  generate: (ctx: GenerationContext) => Problem;
}

export interface TopicOption {
  value: TopicCategory;
  label: string;
}

// ==========================================
// Deterministické a kombinatorické pomocné nástroje
// ==========================================

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randNonZeroInt(min: number, max: number): number {
  let val = 0;
  while (val === 0) {
    val = randInt(min, max);
  }
  return val;
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function simplifyFraction(num: number, den: number): { num: number; den: number; text: string } {
  const sign = (num < 0) !== (den < 0) ? -1 : 1;
  const absN = Math.abs(num);
  const absD = Math.abs(den);
  const g = gcd(absN, absD);
  const sn = sign * (absN / g);
  const sd = absD / g;
  if (sd === 1) {
    return { num: sn, den: 1, text: String(sn) };
  }
  return { num: sn, den: sd, text: `${sn}/${sd}` };
}

export function formatCz(n: number, decimals?: number): string {
  const value = decimals !== undefined ? Number(n.toFixed(decimals)) : n;
  return String(value).replace('.', ',');
}

export function formatSpaceNumber(n: number): string {
  return Math.round(n).toLocaleString('cs-CZ');
}

export function signedConst(n: number): string {
  if (n === 0) return '';
  return n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}

export function signedCoeff(coeff: number, variable: string, isFirst = false): string {
  if (coeff === 0) return isFirst ? '0' : '';
  const absC = Math.abs(coeff);
  const coeffStr = absC === 1 ? '' : String(absC);
  if (isFirst) {
    return coeff < 0 ? `-${coeffStr}${variable}` : `${coeffStr}${variable}`;
  }
  return coeff < 0 ? `- ${coeffStr}${variable}` : `+ ${coeffStr}${variable}`;
}

export function makeUniqueId(archetypeId: string): string {
  return `${archetypeId}_${Date.now()}_${randInt(1000, 9999)}`;
}

export function numericAnswers(val: number, unit?: string, decimals?: number): {
  correctAnswer: string;
  acceptableAnswers: string[];
} {
  const rounded = decimals !== undefined ? Number(val.toFixed(decimals)) : val;
  const dot = String(rounded);
  const comma = dot.replace('.', ',');
  const set = new Set<string>([dot, comma]);
  if (unit) {
    set.add(`${dot} ${unit}`);
    set.add(`${comma} ${unit}`);
  }
  return {
    correctAnswer: dot,
    acceptableAnswers: Array.from(set),
  };
}
