import {
  ProblemArchetype,
  randInt,
  randNonZeroInt,
  pick,
  simplifyFraction,
  makeUniqueId,
  numericAnswers,
  formatCz,
} from './types';
import { UNIVERSITY_DOMAINS } from './czechContexts';

export const UNIVERSITY_ARCHETYPES: ProblemArchetype[] = [
  // ==========================================
  // VŠ 1. ROČNÍK — MATEMATICKÁ ANALÝZA (MA1)
  // ==========================================
  {
    id: 'univ_calc_limit_infinity',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'calculus',
    topicName: 'Matematická analýza: Limita lomené funkce v ∞',
    curriculumRef: 'MA1 VŠ · Limita funkce a posloupnosti',
    difficulty: 'easy',
    generate: (ctx) => {
      const denom = pick([1, 2, 3, 4]);
      const k = randNonZeroInt(-6, 8);
      const a = denom * k; // ensures clean integer or simple value a/denom = k
      const b = randNonZeroInt(-9, 9);
      const c = randNonZeroInt(-5, 9);
      const e = randNonZeroInt(-8, 8);
      const f = randNonZeroInt(-7, 7);
      const ans = numericAnswers(k);

      return {
        id: makeUniqueId('univ_calc_limit_infinity'),
        archetypeId: 'univ_calc_limit_infinity',
        curriculumRef: 'MA1 VŠ · Limita funkce a posloupnosti',
        variantSeed: `${a}_${b}_${c}_${denom}_${e}_${f}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'calculus',
        topicName: 'Matematická analýza: Limita lomené funkce v ∞',
        title: `Limita racionální funkce pro x → +∞`,
        question: `Vypočítej limitu funkce:\nlim (x → +∞) (${a}x² ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}) / (${denom === 1 ? '' : denom}x² ${e >= 0 ? `+ ${e}` : `- ${Math.abs(e)}`}x ${f >= 0 ? `+ ${f}` : `- ${Math.abs(f)}`})`,
        realWorldContext:
          'Asymptotické chování algoritmů (O-notace v informatice) a ustálený stav dynamických soustav v čase t → ∞.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'easy',
        stepByStepSolution: `Vydělíme čitatel i jmenovatel nejvyšší mocninou x²:\nlim (x → +∞) (${a} + ${b}/x + ${c}/x²) / (${denom} + ${e}/x + ${f}/x²) = ${a} / ${denom} = ${k}.`,
        hints: [
          `Stupeň polynomu v čitateli i jmenovateli je stejný (x²).`,
          `Vytkni nebo vyděl čitatel i jmenovatel x² – zlomky typu 1/x jdou v nekonečnu k nule.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_calc_limit_zero_zero',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'calculus',
    topicName: 'Matematická analýza: Limita neurčitého výrazu [0/0]',
    curriculumRef: 'MA1 VŠ · Odstranění neurčitosti [0/0]',
    difficulty: 'medium',
    generate: (ctx) => {
      // lim_{x -> r} (x^2 + bx + c) / (x - r) where numerator = (x - r)(x - s)
      const r = randNonZeroInt(-5, 6);
      let s = randNonZeroInt(-6, 6);
      while (s === r) s = randNonZeroInt(-6, 6);
      const b = -(r + s);
      const c = r * s;
      const result = r - s;
      const bStr = b === 0 ? '' : b > 0 ? `+ ${b === 1 ? '' : b}x` : `- ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
      const cStr = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
      const denomStr = r > 0 ? `x - ${r}` : `x + ${Math.abs(r)}`;
      const ans = numericAnswers(result);

      return {
        id: makeUniqueId('univ_calc_limit_zero_zero'),
        archetypeId: 'univ_calc_limit_zero_zero',
        curriculumRef: 'MA1 VŠ · Odstranění neurčitosti [0/0]',
        variantSeed: `${r}_${s}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'calculus',
        topicName: 'Matematická analýza: Limita neurčitého výrazu [0/0]',
        title: `Limita typu [0/0] v bodě x = ${r}`,
        question: `Vypočítej limitu (krácením nebo L'Hospitalovým pravidlem):\nlim (x → ${r}) (x² ${bStr} ${cStr}) / (${denomStr})`,
        realWorldContext:
          'Okamžitá rychlost, tečny i analýza singularit ve fyzikálních a technických modelech.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `Dosazením x = ${r} dostaneme neurčitý výraz [0/0].\nRozložíme čitatel na součin: (x - (${r}))(x - (${s})).\nPo vykrácení (${denomStr}) zůstane lim (x → ${r}) (x ${s > 0 ? `- ${s}` : `+ ${Math.abs(s)}`}) = ${r} - (${s}) = ${result}.\n(Alternativně L'Hospitalovým pravidlem: (2x ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}) / 1 v bodě ${r} dává ${2 * r + b} = ${result}.)`,
        hints: [
          `Přímé dosazení x = ${r} vede k 0/0. Zkus čitatel rozložit na součin kořenových činitelů.`,
          `Nebo použij L'Hospitalovo pravidlo: zderivuj zvlášť čitatel a zvlášť jmenovatel a dosaď x = ${r}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_calc_marginal_derivative',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'calculus',
    topicName: 'Diferenciální počet: Derivace polynomu v bodě',
    curriculumRef: 'MA1 VŠ · Aplikace první derivace',
    difficulty: 'medium',
    generate: (ctx) => {
      const dom = pick(UNIVERSITY_DOMAINS);
      const a = randInt(2, 5);
      const b = randInt(4, 15) * 10;
      const q = randInt(10, 40);
      // f(q) = b*q - a*q^2 => f'(q) = b - 2*a*q
      const derivVal = b - 2 * a * q;
      const ans = numericAnswers(derivVal);

      return {
        id: makeUniqueId('univ_calc_marginal_derivative'),
        archetypeId: 'univ_calc_marginal_derivative',
        curriculumRef: 'MA1 VŠ · Aplikace první derivace',
        variantSeed: `${dom.subject}_${a}_${b}_${q}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'calculus',
        topicName: 'Diferenciální počet: Derivace polynomu v bodě',
        title: `Mezní veličina v modelu ${dom.subject}`,
        question: `Funkce v modelu ${dom.subject} je dána předpisem f(q) = ${b}q - ${a}q², kde q je počet ${dom.unit}. Urči hodnotu první derivace f'(${q}).`,
        realWorldContext:
          'Okamžitá míra změny funkce (marginální příjem, rychlost reakce, sklon křivky) je klíčovým nástrojem bakalářské matematiky.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `1. Derivujeme podle mocninného pravidla: f'(q) = ${b} - ${2 * a}q.\n2. Dosadíme q = ${q}: f'(${q}) = ${b} - ${2 * a}·${q} = ${b - 2 * a * q}.`,
        hints: [
          `Použij pravidlo (q^n)' = n · q^(n-1).`,
          `Derivace ${b}q je ${b}, derivace -${a}q² je -${2 * a}q. Pak dosaď q = ${q}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_calc_product_exp_deriv',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'calculus',
    topicName: 'Diferenciální počet: Derivace součinu a složené funkce',
    curriculumRef: 'MA1 VŠ · Derivace součinu s exponenciálou',
    difficulty: 'hard',
    generate: (ctx) => {
      // f(x) = (a*x + b) * e^(c*x) => f'(x) = (a + c*(a*x + b)) * e^(c*x)
      // At x = 0: f'(0) = a + c*b (clean integer!)
      const a = randNonZeroInt(-5, 7);
      const b = randNonZeroInt(-6, 6);
      const c = randNonZeroInt(-3, 4);
      const result = a + c * b;
      const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const expArg = c === 1 ? 'x' : c === -1 ? '-x' : `${c}x`;
      const ans = numericAnswers(result);

      return {
        id: makeUniqueId('univ_calc_product_exp_deriv'),
        archetypeId: 'univ_calc_product_exp_deriv',
        curriculumRef: 'MA1 VŠ · Derivace součinu s exponenciálou',
        variantSeed: `${a}_${b}_${c}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'calculus',
        topicName: 'Diferenciální počet: Derivace součinu a složené funkce',
        title: `Derivace funkce f(x) = (${a}x ${bStr}) · e^(${expArg}) v bodě x = 0`,
        question: `Urči hodnotu první derivace f'(0) pro funkci:\nf(x) = (${a}x ${bStr}) · e^(${expArg})`,
        realWorldContext:
          'Tlumené kmity v elektrotechnice, přechodové děje v obvodech a spojité úročení.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'hard',
        stepByStepSolution: `Použijeme pravidlo pro derivaci součinu (u·v)' = u'·v + u·v' a složené funkce (e^(${expArg}))' = ${c}·e^(${expArg}).\nf'(x) = ${a}·e^(${expArg}) + (${a}x ${bStr})·${c}·e^(${expArg}).\nDosadíme x = 0 (e⁰ = 1): f'(0) = ${a} + (${b})·${c} = ${result}.`,
        hints: [
          `Nezapomeň na pravidlo pro derivaci součinu (u·v)' = u'v + uv'.`,
          `Při derivaci e^(${expArg}) nezapomeň na vnitřní derivaci exponentu (${c}). V bodě x = 0 platí e⁰ = 1.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_calc_local_extremum',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'calculus',
    topicName: 'Průběh funkce: Lokální extrém kubické funkce',
    curriculumRef: 'MA1 VŠ · Lokální maxima a minima',
    difficulty: 'medium',
    generate: (ctx) => {
      // f'(x) = 3(x - r1)(x - r2) with r1 < r2 -> f(x) = x^3 - (3/2)(r1+r2)x^2 + 3*r1*r2*x + d
      // Pick r1, r2 with same parity so (r1+r2) is even -> integer coefficients!
      const r1 = randInt(-3, 2);
      const r2 = r1 + pick([2, 4, 6]);
      const quadCoeff = -((3 * (r1 + r2)) / 2);
      const linCoeff = 3 * r1 * r2;
      const askMin = randInt(0, 1) === 1;
      // For positive leading x^3: local max is at smaller root r1, local min is at larger root r2
      const targetX = askMin ? r2 : r1;
      const ans = numericAnswers(targetX);

      const qStr = quadCoeff === 0 ? '' : quadCoeff > 0 ? `+ ${quadCoeff}x²` : `- ${Math.abs(quadCoeff)}x²`;
      const lStr = linCoeff === 0 ? '' : linCoeff > 0 ? `+ ${linCoeff}x` : `- ${Math.abs(linCoeff)}x`;

      return {
        id: makeUniqueId('univ_calc_local_extremum'),
        archetypeId: 'univ_calc_local_extremum',
        curriculumRef: 'MA1 VŠ · Lokální maxima a minima',
        variantSeed: `${r1}_${r2}_${askMin}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'calculus',
        topicName: 'Průběh funkce: Lokální extrém kubické funkce',
        title: askMin ? 'Bod lokálního minima funkce' : 'Bod lokálního maxima funkce',
        question: `Vyšetři průběh funkce f(x) = x³ ${qStr} ${lStr} + 7.\nPro jakou hodnotu x má tato funkce ${askMin ? 'LOKÁLNÍ MINIMUM' : 'LOKÁLNÍ MAXIMUM'}?`,
        realWorldContext:
          'Hledání lokálních minim ztrátové funkce při trénování neuronových sítí (gradient descent) a optimalizace konstrukcí.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `x = ${targetX}`],
        difficulty: 'medium',
        stepByStepSolution: `1. První derivace: f'(x) = 3x² ${2 * quadCoeff >= 0 ? `+ ${2 * quadCoeff}` : `- ${Math.abs(2 * quadCoeff)}`}x ${linCoeff >= 0 ? `+ ${linCoeff}` : `- ${Math.abs(linCoeff)}`}.\n2. Stacionární body f'(x) = 0: 3(x - (${r1}))(x - (${r2})) = 0 => x₁ = ${r1}, x₂ = ${r2}.\n3. Druhá derivace f''(x) = 6x ${2 * quadCoeff >= 0 ? `+ ${2 * quadCoeff}` : `- ${Math.abs(2 * quadCoeff)}`}: v bodě ${r1} je f'' < 0 (maximum), v bodě ${r2} je f'' > 0 (minimum).`,
        hints: [
          `Najdi první derivaci f'(x) a polož ji rovnou nule, čímž získáš dva stacionární body.`,
          `Pomocí druhé derivace f''(x) rozhodni, který bod je minimum (f'' > 0) a který maximum (f'' < 0).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_calc_tangent_line',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'calculus',
    topicName: 'Diferenciální počet: Rovnice tečny ke grafu',
    curriculumRef: 'MA1 VŠ · Geometrický význam derivace',
    difficulty: 'easy',
    generate: (ctx) => {
      const a = randInt(1, 3);
      const b = randNonZeroInt(-5, 5);
      const c = randInt(-6, 6);
      const x0 = randInt(-2, 3);
      // f(x) = ax^3 + bx + c => f'(x) = 3ax^2 + b
      const slope = 3 * a * x0 * x0 + b;
      const ans = numericAnswers(slope);

      return {
        id: makeUniqueId('univ_calc_tangent_line'),
        archetypeId: 'univ_calc_tangent_line',
        curriculumRef: 'MA1 VŠ · Geometrický význam derivace',
        variantSeed: `${a}_${b}_${c}_${x0}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'calculus',
        topicName: 'Diferenciální počet: Rovnice tečny ke grafu',
        title: `Směrnice tečny ke grafu funkce v bodě x₀ = ${x0}`,
        question: `Urči směrnici k tečny ke grafu funkce f(x) = ${a === 1 ? '' : a}x³ ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} v bodě o souřadnici x₀ = ${x0}.`,
        realWorldContext:
          'Lineární aproximace nelineárních funkcí a výpočet sklonu křivek v CAD systémech.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `k = ${slope}`],
        difficulty: 'easy',
        stepByStepSolution: `Směrnice tečny v bodě x₀ je rovna hodnotě první derivace f'(x₀).\nf'(x) = ${3 * a}x² ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}.\nf'(${x0}) = ${3 * a}·(${x0})² ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`} = ${slope}.`,
        hints: [
          `Směrnice tečny k v bodě dotyku je přímo f'(x₀).`,
          `Zderivuj polynom f(x) a dosaď x = ${x0}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_calc_definite_integral',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'calculus',
    topicName: 'Integrální počet: Určitý integrál polynomu',
    curriculumRef: 'MA1 VŠ · Newton-Leibnizova formule',
    difficulty: 'medium',
    generate: (ctx) => {
      // ∫_a^b (3*c2*x^2 + 2*c1*x + c0) dx -> antiderivative F(x) = c2*x^3 + c1*x^2 + c0*x (guaranteed integer!)
      const c2 = randInt(1, 3);
      const c1 = randNonZeroInt(-4, 5);
      const c0 = randInt(-4, 6);
      const low = randInt(0, 2);
      const high = low + randInt(1, 3);
      const F = (x: number) => c2 * x * x * x + c1 * x * x + c0 * x;
      const integralVal = F(high) - F(low);
      const ans = numericAnswers(integralVal);

      const t2 = `${3 * c2}x²`;
      const t1 = c1 > 0 ? `+ ${2 * c1}x` : `- ${Math.abs(2 * c1)}x`;
      const t0 = c0 === 0 ? '' : c0 > 0 ? `+ ${c0}` : `- ${Math.abs(c0)}`;

      return {
        id: makeUniqueId('univ_calc_definite_integral'),
        archetypeId: 'univ_calc_definite_integral',
        curriculumRef: 'MA1 VŠ · Newton-Leibnizova formule',
        variantSeed: `${c2}_${c1}_${c0}_${low}_${high}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'calculus',
        topicName: 'Integrální počet: Určitý integrál polynomu',
        title: `Určitý integrál na intervalu [${low}; ${high}]`,
        question: `Vypočítej určitý integrál pomocí Newtonovy-Leibnizovy formule:\n∫ od ${low} do ${high} z (${t2} ${t1} ${t0}) dx`,
        realWorldContext:
          'Výpočet dráhy z rychlosti, vykonané práce proměnnou silou nebo celkových nákladů z mezních nákladů.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `1. Najdeme primitivní funkci F(x) = ${c2 === 1 ? '' : c2}x³ ${c1 >= 0 ? `+ ${c1 === 1 ? '' : c1}x²` : `- ${Math.abs(c1) === 1 ? '' : Math.abs(c1)}x²`} ${c0 === 0 ? '' : c0 > 0 ? `+ ${c0}x` : `- ${Math.abs(c0)}x`}.\n2. Dosadíme meze: F(${high}) - F(${low}) = ${F(high)} - (${F(low)}) = ${integralVal}.`,
        hints: [
          `Najdi primitivní funkci F(x) pomocí pravidla ∫ x^n dx = x^(n+1)/(n+1).`,
          `Poté spočítej rozdíl F(${high}) - F(${low}).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_calc_area_under_curve',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'calculus',
    topicName: 'Integrální počet: Obsah rovinného obrazce',
    curriculumRef: 'MA1 VŠ · Geometrická aplikace určitého integrálu',
    difficulty: 'hard',
    generate: (ctx) => {
      // Area under y = 3k*(r^2 - x^2)/? Wait: ∫_{-r}^{r} k*(r^2 - x^2) dx = k * [r^2*x - x^3/3]_{-r}^r = k * (4/3) * r^3.
      // Let k = 3*m so area = 4 * m * r^3 (guaranteed integer!)
      const m = pick([1, 2]);
      const k = 3 * m;
      const r = randInt(1, 3);
      const top = k * r * r;
      const area = 4 * m * r * r * r;
      const ans = numericAnswers(area);

      return {
        id: makeUniqueId('univ_calc_area_under_curve'),
        archetypeId: 'univ_calc_area_under_curve',
        curriculumRef: 'MA1 VŠ · Geometrická aplikace určitého integrálu',
        variantSeed: `${k}_${r}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'calculus',
        topicName: 'Integrální počet: Obsah rovinného obrazce',
        title: `Obsah obrazce ohraničeného parabolou y = ${top} - ${k}x²`,
        question: `Vypočítej obsah rovinného obrazce ohraničeného osou x (y = 0) a parabolou y = ${top} - ${k}x².`,
        realWorldContext:
          'Výpočet plochy průřezů mostních oblouků, plochy pod distribuční křivkou pravděpodobnosti a spotřebitelského přebytku.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'hard',
        stepByStepSolution: `1. Průsečíky s osou x: ${top} - ${k}x² = 0 => x = ±${r}.\n2. Obsah S = ∫ od -${r} do ${r} (${top} - ${k}x²) dx = [${top}x - ${m}x³] od -${r} do ${r}.\n3. S = (${top * r - m * r * r * r}) - (-${top * r - m * r * r * r}) = ${area}.`,
        hints: [
          `Najdi nejprve meze integrálu položením ${top} - ${k}x² = 0.`,
          `Vzhledem k sudosti funkce můžeš počítat 2 · ∫ od 0 do ${r} z (${top} - ${k}x²) dx.`,
        ],
        type: 'number',
      };
    },
  },

  // ==========================================
  // VŠ 1. ROČNÍK — LINEÁRNÍ ALGEBRA A MATICE
  // ==========================================
  {
    id: 'univ_mat_det2x2',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'matrices',
    topicName: 'Lineární algebra: Determinant matice 2×2',
    curriculumRef: 'LA VŠ · Determinanty 2. řádu',
    difficulty: 'easy',
    generate: (ctx) => {
      const a = randNonZeroInt(-6, 8);
      const b = randNonZeroInt(-6, 7);
      const c = randNonZeroInt(-5, 6);
      const d = randNonZeroInt(-6, 8);
      const det = a * d - b * c;
      const ans = numericAnswers(det);

      return {
        id: makeUniqueId('univ_mat_det2x2'),
        archetypeId: 'univ_mat_det2x2',
        curriculumRef: 'LA VŠ · Determinanty 2. řádu',
        variantSeed: `${a}_${b}_${c}_${d}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'matrices',
        topicName: 'Lineární algebra: Determinant matice 2×2',
        title: `Determinant matice A = [[${a}, ${b}], [${c}, ${d}]]`,
        question: `Vypočítej determinant matice:\nA = [[${a}, ${b}], [${c}, ${d}]]`,
        realWorldContext:
          'Determinant určuje změnu plochy/objemu při lineárním zobrazení a testuje regularitu (invertovatelnost) matice.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'easy',
        stepByStepSolution: `det(A) = a·d - b·c = (${a})·(${d}) - (${b})·(${c}) = ${a * d} - (${b * c}) = ${det}.`,
        hints: [
          `Vynásob prvky na hlavní diagonále (${a} · ${d}) a odečti součin prvků na vedlejší diagonále (${b} · ${c}).`,
          `Dej si pozor na znaménka při násobení záporných čísel.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_mat_det3x3_sarrus',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'matrices',
    topicName: 'Lineární algebra: Determinant 3×3 (Sarrusovo pravidlo)',
    curriculumRef: 'LA VŠ · Determinanty 3. řádu',
    difficulty: 'medium',
    generate: (ctx) => {
      const a = randInt(1, 4), b = randInt(-2, 3), c = randInt(0, 3);
      const d = randInt(-2, 3), e = randInt(1, 4), f = randInt(-2, 3);
      const g = randInt(0, 2), h = randInt(-2, 3), i = randInt(1, 4);
      const det = a * e * i + b * f * g + c * d * h - (c * e * g + a * f * h + b * d * i);
      const ans = numericAnswers(det);

      return {
        id: makeUniqueId('univ_mat_det3x3_sarrus'),
        archetypeId: 'univ_mat_det3x3_sarrus',
        curriculumRef: 'LA VŠ · Determinanty 3. řádu',
        variantSeed: `${a}_${b}_${c}_${d}_${e}_${f}_${g}_${h}_${i}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'matrices',
        topicName: 'Lineární algebra: Determinant 3×3 (Sarrusovo pravidlo)',
        title: `Determinant matice 3×3 pomocí Sarrusova pravidla`,
        question: `Vypočítej determinant matice 3×3:\n| ${a}   ${b}   ${c} |\n| ${d}   ${e}   ${f} |\n| ${g}   ${h}   ${i} |`,
        realWorldContext:
          'Řešení soustav 3 rovnic o 3 neznámých (Cramerovo pravidlo) a výpočet objemů rovnoběžnostěnu v 3D grafice.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `Sarrusovo pravidlo:\nHlavní směry (+): (${a}·${e}·${i}) + (${b}·${f}·${g}) + (${c}·${d}·${h}) = ${a * e * i + b * f * g + c * d * h}.\nVedlejší směry (-): (${c}·${e}·${g}) + (${a}·${f}·${h}) + (${b}·${d}·${i}) = ${c * e * g + a * f * h + b * d * i}.\nVýsledek = ${det}.`,
        hints: [
          `Doporučujeme Sarrusovo pravidlo: přepiš si pod matici první dva řádky (nebo vpravo první dva sloupce).`,
          `Sečti součiny tří klesajících diagonál a odečti součiny tří stoupajících diagonál.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_mat_product_trace',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'matrices',
    topicName: 'Lineární algebra: Násobení matic a stopa matice',
    curriculumRef: 'LA VŠ · Maticové operace',
    difficulty: 'medium',
    generate: (ctx) => {
      const a11 = randInt(-3, 5), a12 = randInt(-3, 5);
      const a21 = randInt(-3, 5), a22 = randInt(-3, 5);
      const b11 = randInt(-3, 5), b12 = randInt(-3, 5);
      const b21 = randInt(-3, 5), b22 = randInt(-3, 5);
      // C = A * B -> c11 = a11*b11 + a12*b21, c22 = a21*b12 + a22*b22
      const c11 = a11 * b11 + a12 * b21;
      const c22 = a21 * b12 + a22 * b22;
      const trace = c11 + c22;
      const ans = numericAnswers(trace);

      return {
        id: makeUniqueId('univ_mat_product_trace'),
        archetypeId: 'univ_mat_product_trace',
        curriculumRef: 'LA VŠ · Maticové operace',
        variantSeed: `${a11}_${a12}_${a21}_${a22}_${b11}_${b12}_${b21}_${b22}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'matrices',
        topicName: 'Lineární algebra: Násobení matic a stopa matice',
        title: `Stopa součinu matic Tr(A · B)`,
        question: `Jsou dány matice A = [[${a11}, ${a12}], [${a21}, ${a22}]] a B = [[${b11}, ${b12}], [${b21}, ${b22}]].\nVypočítej stopu součinové matice C = A · B (součet prvků na hlavní diagonále c₁₁ + c₂₂).`,
        realWorldContext:
          'Násobení matic je základní operací všech grafických karet (GPU) a dopředného průchodu v umělé inteligenci.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `Prvek c₁₁ = (${a11})·(${b11}) + (${a12})·(${b21}) = ${c11}.\nPrvek c₂₂ = (${a21})·(${b12}) + (${a22})·(${b22}) = ${c22}.\nStopa Tr(A·B) = c₁₁ + c₂₂ = ${c11} + (${c22}) = ${trace}.`,
        hints: [
          `Pamatuj na pravidlo "řádek první matice krát sloupec druhé matice".`,
          `Stačí ti spočítat pouze prvky c₁₁ (1. řádek A · 1. sloupec B) a c₂₂ (2. řádek A · 2. sloupec B) a sečíst je.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_mat_slar_2x2',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'matrices',
    topicName: 'Lineární algebra: Soustavy rovnic (Cramer / Gauss)',
    curriculumRef: 'LA VŠ · Soustavy lineárních rovnic (SLAR)',
    difficulty: 'medium',
    generate: (ctx) => {
      // Unique integer solution (x, y) with det != 0
      const x = randNonZeroInt(-4, 6);
      const y = randNonZeroInt(-4, 6);
      const a1 = randInt(1, 4);
      const b1 = randNonZeroInt(-3, 4);
      const a2 = randInt(1, 4);
      let b2 = randNonZeroInt(-3, 4);
      while (a1 * b2 - a2 * b1 === 0) {
        b2 = randNonZeroInt(-4, 5);
      }
      const rhs1 = a1 * x + b1 * y;
      const rhs2 = a2 * x + b2 * y;
      const askSum = randInt(0, 1) === 1;
      const result = askSum ? x + y : x;
      const ans = numericAnswers(result);

      return {
        id: makeUniqueId('univ_mat_slar_2x2'),
        archetypeId: 'univ_mat_slar_2x2',
        curriculumRef: 'LA VŠ · Soustavy lineárních rovnic (SLAR)',
        variantSeed: `${a1}_${b1}_${a2}_${b2}_${x}_${y}_${askSum}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'matrices',
        topicName: 'Lineární algebra: Soustavy rovnic (Cramer / Gauss)',
        title: askSum ? 'Soustava rovnic: součet řešení x + y' : 'Soustava rovnic pomocí Cramerova pravidla',
        question: `Vyřeš soustavu lineárních rovnic:\n${a1}x ${b1 >= 0 ? `+ ${b1}` : `- ${Math.abs(b1)}`}y = ${rhs1}\n${a2}x ${b2 >= 0 ? `+ ${b2}` : `- ${Math.abs(b2)}`}y = ${rhs2}\n${askSum ? 'Zadej hodnotu součtu x + y.' : 'Zadej výslednou hodnotu x.'}`,
        realWorldContext:
          'Gaussova eliminace a Cramerovo pravidlo řeší sítě elektrických obvodů (Kirchhoffovy zákony) i ekonomickou rovnováhu.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `Determinant soustavy D = ${a1}·(${b2}) - (${b1})·${a2} = ${a1 * b2 - b1 * a2}.\nVyřešením získáme x = ${x}, y = ${y}.\n${askSum ? `Součet x + y = ${x + y}.` : `Hledaná složka x = ${x}.`}`,
        hints: [
          `Můžeš použít Gaussovu eliminační metodu nebo Cramerovo pravidlo (x = Dx / D).`,
          `Zkontroluj své řešení dosazením do obou rovnic.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'univ_mat_orthogonal_vectors',
    schoolTypes: ['university'],
    grades: ['university'],
    topic: 'matrices',
    topicName: 'Vektorový prostor R³: Kolmost vektorů',
    curriculumRef: 'LA VŠ · Eukleidovský prostor a skalární součin',
    difficulty: 'easy',
    generate: (ctx) => {
      const u1 = randNonZeroInt(-4, 5);
      const u2 = randNonZeroInt(-4, 5);
      const u3 = pick([1, 2, -1, -2]);
      const mult = Math.abs(u3);
      const v1 = randNonZeroInt(-3, 4) * mult;
      const v2 = randNonZeroInt(-3, 4) * mult;
      const newDot = u1 * v1 + u2 * v2;
      const k = -newDot / u3;
      const ans = numericAnswers(k);

      return {
        id: makeUniqueId('univ_mat_orthogonal_vectors'),
        archetypeId: 'univ_mat_orthogonal_vectors',
        curriculumRef: 'LA VŠ · Eukleidovský prostor a skalární součin',
        variantSeed: `${u1}_${u2}_${u3}_${v1}_${v2}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'matrices',
        topicName: 'Vektorový prostor R³: Kolmost vektorů',
        title: `Ortogonalita vektorů v prostoru R³`,
        question: `V prostoru R³ jsou zadány vektory u = (${u1}; ${u2}; ${u3}) a v = (${v1}; ${v2}; k).\nUrči reálný parametr k tak, aby byly vektory u a v navzájem KOLMÉ (ortogonální).`,
        realWorldContext:
          'Ortogonalita je základem Fourierových transformací, normálových vektorů osvětlení v 3D grafice a metody nejmenších čtverců.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `k = ${k}`],
        difficulty: 'easy',
        stepByStepSolution: `Vektory jsou kolmé právě tehdy, když jejich skalární součin u · v = 0.\n${u1}·(${v1}) + ${u2}·(${v2}) + ${u3}·k = 0\n${newDot} + ${u3}k = 0 => k = ${k}.`,
        hints: [
          `Dva nenulové vektory jsou kolmé, pokud je jejich skalární součin roven nule.`,
          `Vynásob odpovídající souřadnice (${u1}·${v1} + ${u2}·${v2} + ${u3}·k) a polož součet roven 0.`,
        ],
        type: 'number',
      };
    },
  },
];
