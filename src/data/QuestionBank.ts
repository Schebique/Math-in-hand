import { DifficultyLevel, GradeLevel, Problem, SchoolType, TopicCategory } from '../types';
import { PRIMARY_ARCHETYPES } from './datasets/primaryDatasets';
import { CERMAT_ARCHETYPES } from './datasets/cermatDatasets';
import { SECONDARY_ARCHETYPES } from './datasets/secondaryDatasets';
import { UNIVERSITY_ARCHETYPES } from './datasets/universityDatasets';
import { ProblemArchetype, TopicOption, pick } from './datasets/types';

export const ALL_ARCHETYPES: ProblemArchetype[] = [
  ...PRIMARY_ARCHETYPES,
  ...CERMAT_ARCHETYPES,
  ...SECONDARY_ARCHETYPES,
  ...UNIVERSITY_ARCHETYPES,
];

export const TOPIC_LABELS: Record<TopicCategory, string> = {
  arithmetic_basic: 'Dělitelnost a čísla (NSD / NSN)',
  fractions_percentages: 'Zlomky, procenta a poměry',
  equations: 'Rovnice, výrazy a soustavy',
  word_problems: 'Slovní úlohy (pohyb, práce, úměrnost)',
  geometry: 'Geometrie v rovině a tělesa',
  finance: 'Finanční matematika (úrok, marže, DPH)',
  functions: 'Funkce, závislosti a optimalizace',
  sequences: 'Posloupnosti a číselné řady',
  probability: 'Pravděpodobnost a kombinatorika',
  calculus: 'Matematická analýza (limity, derivace, integrály)',
  matrices: 'Lineární algebra (matice, determinanty, vektory)',
};

export interface QuestionSelectQuery {
  grade: GradeLevel;
  schoolType?: SchoolType;
  gradeYear?: number;
  topic?: TopicCategory;
  difficulty?: DifficultyLevel;
}

export interface QuestionNextQuery extends QuestionSelectQuery {
  studentId?: string;
  excludeArchetypeIds?: string[];
}

export interface QuestionBankStats {
  totalArchetypes: number;
  cermatCount: number;
  businessLyceumCount: number;
  filteredCount: number;
  bySchoolType: Record<SchoolType, number>;
  byTopic: Partial<Record<TopicCategory, number>>;
}

interface SeenMemory {
  recentArchetypes: string[];
  recentVariants: string[];
}

export function inferSchoolTypeFromGrade(grade: GradeLevel): SchoolType {
  switch (grade) {
    case 'primary_mid':
      return 'primary_school';
    case 'grade_9':
      return 'cermat_prep';
    case 'lyceum_2':
      return 'business_lyceum';
    case 'grammar_school':
      return 'grammar_school';
    case 'university':
      return 'university';
  }
}

/**
 * Dynamická banka matematických úloh propojující oficiální databáze CERMAT (9. třída),
 * osnovy obchodních lyceí (1.–4. ročník), 2. stupeň ZŠ, gymnázia/SOŠ a VŠ.
 * Selektivně vybírá typové úlohy podle školy a ročníku a hlídá neopakování příkladů.
 */
export class QuestionBank {
  private readonly archetypes: ProblemArchetype[];
  private readonly memoryFallbackCache = new Map<string, SeenMemory>();

  constructor(customArchetypes: ProblemArchetype[] = ALL_ARCHETYPES) {
    this.archetypes = customArchetypes;
  }

  public getAllArchetypes(): readonly ProblemArchetype[] {
    return this.archetypes;
  }

  /**
   * Vrací typové úlohy vycházející z databází CERMAT (JPZ pro 9. třídu ZŠ).
   */
  public getCermatDatabase(gradeYear?: number): ProblemArchetype[] {
    return this.archetypes.filter(
      (arch) =>
        arch.schoolTypes.includes('cermat_prep') &&
        this.matchesGradeYear(arch, gradeYear)
    );
  }

  /**
   * Vrací typové úlohy dle RVP učebních osnov obchodních lyceí pro zadaný ročník (1.–4.).
   */
  public getBusinessLyceumCurriculum(gradeYear?: number): ProblemArchetype[] {
    return this.archetypes.filter(
      (arch) =>
        arch.schoolTypes.includes('business_lyceum') &&
        this.matchesGradeYear(arch, gradeYear)
    );
  }

  private matchesGradeYear(arch: ProblemArchetype, gradeYear?: number): boolean {
    if (!gradeYear || !arch.gradeYears || arch.gradeYears.length === 0) {
      return true;
    }
    return arch.gradeYears.includes(gradeYear);
  }

  private getMemoryKey(studentId?: string): string {
    return `mathhero_seen_pool_v1_${studentId || 'global'}`;
  }

