import {
  ProblemArchetype,
  randInt,
  randNonZeroInt,
  pick,
  makeUniqueId,
  numericAnswers,
  formatCz,
} from './types';
import { ESHOP_PRODUCTS, LYCEUM_COMPANIES } from './czechContexts';

export const SECONDARY_ARCHETYPES: ProblemArchetype[] = [
  // ==========================================
  // OBCHODNÍ LYCEUM A FINANČNÍ MATEMATIKA
  // ==========================================
  {
    id: 'lyceum_compound_interest',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [2, 3],
    topic: 'finance',
    topicName: 'Finanční matematika: Složené úročení',
    curriculumRef: 'RVP OA 2.–3. ročník · Složené úročení vkladů',
    difficulty: 'medium',
    generate: (ctx) => {
      const k0 = randInt(4, 20) * 10000;
      const rate = randInt(3, 8);
      const years = randInt(2, 4);
      const raw = k0 * Math.pow(1 + rate / 100, years);
      const result = Math.round(raw);
      const ans = numericAnswers(result, 'Kč');

      return {
        id: makeUniqueId('lyceum_compound_interest'),
        archetypeId: 'lyceum_compound_interest',
        curriculumRef: 'RVP OA · Složené úročení vkladů',
        variantSeed: `${k0}_${rate}_${years}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'finance',
        topicName: 'Finanční matematika: Složené úročení',
        title: `Termínovaný vklad ${k0.toLocaleString('cs-CZ')} Kč na ${years} roky`,
        question: `Klient vloží na spořicí účet ${k0.toLocaleString('cs-CZ')} Kč s roční úrokovou mírou ${rate} % p.a. a ročním připisováním úroků. Jaká bude celková částka na účtu po ${years} letech před zdaněním? (Zaokrouhli na celé Kč)`,
        realWorldContext:
          'Složené úročení je základem dlouhodobého investování, důchodového plánování a hodnocení inflace.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, result.toLocaleString('cs-CZ')],
        unit: 'Kč',
        difficulty: 'medium',
        stepByStepSolution: `Použijeme vzorec Kn = K0 · (1 + i)^n.\nK0 = ${k0.toLocaleString('cs-CZ')} Kč, i = ${formatCz(rate / 100)}, n = ${years}.\nKn = ${k0} · (${formatCz(1 + rate / 100)})^${years} ≈ ${result.toLocaleString('cs-CZ')} Kč.`,
        hints: [
          `Použij vzorec složeného úročení Kn = K0 · (1 + p/100)^n.`,
          `Spočítej (${formatCz(1 + rate / 100)}) umocněné na ${years} a vynásob vkladem ${k0}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_margin_markup',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [1, 2],
    topic: 'finance',
    topicName: 'Obchodní matematika: Marže vs. Obchodní přirážka',
    curriculumRef: 'RVP OA 1.–2. ročník · Cenová kalkulace a marže',
    difficulty: 'medium',
    generate: (ctx) => {
      const product = pick(ESHOP_PRODUCTS);
      const marginPct = pick([20, 25, 30, 40]);
      const costRatio = 100 - marginPct;
      const sellingPrice = randInt(8, 30) * 100;
      const buyPrice = (sellingPrice * costRatio) / 100;
      const ans = numericAnswers(sellingPrice, 'Kč');

      return {
        id: makeUniqueId('lyceum_margin_markup'),
        archetypeId: 'lyceum_margin_markup',
        curriculumRef: 'RVP OA · Cenová kalkulace a marže',
        variantSeed: `${product.item}_${buyPrice}_${marginPct}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'finance',
        topicName: 'Obchodní matematika: Marže vs. Obchodní přirážka',
        title: `Stanovení prodejní ceny při ${marginPct}% marži`,
        question: `E-shop nakupuje ${product.item} za nákupní cenu ${buyPrice.toLocaleString('cs-CZ')} Kč bez DPH. Požaduje obchodní marži přesně ${marginPct} % z prodejní ceny. Za jakou prodejní cenu bez DPH musí produkt prodávat?`,
        realWorldContext:
          'Záměna marže (podílu na prodejní ceně) za přirážku (připočtení k nákupu) je nejčastější chybou začínajících podnikatelů.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, sellingPrice.toLocaleString('cs-CZ')],
        unit: 'Kč',
        difficulty: 'medium',
        stepByStepSolution: `Pokud marže tvoří ${marginPct} % prodejní ceny P, pak nákupní cena tvoří ${costRatio} % prodejní ceny.\n0,${costRatio} · P = ${buyPrice} Kč => P = ${buyPrice} / 0,${costRatio} = ${sellingPrice} Kč.`,
        hints: [
          `Pozor: marže se počítá z PRODEJNÍ ceny, ne z nákupní!`,
          `Nákupní cena ${buyPrice} Kč představuje zbývajících ${costRatio} % prodejní ceny.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_vat_topdown',
    schoolTypes: ['business_lyceum', 'vocational_sos'],
    grades: ['lyceum_2', 'grammar_school'],
    gradeYears: [1, 2],
    topic: 'finance',
    topicName: 'Finanční matematika: Výpočet DPH shora i zdola',
    curriculumRef: 'RVP OA 1.–2. ročník · Daňová soustava a DPH',
    difficulty: 'easy',
    generate: (ctx) => {
      const rate = pick([21, 12]);
      const netPrice = randInt(5, 40) * 100;
      const grossPrice = Math.round(netPrice * (1 + rate / 100));
      const ans = numericAnswers(netPrice, 'Kč');

      return {
        id: makeUniqueId('lyceum_vat_topdown'),
        archetypeId: 'lyceum_vat_topdown',
        curriculumRef: 'RVP OA · Daňová soustava a DPH',
        variantSeed: `${rate}_${netPrice}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'finance',
        topicName: 'Finanční matematika: Výpočet DPH shora i zdola',
        title: `Výpočet základu daně z ceny s ${rate}% DPH`,
        question: `Faktura pro plátce daně uvádí konečnou cenu včetně ${rate} % DPH ve výši ${grossPrice.toLocaleString('cs-CZ')} Kč. Jaká je cena bez DPH (základ daně) v Kč?`,
        realWorldContext:
          'Každodenní účetní praxe při vystavování faktur a odpočtech DPH na vstupu.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, netPrice.toLocaleString('cs-CZ')],
        unit: 'Kč',
        difficulty: 'easy',
        stepByStepSolution: `Cena s DPH představuje ${100 + rate} % ceny bez DPH.\nZáklad daně = ${grossPrice} : ${formatCz(1 + rate / 100)} = ${netPrice} Kč.`,
        hints: [
          `Neodečítej ${rate} % z koncové ceny! Koncová cena odpovídá ${100 + rate} %.`,
          `Vyděl částku ${grossPrice} koeficientem ${formatCz(1 + rate / 100)}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_breakeven',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [1, 2, 3],
    topic: 'functions',
    topicName: 'Podniková ekonomika: Bod zvratu (Break-even)',
    curriculumRef: 'RVP OA 1.–3. ročník · Nákladové a příjmové funkce',
    difficulty: 'easy',
    generate: (ctx) => {
      const comp = pick(LYCEUM_COMPANIES);
      const varCost = randInt(6, 15) * 10;
      const unitMargin = pick([80, 100, 120, 150, 200]);
      const sellPrice = varCost + unitMargin;
      const targetUnits = randInt(6, 25) * 10;
      const fixedCost = targetUnits * unitMargin;
      const ans = numericAnswers(targetUnits, 'ks');

      return {
        id: makeUniqueId('lyceum_breakeven'),
        archetypeId: 'lyceum_breakeven',
        curriculumRef: 'RVP OA · Nákladové a příjmové funkce',
        variantSeed: `${comp.name}_${varCost}_${sellPrice}_${fixedCost}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'functions',
        topicName: 'Podniková ekonomika: Bod zvratu (Break-even)',
        title: `Bod zvratu pro firmu ${comp.name}`,
        question: `Firma ${comp.name} má fixní měsíční náklady ${fixedCost.toLocaleString('cs-CZ')} Kč. Variabilní náklady na 1 ks (${comp.singular}) činí ${varCost} Kč a prodejní cena je ${sellPrice} Kč. Kolik kusů musí měsíčně prodat, aby dosáhla bodu zvratu?`,
        realWorldContext:
          'Bod zvratu ukazuje minimální objem prodeje, od kterého podnik přestává být ztrátový a začíná tvořit zisk.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${targetUnits} kusů`],
        unit: 'ks',
        difficulty: 'easy',
        stepByStepSolution: `Příspěvek na úhradu na 1 kus = ${sellPrice} - ${varCost} = ${unitMargin} Kč.\nBod zvratu Q = Fixní náklady / Příspěvek = ${fixedCost} / ${unitMargin} = ${targetUnits} ks.`,
        hints: [
          `Spočítej, kolik Kč z každého prodaného kusu zbude po odečtení variabilních nákladů (${sellPrice} - ${varCost}).`,
          `Vyděl celkové fixní náklady ${fixedCost.toLocaleString('cs-CZ')} tímto příspěvkem na úhradu.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_arithmetic_seq_savings',
    schoolTypes: ['business_lyceum', 'grammar_school'],
    grades: ['lyceum_2', 'grammar_school'],
    gradeYears: [2, 3],
    topic: 'sequences',
    topicName: 'Posloupnosti: Součet aritmetické řady spoření',
    curriculumRef: 'RVP SŠ · Aritmetická posloupnost',
    difficulty: 'medium',
    generate: (ctx) => {
      const a1 = randInt(5, 15) * 100;
      const d = randInt(1, 5) * 100;
      const n = pick([6, 8, 10, 12]);
      const an = a1 + (n - 1) * d;
      const sum = (n * (a1 + an)) / 2;
      const ans = numericAnswers(sum, 'Kč');

      return {
        id: makeUniqueId('lyceum_arithmetic_seq_savings'),
        archetypeId: 'lyceum_arithmetic_seq_savings',
        curriculumRef: 'RVP SŠ · Aritmetická posloupnost',
        variantSeed: `${a1}_${d}_${n}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'sequences',
        topicName: 'Posloupnosti: Součet aritmetické řady spoření',
        title: `Pravidelné navyšování úspor po dobu ${n} měsíců`,
        question: `Student si první měsíc odložil ${a1} Kč a každý následující měsíc spořil vždy o ${d} Kč více než v měsíci předchozím. Kolik Kč celkem naspoří za prvních ${n} měsíců (bez započtení úroků)?`,
        realWorldContext:
          'Plánování postupného splácení dluhů, akumulace kapitálu a práce s aritmetickou posloupností.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, sum.toLocaleString('cs-CZ')],
        unit: 'Kč',
        difficulty: 'medium',
        stepByStepSolution: `Jde o aritmetickou posloupnost s a₁ = ${a1}, d = ${d}, n = ${n}.\nPoslední vklad: a_${n} = ${a1} + (${n}-1)·${d} = ${an} Kč.\nSoučet Sn = n·(a₁ + a_n)/2 = ${n}·(${a1} + ${an})/2 = ${sum} Kč.`,
        hints: [
          `Vypočítej nejprve, kolik student uloží v posledním (${n}.) měsíci: a_n = a₁ + (n - 1)·d.`,
          `Pak použij součtový vzorec Sn = n · (a₁ + a_n) / 2.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_expected_value_risk',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [3, 4],
    topic: 'probability',
    topicName: 'Pravděpodobnost a riziko: Očekávaný výnos',
    curriculumRef: 'RVP OA 3.–4. ročník · Statistika a rozhodování',
    difficulty: 'medium',
    generate: (ctx) => {
      const pSuccessPct = pick([60, 70, 75, 80]);
      const pFailPct = 100 - pSuccessPct;
      const gain = randInt(4, 12) * 10000;
      const loss = randInt(1, 3) * 10000;
      const expected = Math.round((pSuccessPct / 100) * gain - (pFailPct / 100) * loss);
      const ans = numericAnswers(expected, 'Kč');

      return {
        id: makeUniqueId('lyceum_expected_value_risk'),
        archetypeId: 'lyceum_expected_value_risk',
        curriculumRef: 'RVP OA · Statistika a rozhodování',
        variantSeed: `${pSuccessPct}_${gain}_${loss}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'probability',
        topicName: 'Pravděpodobnost a riziko: Očekávaný výnos',
        title: `Očekávaná hodnota investičního projektu`,
        question: `Firma zvažuje nový projekt. S pravděpodobností ${pSuccessPct} % přinese čistý zisk ${gain.toLocaleString('cs-CZ')} Kč, ale s pravděpodobností ${pFailPct} % skončí ztrátou ${loss.toLocaleString('cs-CZ')} Kč. Jaký je očekávaný výnos projektu (střední hodnota) v Kč?`,
        realWorldContext:
          'Výpočet střední hodnoty je základním nástrojem manažerů, pojišťoven a investorů při hodnocení rizik.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, expected.toLocaleString('cs-CZ')],
        unit: 'Kč',
        difficulty: 'medium',
        stepByStepSolution: `E(X) = p₁·x₁ + p₂·x₂ = ${formatCz(pSuccessPct / 100)}·${gain} - ${formatCz(pFailPct / 100)}·${loss} = ${(pSuccessPct * gain) / 100} - ${(pFailPct * loss) / 100} = ${expected} Kč.`,
        hints: [
          `Vynásob zisk jeho pravděpodobností (${formatCz(pSuccessPct / 100)}) a ztrátu (se znaménkem minus) její pravděpodobností (${formatCz(pFailPct / 100)}).`,
          `Obě hodnoty sečti.`,
        ],
        type: 'number',
      };
    },
  },

  // ==========================================
  // GYMNÁZIUM A SOŠ
  // ==========================================
  {
    id: 'gym_quadratic_roots',
    schoolTypes: ['grammar_school', 'vocational_sos'],
    grades: ['grammar_school'],
    topic: 'equations',
    topicName: 'Kvadratické rovnice: Diskriminant a Viètovy vzorce',
    curriculumRef: 'RVP G · Kvadratická algebra',
    difficulty: 'easy',
    generate: (ctx) => {
      const r1 = randInt(-4, 4);
      let r2 = randInt(r1 + 1, r1 + 7);
      // (x - r1)(x - r2) = x^2 - (r1+r2)x + r1*r2
      const b = -(r1 + r2);
      const c = r1 * r2;
      const askSum = randInt(0, 1) === 1;
      const targetVal = askSum ? r1 + r2 : r2;
      const bStr = b === 0 ? '' : b > 0 ? `+ ${b === 1 ? '' : b}x` : `- ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
      const cStr = c === 0 ? '' : c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
      const ans = numericAnswers(targetVal);

      return {
        id: makeUniqueId('gym_quadratic_roots'),
        archetypeId: 'gym_quadratic_roots',
        curriculumRef: 'RVP G · Kvadratická algebra',
        variantSeed: `${r1}_${r2}_${askSum}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'equations',
        topicName: 'Kvadratické rovnice: Diskriminant a Viètovy vzorce',
        title: askSum ? 'Součet kořenů kvadratické rovnice' : 'Větší kořen kvadratické rovnice',
        question: askSum
          ? `Je dána kvadratická rovnice x² ${bStr} ${cStr} = 0. Jaký je součet obou jejích kořenů (x₁ + x₂)?`
          : `Vyřeš kvadratickou rovnici x² ${bStr} ${cStr} = 0 a zadej její VĚTŠÍ kořen.`,
        realWorldContext:
          'Kvadratické rovnice modelují šikmý vrh ve fyzice, brzdnou dráhu i optimalizaci zisku.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'easy',
        stepByStepSolution: `Rozkladem získáme (x - (${r1}))(x - (${r2})) = 0, kořeny jsou x₁ = ${r1}, x₂ = ${r2}.\n${askSum ? `Součet x₁ + x₂ = ${r1 + r2} (přímo z Viètova vzorce -b/a = ${-b}).` : `Větší z obou kořenů je ${r2}.`}`,
        hints: [
          `Použij vzorec pro diskriminant D = b² - 4ac, nebo Viètovy vzorce: x₁ + x₂ = -b a x₁ · x₂ = c.`,
          askSum
            ? `Podle Viètova vzorce je součet kořenů rovnice x² + bx + c = 0 přímo -b.`
            : `Hledej dvě čísla, jejichž součet je ${-b} a součin ${c}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'gym_exponential_eq',
    schoolTypes: ['grammar_school'],
    grades: ['grammar_school'],
    topic: 'equations',
    topicName: 'Exponenciální rovnice: Převod na stejný základ',
    curriculumRef: 'RVP G · Exponenciální rovnice',
    difficulty: 'medium',
    generate: (ctx) => {
      const base = pick([2, 3, 5]);
      const expRhs = randInt(2, 4);
      const rhsVal = Math.pow(base, expRhs);
      const k = pick([1, 2]);
      const x = randInt(1, 5);
      const m = expRhs - k * x;
      const mStr = m === 0 ? '' : m > 0 ? ` + ${m}` : ` - ${Math.abs(m)}`;
      const ans = numericAnswers(x);

      return {
        id: makeUniqueId('gym_exponential_eq'),
        archetypeId: 'gym_exponential_eq',
        curriculumRef: 'RVP G · Exponenciální rovnice',
        variantSeed: `${base}_${k}_${m}_${rhsVal}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'equations',
        topicName: 'Exponenciální rovnice: Převod na stejný základ',
        title: `Exponenciální rovnice se základem ${base}`,
        question: `Najdi kořen x exponenciální rovnice:\n${base}^(${k === 1 ? 'x' : `${k}x`}${mStr}) = ${rhsVal}`,
        realWorldContext:
          'Poločas rozpadu radioaktivních prvků, růst bakteriálních kultur i výpočet doby zdvojnásobení investice.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `x = ${x}`],
        difficulty: 'medium',
        stepByStepSolution: `Převedeme pravou stranu na mocninu o základu ${base}: ${rhsVal} = ${base}^${expRhs}.\nPorovnáme exponenty: ${k === 1 ? 'x' : `${k}x`}${mStr} = ${expRhs} => x = ${x}.`,
        hints: [
          `Vyjádři číslo ${rhsVal} jako mocninu čísla ${base}.`,
          `Jakmile mají obě strany stejný základ, stačí položit do rovnosti jejich exponenty.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'gym_parabola_vertex_max',
    schoolTypes: ['grammar_school', 'business_lyceum'],
    grades: ['grammar_school', 'lyceum_2'],
    topic: 'functions',
    topicName: 'Kvadratická funkce: Vrchol paraboly a maximum',
    curriculumRef: 'RVP SŠ · Optimalizace kvadratickou funkcí',
    difficulty: 'medium',
    generate: (ctx) => {
      const a = pick([1, 2, 3]);
      const xPeak = randInt(3, 12);
      const yPeak = randInt(20, 90);
      // f(x) = -a(x - xPeak)^2 + yPeak = -ax^2 + 2a*xPeak*x + (yPeak - a*xPeak^2)
      const b = 2 * a * xPeak;
      const c = yPeak - a * xPeak * xPeak;
      const cStr = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
      const ans = numericAnswers(yPeak);

      return {
        id: makeUniqueId('gym_parabola_vertex_max'),
        archetypeId: 'gym_parabola_vertex_max',
        curriculumRef: 'RVP SŠ · Optimalizace kvadratickou funkcí',
        variantSeed: `${a}_${xPeak}_${yPeak}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'functions',
        topicName: 'Kvadratická funkce: Vrchol paraboly a maximum',
        title: `Maximální hodnota funkce f(x) = -${a === 1 ? '' : a}x² + ${b}x ${cStr}`,
        question: `Zisková (nebo výšková) funkce je dána předpisem f(x) = -${a === 1 ? '' : a}x² + ${b}x ${cStr}. Jakou MAXIMÁLNÍ hodnotu tato funkce nabývá?`,
        realWorldContext:
          'Určování nejvyššího bodu letu projektilu nebo optimální ceny maximalizující zisk podniku.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `Vrchol paraboly leží v bodě x_v = -b / (2a) = -${b} / (-${2 * a}) = ${xPeak}.\nDosazením x = ${xPeak}: f(${xPeak}) = -${a}·${xPeak}² + ${b}·${xPeak} ${cStr} = ${yPeak}.`,
        hints: [
          `Maximum paraboly otevřené dolů leží v jejím vrcholu pro x_v = -b / (2a).`,
          `Nejprve najdi x_v a poté tuto hodnotu dosaď zpět do předpisu funkce f(x).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'gym_vectors_dot_distance',
    schoolTypes: ['grammar_school', 'vocational_sos'],
    grades: ['grammar_school'],
    topic: 'geometry',
    topicName: 'Analytická geometrie: Vzdálenost bodů a skalární součin',
    curriculumRef: 'RVP G · Analytická geometrie v rovině',
    difficulty: 'medium',
    generate: (ctx) => {
      // Pythagorean triple distance between points A and B
      const k = randInt(1, 3);
      const dx = 3 * k;
      const dy = 4 * k;
      const dist = 5 * k;
      const ax = randInt(-3, 5);
      const ay = randInt(-3, 5);
      const bx = ax + dx;
      const by = ay + dy;
      const ans = numericAnswers(dist);

      return {
        id: makeUniqueId('gym_vectors_dot_distance'),
        archetypeId: 'gym_vectors_dot_distance',
        curriculumRef: 'RVP G · Analytická geometrie v rovině',
        variantSeed: `${ax}_${ay}_${bx}_${by}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'geometry',
        topicName: 'Analytická geometrie: Vzdálenost bodů a skalární součin',
        title: `Vzdálenost dvou bodů A[${ax}; ${ay}] a B[${bx}; ${by}]`,
        question: `V kartézské soustavě souřadnic jsou dány body A[${ax}; ${ay}] a B[${bx}; ${by}]. Vypočítej vzdálenost |AB|.`,
        realWorldContext:
          'GPS navigace, herní enginy (kolize objektů) a počítačová grafika.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `Vektor AB = (${bx} - (${ax}); ${by} - (${ay})) = (${dx}; ${dy}).\n|AB| = √(${dx}² + ${dy}²) = √(${dx * dx + dy * dy}) = ${dist}.`,
        hints: [
          `Použij vzorec pro vzdálenost bodů |AB| = √((x_B - x_A)² + (y_B - y_A)²).`,
          `Rozdíly souřadnic tvoří pravoúhlý trojúhelník se stranami ${dx} a ${dy}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'sos_cylinder_volume',
    schoolTypes: ['vocational_sos', 'grammar_school'],
    grades: ['grammar_school'],
    topic: 'geometry',
    topicName: 'Stereometrie SOŠ: Objem technických těles',
    curriculumRef: 'RVP SOŠ · Technická stereometrie',
    difficulty: 'easy',
    generate: (ctx) => {
      const r = randInt(1, 5);
      const h = randInt(2, 8);
      const vol = Number((3.14 * r * r * h).toFixed(2));
      const vol1 = Number(vol.toFixed(1));
      const ans = numericAnswers(vol, 'm³');

      return {
        id: makeUniqueId('sos_cylinder_volume'),
        archetypeId: 'sos_cylinder_volume',
        curriculumRef: 'RVP SOŠ · Technická stereometrie',
        variantSeed: `${r}_${h}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'geometry',
        topicName: 'Stereometrie SOŠ: Objem technických těles',
        title: `Objem válcového zásobníku (r = ${r} m, v = ${h} m)`,
        question: `Válcová nádrž ve výrobní hale má poloměr podstavy r = ${r} m a výšku v = ${h} m. Vypočítej její objem v m³ (použij π = 3,14, výsledek zadej přesně nebo zaokrouhlený na 2 desetinná místa).`,
        realWorldContext:
          'Dimenzování průmyslových nádrží, sil, potrubí a hydraulických pístů ve strojírenství.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, String(vol1), formatCz(vol1)],
        unit: 'm³',
        difficulty: 'easy',
        stepByStepSolution: `Vzorec pro objem válce: V = π · r² · v.\nV = 3,14 · ${r}² · ${h} = 3,14 · ${r * r * h} = ${formatCz(vol)} m³.`,
        hints: [
          `Obsah kruhové podstavy je S = π · r².`,
          `Vynásob 3,14 · ${r * r} · ${h}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'gym_combinatorics_committee',
    schoolTypes: ['grammar_school'],
    grades: ['grammar_school'],
    topic: 'probability',
    topicName: 'Kombinatorika: Výběr bez opakování (kombinace)',
    curriculumRef: 'RVP G · Kombinatorika',
    difficulty: 'medium',
    generate: (ctx) => {
      const n = randInt(6, 10);
      const k = pick([2, 3]);
      const comb = k === 2 ? (n * (n - 1)) / 2 : (n * (n - 1) * (n - 2)) / 6;
      const ans = numericAnswers(comb);

      return {
        id: makeUniqueId('gym_combinatorics_committee'),
        archetypeId: 'gym_combinatorics_committee',
        curriculumRef: 'RVP G · Kombinatorika',
        variantSeed: `${n}_${k}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'probability',
        topicName: 'Kombinatorika: Výběr bez opakování (kombinace)',
        title: `Sestavení ${k}členné delegace z ${n} studentů`,
        question: `Ze skupiny ${n} studentů je třeba vybrat ${k}člennou delegaci na mezinárodní soutěž (na pořadí vybraných studentů nezáleží). Kolika různými způsoby lze delegaci sestavit?`,
        realWorldContext:
          'Základ teorie pravděpodobnosti, kryptografie a návrhu turnajových rozpisů.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `Počet způsobů je kombinační číslo C(${n}; ${k}) = ${n}! / (${k}! · (${n - k})!).\nVýpočet: ${k === 2 ? `(${n} · ${n - 1}) / 2` : `(${n} · ${n - 1} · ${n - 2}) / 6`} = ${comb}.`,
        hints: [
          `Protože nezáleží na pořadí, použij kombinace: kombinační číslo (${n} nad ${k}).`,
          `V čitateli vynásob ${k} po sobě jdoucích čísel od ${n} dolů a vyděl ${k}! (${k === 2 ? 2 : 6}).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_loan_overpayment',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [1, 2],
    topic: 'finance',
    topicName: 'Finanční matematika: Spotřebitelský úvěr a přeplatek',
    curriculumRef: 'RVP OA 1.–2. ročník · Úvěry a splácení',
    difficulty: 'easy',
    generate: (ctx) => {
      const price = randInt(2, 6) * 10000;
      const downPct = pick([10, 20, 25]);
      const downPayment = (price * downPct) / 100;
      const months = pick([12, 18, 24, 36]);
      const monthly = Math.round(((price - downPayment) * 1.12) / months / 50) * 50;
      const totalPaid = downPayment + months * monthly;
      const overpayment = totalPaid - price;
      const ans = numericAnswers(overpayment, 'Kč');

      return {
        id: makeUniqueId('lyceum_loan_overpayment'),
        archetypeId: 'lyceum_loan_overpayment',
        curriculumRef: 'RVP OA 2. ročník · Úvěry a splácení',
        variantSeed: `${price}_${downPct}_${months}_${monthly}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'finance',
        topicName: 'Finanční matematika: Spotřebitelský úvěr a přeplatek',
        title: `Přeplatek na úvěru při nákupu vybavení`,
        question: `Zboží stojí v hotovosti ${price.toLocaleString('cs-CZ')} Kč. Při nákupu na splátky kupující zaplatí akontaci ${downPct} % z ceny a poté ${months} měsíčních splátek po ${monthly.toLocaleString('cs-CZ')} Kč. O kolik Kč celkem zaplatí navíc oproti hotovostní ceně (jaký je přeplatek)?`,
        realWorldContext:
          'Porovnávání reálné ceny půjček, leasingů a nákupů na splátky v osobních i firemních financích.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, overpayment.toLocaleString('cs-CZ')],
        unit: 'Kč',
        difficulty: 'easy',
        stepByStepSolution: `1. Akontace: ${price} · ${formatCz(downPct / 100)} = ${downPayment} Kč.\n2. Součet splátek: ${months} · ${monthly} = ${months * monthly} Kč.\n3. Celkem zaplaceno: ${downPayment} + ${months * monthly} = ${totalPaid} Kč.\n4. Přeplatek: ${totalPaid} - ${price} = ${overpayment} Kč.`,
        hints: [
          `Spočítej nejprve akontaci (${downPct} % z ${price}) a přičti součet všech ${months} měsíčních splátek.`,
          `Od celkové zaplacené částky odečti původní hotovostní cenu ${price} Kč.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_geometric_depreciation',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [2, 3],
    topic: 'sequences',
    topicName: 'Geometrická posloupnost: Odpisy firemního majetku',
    curriculumRef: 'RVP OA 2.–3. ročník · Geometrická posloupnost v ekonomice',
    difficulty: 'medium',
    generate: (ctx) => {
      const initial = randInt(2, 8) * 100000;
      const dropPct = pick([10, 20, 25]);
      const years = pick([2, 3]);
      const q = 1 - dropPct / 100;
      const finalVal = Math.round(initial * Math.pow(q, years));
      const ans = numericAnswers(finalVal, 'Kč');

      return {
        id: makeUniqueId('lyceum_geometric_depreciation'),
        archetypeId: 'lyceum_geometric_depreciation',
        curriculumRef: 'RVP OA 2. ročník · Geometrická posloupnost v ekonomice',
        variantSeed: `${initial}_${dropPct}_${years}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'sequences',
        topicName: 'Geometrická posloupnost: Odpisy firemního majetku',
        title: `Zůstatková hodnota stroje po ${years} letech`,
        question: `Firma pořídila firemní automobil za ${initial.toLocaleString('cs-CZ')} Kč. Každý rok klesá jeho tržní hodnota přesně o ${dropPct} % oproti hodnotě na začátku daného roku. Jaká bude hodnota vozu přesně po ${years} letech?`,
        realWorldContext:
          'Účetní odpisy, plánování obměny vozového parku a chápání exponenciálního poklesu hodnoty.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, finalVal.toLocaleString('cs-CZ')],
        unit: 'Kč',
        difficulty: 'medium',
        stepByStepSolution: `Roční koeficient zachování hodnoty q = 1 - ${formatCz(dropPct / 100)} = ${formatCz(q)}.\nPo ${years} letech: V_${years} = ${initial} · (${formatCz(q)})^${years} = ${finalVal.toLocaleString('cs-CZ')} Kč.`,
        hints: [
          `Pokles o ${dropPct} % ročně znamená, že každý rok zůstane ${100 - dropPct} % hodnoty z předchozího roku (kvocient q = ${formatCz(q)}).`,
          `Vynásob pořizovací cenu ${initial.toLocaleString('cs-CZ')} mocninou (${formatCz(q)})^${years}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_weighted_average_stats',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [2, 3, 4],
    topic: 'probability',
    topicName: 'Statistika: Vážený průměr nákupní ceny zásob',
    curriculumRef: 'RVP OA 2.–4. ročník · Popisná statistika',
    difficulty: 'medium',
    generate: (ctx) => {
      const q1 = pick([20, 30, 40]);
      const p1 = randInt(12, 22) * 10;
      const q2 = pick([10, 20, 30]);
      const step = pick([30, 60]);
      const p2 = p1 + step;
      // Ensure clean integer weighted average: adjust q1/q2 or pick multiples so (q1*p1 + q2*p2)/(q1+q2) is clean
      const totalQ = q1 + q2;
      const avgRaw = (q1 * p1 + q2 * p2) / totalQ;
      const avg = Number(avgRaw.toFixed(2));
      const ans = numericAnswers(avg, 'Kč');

      return {
        id: makeUniqueId('lyceum_weighted_average_stats'),
        archetypeId: 'lyceum_weighted_average_stats',
        curriculumRef: 'RVP OA 2. ročník · Popisná statistika',
        variantSeed: `${q1}_${p1}_${q2}_${p2}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'probability',
        topicName: 'Statistika: Vážený průměr nákupní ceny zásob',
        title: `Průměrná skladová cena při dvou dodávkách`,
        question: `Sklad přijal první dodávku ${q1} ks materiálu po ${p1} Kč/ks a druhou dodávku ${q2} ks stejného materiálu po ${p2} Kč/ks. Jaká je vážená průměrná cena za 1 ks na skladě v Kč? (Zaokrouhli případně na 2 desetinná místa)`,
        realWorldContext:
          'Metoda váženého aritmetického průměru je předepsaná v účetnictví pro oceňování zásob na skladě.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        unit: 'Kč',
        difficulty: 'medium',
        stepByStepSolution: `Celková hodnota: ${q1}·${p1} + ${q2}·${p2} = ${q1 * p1} + ${q2 * p2} = ${q1 * p1 + q2 * p2} Kč.\nCelkový počet kusů: ${q1} + ${q2} = ${totalQ} ks.\nVážený průměr = ${q1 * p1 + q2 * p2} : ${totalQ} = ${formatCz(avg)} Kč.`,
        hints: [
          `Pozor, nejde o obyčejný průměr (${p1} + ${p2}) / 2! Dodávky mají různý počet kusů.`,
          `Spočítej celkové náklady obou dodávek a vyděl je celkovým počtem kusů (${totalQ}).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_mixtures_pricing',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [1, 2],
    topic: 'equations',
    topicName: 'Obchodní směsi: Tvorba směsného produktu',
    curriculumRef: 'RVP OA 1.–2. ročník · Rovnice v obchodní praxi',
    difficulty: 'hard',
    generate: (ctx) => {
      const pCheap = pick([180, 200, 220, 240]);
      const pExp = pCheap + pick([100, 120, 150]);
      const mCheap = pick([4, 6, 8, 10]);
      const mExp = pick([2, 4, 6]);
      const totalKg = mCheap + mExp;
      const targetPrice = Math.round((mCheap * pCheap + mExp * pExp) / totalKg);
      // Recompute mCheap from clean targetPrice? Wait: ensure exact linear equation!
      // Pick mCheap, mExp and diff so (mCheap*pCheap + mExp*pExp) % totalKg === 0
      const cleanDiff = totalKg * pick([10, 15, 20]);
      const cleanExpPrice = pCheap + cleanDiff;
      const exactTarget = (mCheap * pCheap + mExp * cleanExpPrice) / totalKg;
      const ans = numericAnswers(mExp, 'kg');

      return {
        id: makeUniqueId('lyceum_mixtures_pricing'),
        archetypeId: 'lyceum_mixtures_pricing',
        curriculumRef: 'RVP OA 2. ročník · Rovnice v obchodní praxi',
        variantSeed: `${pCheap}_${cleanExpPrice}_${mCheap}_${mExp}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'equations',
        topicName: 'Obchodní směsi: Tvorba směsného produktu',
        title: `Míchání dvou druhů zrnkové kávy`,
        question: `Pražírna míchá ${mCheap} kg kávy v ceně ${pCheap} Kč/kg s dražší kávou v ceně ${cleanExpPrice} Kč/kg. Kolik kilogramů dražší kávy musí přisypat, aby vzniklá směs měla hodnotu přesně ${exactTarget} Kč/kg?`,
        realWorldContext:
          'Kalkulace složení směsí v potravinářství, chemii i finančních portfoliích.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${mExp} kilogramů`],
        unit: 'kg',
        difficulty: 'hard',
        stepByStepSolution: `Označme hmotnost dražší kávy x kg.\nRovnice hodnoty: ${mCheap}·${pCheap} + ${cleanExpPrice}·x = ${exactTarget}·(${mCheap} + x).\n${mCheap * pCheap} + ${cleanExpPrice}x = ${exactTarget * mCheap} + ${exactTarget}x\n${cleanExpPrice - exactTarget}x = ${exactTarget * mCheap - mCheap * pCheap}\nx = ${mExp} kg.`,
        hints: [
          `Označ neznámé množství dražší kávy jako x kg. Celková hmotnost směsi pak bude (${mCheap} + x) kg.`,
          `Dej do rovnosti celkovou cenu složek před smícháním (${mCheap}·${pCheap} + ${cleanExpPrice}x) a cenu výsledné směsi ${exactTarget}·(${mCheap} + x).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_profit_optimization',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [2, 3, 4],
    topic: 'functions',
    topicName: 'Kvadratická funkce: Maximalizace firemního zisku',
    curriculumRef: 'RVP OA 2.–4. ročník · Ekonomické optimum',
    difficulty: 'hard',
    generate: (ctx) => {
      // Profit Z(q) = -a*(q - qOpt)^2 + zMax => Z(q) = -a*q^2 + 2*a*qOpt*q - (a*qOpt^2 - zMax)
      const a = pick([2, 5, 10]);
      const qOpt = randInt(15, 45);
      const zMax = randInt(20, 60) * 1000;
      const b = 2 * a * qOpt;
      const fixedLoss = a * qOpt * qOpt - zMax;
      const cStr = fixedLoss >= 0 ? `- ${fixedLoss}` : `+ ${Math.abs(fixedLoss)}`;
      const ans = numericAnswers(qOpt, 'ks');

      return {
        id: makeUniqueId('lyceum_profit_optimization'),
        archetypeId: 'lyceum_profit_optimization',
        curriculumRef: 'RVP OA 2.–4. ročník · Ekonomické optimum',
        variantSeed: `${a}_${qOpt}_${zMax}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'functions',
        topicName: 'Kvadratická funkce: Maximalizace firemního zisku',
        title: `Optimální objem výroby pro nejvyšší zisk`,
        question: `Měsíční zisk podniku (v Kč) závisí na počtu vyrobených kusů q podle kvadratické funkce:\nZ(q) = -${a}q² + ${b}q ${cStr}\nPři jakém počtu vyrobených kusů q dosáhne firma MAXIMÁLNÍHO zisku?`,
        realWorldContext:
          'Mikroekonomická optimalizace produkce – vyšší objem výroby už po určité hranici zvyšuje náklady rychleji než tržby.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `q = ${qOpt}`],
        unit: 'ks',
        difficulty: 'hard',
        stepByStepSolution: `Zisková funkce je parabola otevřená dolů (koeficient u q² je záporný).\nMaximum leží v souřadnici vrcholu: q_opt = -b / (2a) = -${b} / (2 · (-${a})) = ${b} / ${2 * a} = ${qOpt} ks.`,
        hints: [
          `Zisková funkce tvoří parabolu otevřenou směrem dolů, její nejvyšší bod je vrchol paraboly.`,
          `Použij vzorec pro x-ovou souřadnici vrcholu paraboly: q_opt = -b / (2a).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_currency_exchange_bank',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [1, 2],
    topic: 'finance',
    topicName: 'Devizové operace: Nákup a prodej EUR podle kurzovního lístku',
    curriculumRef: 'RVP OA 1.–2. ročník · Měnové kurzy',
    difficulty: 'easy',
    generate: (ctx) => {
      const rateSell = pick([25.2, 25.4, 25.5, 25.6, 25.8]);
      const euros = pick([200, 300, 400, 500, 800]);
      const feePct = pick([0, 1, 2]);
      const czkBase = Math.round(euros * rateSell);
      const totalCzk = Math.round(czkBase * (1 + feePct / 100));
      const ans = numericAnswers(totalCzk, 'Kč');

      return {
        id: makeUniqueId('lyceum_currency_exchange_bank'),
        archetypeId: 'lyceum_currency_exchange_bank',
        curriculumRef: 'RVP OA 1.–2. ročník · Měnové kurzy',
        variantSeed: `${rateSell}_${euros}_${feePct}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'finance',
        topicName: 'Devizové operace: Nákup a prodej EUR podle kurzovního lístku',
        title: `Nákup ${euros} EUR pro zahraniční fakturu`,
        question: `Firma potřebuje uhradit zahraniční fakturu ve výši ${euros} EUR. Banka prodává devizy (EUR prodej) za kurz ${formatCz(rateSell)} Kč/EUR${feePct > 0 ? ` a navíc účtuje směnárenský poplatek ${feePct} % z převedené částky v Kč` : ''}. Kolik Kč celkem firma za nákup ${euros} EUR zaplatí?`,
        realWorldContext:
          'Zahraniční obchod, import/export a orientace v bankovních kurzovních lístcích (nákup vs. prodej deviz).',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, totalCzk.toLocaleString('cs-CZ')],
        unit: 'Kč',
        difficulty: 'easy',
        stepByStepSolution: `1. Základní cena v Kč: ${euros} · ${formatCz(rateSell)} = ${czkBase.toLocaleString('cs-CZ')} Kč.${feePct > 0 ? `\n2. Připočteme poplatek ${feePct} %: ${czkBase} · ${formatCz(1 + feePct / 100)} = ${totalCzk.toLocaleString('cs-CZ')} Kč.` : ''}`,
        hints: [
          `Vynásob požadovanou částku ${euros} EUR prodejním kurzem banky (${formatCz(rateSell)} Kč/EUR).`,
          feePct > 0 ? `Výslednou částku v Kč navyš ještě o poplatek ${feePct} %.` : `Zkontroluj si správné posunutí desetinné čárky při násobení.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_market_equilibrium_system',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [2, 3],
    topic: 'equations',
    topicName: 'Mikroekonomie: Rovnovážná tržní cena (nabídka a poptávka)',
    curriculumRef: 'RVP OA 2.–3. ročník · Soustavy rovnic v ekonomii',
    difficulty: 'medium',
    generate: (ctx) => {
      // Demand: Q_d = a - b*P, Supply: Q_s = c + d*P => P_eq = (a - c) / (b + d)
      const pEq = randInt(8, 25) * 10;
      const b = pick([2, 3, 4]);
      const d = pick([1, 2, 3]);
      const qEq = randInt(30, 120);
      const a = qEq + b * pEq;
      const c = qEq - d * pEq;
      const cStr = c >= 0 ? `${c} + ${d}P` : `${d}P - ${Math.abs(c)}`;
      const ans = numericAnswers(pEq, 'Kč');

      return {
        id: makeUniqueId('lyceum_market_equilibrium_system'),
        archetypeId: 'lyceum_market_equilibrium_system',
        curriculumRef: 'RVP OA 2.–3. ročník · Soustavy rovnic v ekonomii',
        variantSeed: `${a}_${b}_${c}_${d}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'equations',
        topicName: 'Mikroekonomie: Rovnovážná tržní cena (nabídka a poptávka)',
        title: `Výpočet rovnovážné ceny na trhu`,
        question: `Tržní poptávka po produktu je popsána funkcí Q_d = ${a} - ${b}P a tržní nabídka funkcí Q_s = ${cStr}, kde P je cena v Kč. Urči rovnovážnou tržní cenu P (v Kč), při které se nabídka přesně rovná poptávce.`,
        realWorldContext:
          'Stanovení rovnovážné ceny na komoditních trzích a při cenotvorbě nových produktů.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `P = ${pEq}`],
        unit: 'Kč',
        difficulty: 'medium',
        stepByStepSolution: `V bodě tržní rovnováhy platí Q_d = Q_s:\n${a} - ${b}P = ${cStr}\n${a - c} = ${b + d}P\nP = ${a - c} / ${b + d} = ${pEq} Kč.`,
        hints: [
          `Polož do rovnosti poptávku a nabídku: Q_d = Q_s.`,
          `Převeď všechny členy s P na jednu stranu rovnice a čísla na druhou stranu.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'lyceum_portfolio_combinations',
    schoolTypes: ['business_lyceum'],
    grades: ['lyceum_2'],
    gradeYears: [3, 4],
    topic: 'probability',
    topicName: 'Kombinatorika v ekonomii: Výběr investičního portfolia',
    curriculumRef: 'RVP OA 3.–4. ročník · Kombinatorika a statistika',
    difficulty: 'medium',
    generate: (ctx) => {
      const n = randInt(6, 10);
      const k = pick([2, 3]);
      const comb = k === 2 ? (n * (n - 1)) / 2 : (n * (n - 1) * (n - 2)) / 6;
      const ans = numericAnswers(comb);

      return {
        id: makeUniqueId('lyceum_portfolio_combinations'),
        archetypeId: 'lyceum_portfolio_combinations',
        curriculumRef: 'RVP OA 3.–4. ročník · Kombinatorika a statistika',
        variantSeed: `${n}_${k}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'probability',
        topicName: 'Kombinatorika v ekonomii: Výběr investičního portfolia',
        title: `Sestavení portfolia ${k} akcií z ${n} titulů`,
        question: `Investiční analytik vybírá ze ${n} prověřených akciových titulů přesně ${k} různé tituly do nového konzervativního portfolia (na pořadí výběru nezáleží). Kolika různými způsoby může toto portfolio sestavit?`,
        realWorldContext:
          'Diverzifikace investičních portfolií, výběr dodavatelů ve veřejných zakázkách a maturitní příprava na OA.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `Počet způsobů je dán kombinačním číslem C(${n}; ${k}) = ${n}! / (${k}! · (${n - k})!) = ${comb}.`,
        hints: [
          `Na pořadí titulů v portfoliu nezáleží, použij tedy kombinace bez opakování (${n} nad ${k}).`,
          `Vypočítej zlomek ${k === 2 ? `(${n} · ${n - 1}) / 2` : `(${n} · ${n - 1} · ${n - 2}) / 6`}.`,
        ],
        type: 'number',
      };
    },
  },
];