  private loadSeenMemory(studentId?: string): SeenMemory {
    const key = this.getMemoryKey(studentId);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.recentArchetypes) && Array.isArray(parsed.recentVariants)) {
            return parsed;
          }
        }
      }
    } catch {
      // Ignoruj omezení přístupu k localStorage (SSR / testy)
    }
    return this.memoryFallbackCache.get(key) || { recentArchetypes: [], recentVariants: [] };
  }

  private saveSeenMemory(memory: SeenMemory, studentId?: string): void {
    const key = this.getMemoryKey(studentId);
    const trimmed: SeenMemory = {
      recentArchetypes: memory.recentArchetypes.slice(-40),
      recentVariants: memory.recentVariants.slice(-100),
    };
    this.memoryFallbackCache.set(key, trimmed);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(trimmed));
      }
    } catch {
      // Ignoruj kvótu úložiště
    }
  }

  public resetHistory(studentId?: string): void {
    const key = this.getMemoryKey(studentId);
    this.memoryFallbackCache.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignoruj v Node / omezeném prostředí
    }
  }

  /**
   * Selektivně vybere vhodné typové úlohy podle typu školy, ročníku, tématu a obtížnosti
   * s postupným kaskádovým fallbackem, aby výběr nikdy neselhal prázdným seznamem.
   */
  public selectArchetypes(query: QuestionSelectQuery): ProblemArchetype[] {
    const targetSchool = query.schoolType || inferSchoolTypeFromGrade(query.grade);
    const { grade, gradeYear, topic, difficulty } = query;

    // 1. Nejpřesnější shoda: škola + ročník + téma + obtížnost
    let pool = this.archetypes.filter(
      (arch) =>
        arch.schoolTypes.includes(targetSchool) &&
        this.matchesGradeYear(arch, gradeYear) &&
        (!topic || arch.topic === topic) &&
        (!difficulty || arch.difficulty === difficulty)
    );

    // 2. Shoda bez omezení obtížnosti (škola + ročník + téma)
    if (pool.length === 0 && difficulty) {
      pool = this.archetypes.filter(
        (arch) =>
          arch.schoolTypes.includes(targetSchool) &&
          this.matchesGradeYear(arch, gradeYear) &&
          (!topic || arch.topic === topic)
      );
    }

    // 3. Shoda bez omezení konkrétního ročníku (škola + téma)
    if (pool.length === 0 && gradeYear !== undefined) {
      pool = this.archetypes.filter(
        (arch) =>
          arch.schoolTypes.includes(targetSchool) &&
          (!topic || arch.topic === topic)
      );
    }

    // 4. Shoda podle GradeLevel + ročník + téma
    if (pool.length === 0) {
      pool = this.archetypes.filter(
        (arch) =>
          arch.grades.includes(grade) &&
          this.matchesGradeYear(arch, gradeYear) &&
          (!topic || arch.topic === topic)
      );
    }

    // 5. Shoda podle GradeLevel + téma
    if (pool.length === 0) {
      pool = this.archetypes.filter(
        (arch) => arch.grades.includes(grade) && (!topic || arch.topic === topic)
      );
    }

    // 6. Všechny úlohy pro danou školu a ročník (ignoruje téma)
    if (pool.length === 0) {
      pool = this.archetypes.filter(
        (arch) =>
          arch.schoolTypes.includes(targetSchool) &&
          this.matchesGradeYear(arch, gradeYear)
      );
    }

    // 7. Všechny úlohy pro danou školu nebo stupeň
    if (pool.length === 0) {
      pool = this.archetypes.filter(
        (arch) => arch.schoolTypes.includes(targetSchool) || arch.grades.includes(grade)
      );
    }

    return pool.length > 0 ? pool : this.archetypes;
  }

  /**
   * Vygeneruje další dynamicky parametrizovanou úlohu se zárukou variability
   * (posuvné okno nedávných archetypů i konkrétních číselných variant).
   */
  public nextProblem(query: QuestionNextQuery): Problem {
    const targetSchool = query.schoolType || inferSchoolTypeFromGrade(query.grade);
    const pool = this.selectArchetypes({ ...query, schoolType: targetSchool });
    const memory = this.loadSeenMemory(query.studentId);
    const excludeSet = new Set(query.excludeArchetypeIds || []);

    const windowSize = Math.max(0, Math.min(pool.length - 1, Math.floor(pool.length * 0.75)));
    const recentSet = new Set(memory.recentArchetypes.slice(-windowSize));

    let candidates = pool.filter(
      (arch) => !recentSet.has(arch.id) && !excludeSet.has(arch.id)
    );

    if (candidates.length === 0) {
      candidates = pool.filter((arch) => !excludeSet.has(arch.id));
    }

    if (candidates.length === 0) {
      const lastUsed = memory.recentArchetypes[memory.recentArchetypes.length - 1];
      candidates = pool.length > 1 ? pool.filter((a) => a.id !== lastUsed) : pool;
    }

    // Upřednostni nejméně nedávno viděné archetypy, pokud je více kandidátů
    const chosenArchetype = pick(candidates);

    let generated: Problem | null = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = chosenArchetype.generate({
        grade: query.grade,
        schoolType: targetSchool,
        gradeYear: query.gradeYear,
      });
      const seedKey = `${chosenArchetype.id}:${candidate.variantSeed || candidate.question}`;
      if (!memory.recentVariants.includes(seedKey) || attempt === 9) {
        generated = candidate;
        memory.recentArchetypes.push(chosenArchetype.id);
        memory.recentVariants.push(seedKey);
        this.saveSeenMemory(memory, query.studentId);
        break;
      }
    }

    return generated!;
  }

  /**
   * Vygeneruje sadu různorodých úloh pro zadanou školu a ročník bez opakování typů v rámci dávky.
   */
  public generateBatch(query: QuestionNextQuery, count: number): Problem[] {
    const safeCount = Math.max(1, count);
    const results: Problem[] = [];
    const batchArchetypes: string[] = [...(query.excludeArchetypeIds || [])];
    const targetSchool = query.schoolType || inferSchoolTypeFromGrade(query.grade);
    const poolSize = this.selectArchetypes({ ...query, schoolType: targetSchool }).length;

    for (let i = 0; i < safeCount; i++) {
      const activeExclusions =
        batchArchetypes.length >= poolSize ? batchArchetypes.slice(-1) : batchArchetypes;
      const problem = this.nextProblem({
        ...query,
        schoolType: targetSchool,
        excludeArchetypeIds: activeExclusions,
      });
      results.push(problem);
      if (problem.archetypeId) {
        batchArchetypes.push(problem.archetypeId);
      }
    }

    return results;
  }

  /**
   * Vrací dostupná témata pro zvolenou školu a volitelně konkrétní ročník.
   */
  public getAvailableTopics(schoolType: SchoolType, gradeYear?: number): TopicOption[] {
    const seen = new Set<TopicCategory>();
    const options: TopicOption[] = [];

    const matching = this.archetypes.filter(
      (arch) => arch.schoolTypes.includes(schoolType) && this.matchesGradeYear(arch, gradeYear)
    );
    const source =
      matching.length > 0
        ? matching
        : this.archetypes.filter((arch) => arch.schoolTypes.includes(schoolType));

    for (const arch of source) {
      if (!seen.has(arch.topic)) {
        seen.add(arch.topic);
        options.push({
          value: arch.topic,
          label: TOPIC_LABELS[arch.topic] || arch.topicName,
        });
      }
    }

    return options;
  }

  /**
   * Vrací počet dostupných typových úloh pro školu a případně vybraný ročník.
   */
  public getArchetypeCount(schoolType: SchoolType, gradeYear?: number): number {
    const filtered = this.archetypes.filter(
      (arch) => arch.schoolTypes.includes(schoolType) && this.matchesGradeYear(arch, gradeYear)
    );
    if (filtered.length > 0) return filtered.length;
    return this.archetypes.filter((arch) => arch.schoolTypes.includes(schoolType)).length;
  }

  /**
   * Vrací přehledové statistiky banky úloh (celkem, CERMAT 9. třída, Obchodní lyceum i vybraný filtr).
   */
  public getStats(schoolType?: SchoolType, gradeYear?: number): QuestionBankStats {
    const bySchoolType: Record<SchoolType, number> = {
      primary_school: 0,
      cermat_prep: 0,
      business_lyceum: 0,
      grammar_school: 0,
      vocational_sos: 0,
      university: 0,
    };
    const byTopic: Partial<Record<TopicCategory, number>> = {};

    for (const arch of this.archetypes) {
      for (const st of arch.schoolTypes) {
        bySchoolType[st] = (bySchoolType[st] || 0) + 1;
      }
      if (!schoolType || (arch.schoolTypes.includes(schoolType) && this.matchesGradeYear(arch, gradeYear))) {
        byTopic[arch.topic] = (byTopic[arch.topic] || 0) + 1;
      }
    }

    return {
      totalArchetypes: this.archetypes.length,
      cermatCount: this.getCermatDatabase().length,
      businessLyceumCount: this.getBusinessLyceumCurriculum(
        schoolType === 'business_lyceum' ? gradeYear : undefined
      ).length,
      filteredCount: schoolType
        ? this.getArchetypeCount(schoolType, gradeYear)
        : this.archetypes.length,
      bySchoolType,
      byTopic,
    };
  }
}

export const questionBank = new QuestionBank();
