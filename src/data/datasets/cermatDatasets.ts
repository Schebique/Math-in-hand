import {
  ProblemArchetype,
  randInt,
  randNonZeroInt,
  pick,
  gcd,
  lcm,
  simplifyFraction,
  makeUniqueId,
  numericAnswers,
  formatCz,
} from './types';
import { CZECH_ROUTES, SHARED_WORK_SCENARIOS, ESHOP_PRODUCTS } from './czechContexts';

export const CERMAT_ARCHETYPES: ProblemArchetype[] = [
  {
    id: 'cermat_linear_eq_fractions',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'equations',
    topicName: 'CERMAT Rovnice: Lineární rovnice se zlomky',
    curriculumRef: 'CERMAT JPZ · Úloha 5 · Lineární rovnice',
    difficulty: 'medium',
    generate: (ctx) => {
      // Construct (a*x + b)/d1 - (c*x + e)/d2 = rhs with guaranteed integer solution x
      const d1 = pick([2, 3, 4, 5, 6]);
      const d2 = pick([2, 3, 4, 5, 6].filter((d) => d !== d1));
      const x = randNonZeroInt(-5, 7);
      const a = randInt(2, 5);
      const c = randInt(1, 3);
      // Ensure (a*x + b) divisible by d1 and (c*x + e) divisible by d2 so rhs is integer
      const k1 = randInt(-3, 5);
      const k2 = randInt(-3, 4);
      const b = k1 * d1 - a * x;
      const e = k2 * d2 - c * x;
      const rhs = k1 - k2;
      // Avoid degenerate case where a/d1 === c/d2
      const common = lcm(d1, d2);
      if (a * (common / d1) === c * (common / d2)) {
        // Fallback deterministic safe parameters
        const safeAns = numericAnswers(3);
        return {
          id: makeUniqueId('cermat_linear_eq_fractions'),
          archetypeId: 'cermat_linear_eq_fractions',
          curriculumRef: 'CERMAT JPZ · Úloha 5 · Lineární rovnice',
          variantSeed: `fallback_3`,
          grade: ctx.grade,
          schoolType: ctx.schoolType,
          topic: 'equations',
          topicName: 'CERMAT Rovnice: Lineární rovnice se zlomky',
          title: 'Kořen lineární rovnice se zlomky',
          question: 'Najdi kořen x rovnice:\n(2x + 3) / 3 - (x - 1) / 2 = 2',
          realWorldContext:
            'Úloha na ekvivalentní úpravy a společného jmenovatele patří mezi nejdůležitější bodované části testů CERMAT.',
          correctAnswer: safeAns.correctAnswer,
          acceptableAnswers: [...safeAns.acceptableAnswers, 'x = 3', 'x=3'],
          difficulty: 'medium',
          stepByStepSolution:
            '1. Vynásobíme rovnici společným jmenovatelem 6:\n2·(2x + 3) - 3·(x - 1) = 12\n2. 4x + 6 - 3x + 3 = 12\n3. x + 9 = 12 => x = 3.',
          hints: [
            'Vynásob celou rovnici společným jmenovatelem 6.',
            'Dej si pozor na znaménko minus před druhým zlomkem.',
          ],
          type: 'number',
        };
      }

      const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const eStr = e >= 0 ? `+ ${e}` : `- ${Math.abs(e)}`;
      const m1 = common / d1;
      const m2 = common / d2;
      const ans = numericAnswers(x);

      return {
        id: makeUniqueId('cermat_linear_eq_fractions'),
        archetypeId: 'cermat_linear_eq_fractions',
        curriculumRef: 'CERMAT JPZ · Úloha 5 · Lineární rovnice',
        variantSeed: `${a}_${b}_${d1}_${c}_${e}_${d2}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'equations',
        topicName: 'CERMAT Rovnice: Lineární rovnice se zlomky',
        title: `Kořen rovnice se společným jmenovatelem ${common}`,
        question: `Vyřeš rovnici v oboru reálných čísel:\n(${a}x ${bStr}) / ${d1} - (${c}x ${eStr}) / ${d2} = ${rhs}\nZadej kořen x.`,
        realWorldContext:
          'Standardní a pravidelně bodovaná otevřená úloha v jednotných přijímacích zkouškách CERMAT na gymnázia a SŠ.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `x = ${x}`, `x=${x}`],
        difficulty: 'medium',
        stepByStepSolution: `1. Vynásobíme celou rovnici společným jmenovatelem ${common}:\n${m1}·(${a}x ${bStr}) - ${m2}·(${c}x ${eStr}) = ${rhs * common}\n2. Roznásobíme závorky (pozor na minus před druhou závorkou!):\n${m1 * a}x ${m1 * b >= 0 ? `+ ${m1 * b}` : `- ${Math.abs(m1 * b)}`} - ${m2 * c}x ${-m2 * e >= 0 ? `+ ${-m2 * e}` : `- ${Math.abs(m2 * e)}`} = ${rhs * common}\n3. Zjednodušíme: ${m1 * a - m2 * c}x = ${rhs * common - m1 * b + m2 * e}\n4. x = ${x}.`,
        hints: [
          `Najdi společný jmenovatel čísel ${d1} a ${d2}, což je ${common}, a vynásob jím oba zlomky i pravou stranu (${rhs}).`,
          `Při roznásobení druhého čitatele nezapomeň, že minus před zlomkem mění znaménka obou členů v závorce!`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_algebraic_identity',
    schoolTypes: ['cermat_prep', 'grammar_school'],
    grades: ['grade_9', 'grammar_school'],
    topic: 'equations',
    topicName: 'CERMAT Výrazy: Vzorce (a±b)² a a² - b²',
    curriculumRef: 'CERMAT JPZ · Úloha 4 · Algebraické výrazy',
    difficulty: 'medium',
    generate: (ctx) => {
      // Expression: (x + p)^2 - (x - q)*(x + q) evaluated at x = val
      const p = randInt(2, 7);
      const q = randInt(1, 6);
      const xVal = randInt(2, 8);
      // (x+p)^2 - (x^2 - q^2) = x^2 + 2px + p^2 - x^2 + q^2 = 2px + p^2 + q^2
      const result = 2 * p * xVal + p * p + q * q;
      const ans = numericAnswers(result);

      return {
        id: makeUniqueId('cermat_algebraic_identity'),
        archetypeId: 'cermat_algebraic_identity',
        curriculumRef: 'CERMAT JPZ · Úloha 4 · Algebraické výrazy',
        variantSeed: `${p}_${q}_${xVal}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'equations',
        topicName: 'CERMAT Výrazy: Vzorce (a±b)² a a² - b²',
        title: `Zjednodušení a hodnota výrazu se vzorci`,
        question: `Zjednoduš algebraický výraz:\n(x + ${p})² - (x - ${q})·(x + ${q})\na poté vypočítej jeho číselnou hodnotu pro x = ${xVal}.`,
        realWorldContext:
          'Algebraické identity umožňují bleskově zjednodušit výpočty v informatice, fyzice i při testování CERMAT.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `1. Rozepíšeme (x + ${p})² = x² + ${2 * p}x + ${p * p}.\n2. Rozepíšeme (x - ${q})(x + ${q}) = x² - ${q * q}.\n3. Odečteme: (x² + ${2 * p}x + ${p * p}) - (x² - ${q * q}) = ${2 * p}x + ${p * p + q * q}.\n4. Dosadíme x = ${xVal}: ${2 * p}·${xVal} + ${p * p + q * q} = ${result}.`,
        hints: [
          `Použij vzorce (a + b)² = a² + 2ab + b² a (a - b)(a + b) = a² - b².`,
          `Členy x² se po odečtení vyruší! Zůstane ti jednoduchý lineární výraz, do kterého dosadíš x = ${xVal}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_motion_opposite',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'word_problems',
    topicName: 'CERMAT Slovní úlohy: Pohyb proti sobě',
    curriculumRef: 'CERMAT JPZ · Úloha 8 · Pohyb',
    difficulty: 'medium',
    generate: (ctx) => {
      const route = pick(CZECH_ROUTES);
      const speedPairs = [
        [75, 45],
        [80, 40],
        [90, 60],
        [70, 50],
        [65, 55],
        [85, 35],
      ];
      const [v1, v2] = pick(speedPairs);
      const vSum = v1 + v2; // 120 or 150
      // Pick meeting time in minutes divisible nicely: 30, 36, 45, 48, 60, 72, 90 min
      const hoursOptions = [0.5, 0.75, 0.8, 1.2, 1.5, 1.6, 2];
      const tHours = pick(hoursOptions);
      const dist = Math.round(vSum * tHours);
      const tMinutes = Math.round(tHours * 60);
      const hPart = Math.floor(tMinutes / 60);
      const mPart = tMinutes % 60;
      const ans = numericAnswers(tMinutes, 'min');

      return {
        id: makeUniqueId('cermat_motion_opposite'),
        archetypeId: 'cermat_motion_opposite',
        curriculumRef: 'CERMAT JPZ · Úloha 8 · Pohyb',
        variantSeed: `${route.from}_${route.to}_${v1}_${v2}_${dist}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'word_problems',
        topicName: 'CERMAT Slovní úlohy: Pohyb proti sobě',
        title: `Setkání vozidel na trase ${route.from} – ${route.to}`,
        question: `Města jsou od sebe vzdálena ${dist} km. Z místa A vyjede osobní auto rychlostí ${v1} km/h. Ve stejný okamžik vyjede proti němu z místa B dodávka rychlostí ${v2} km/h. Za kolik MINUT se obě vozidla potkají?`,
        realWorldContext:
          'Dopravní logistika a typová CERMAT slovní úloha na vztah dráhy, rychlosti a času (s = v · t).',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [
          ...ans.acceptableAnswers,
          `${tMinutes} minut`,
          `${formatCz(tHours)} h`,
          hPart > 0 ? `${hPart} h ${mPart} min` : `${mPart} min`,
        ],
        unit: 'min',
        difficulty: 'medium',
        stepByStepSolution: `1. Vzájemná rychlost přibližování: v = ${v1} + ${v2} = ${vSum} km/h.\n2. Čas v hodinách: t = s / v = ${dist} / ${vSum} = ${formatCz(tHours)} h.\n3. Převod na minuty: ${formatCz(tHours)} · 60 = ${tMinutes} minut.`,
        hints: [
          `Když jedou vozidla proti sobě, jejich rychlosti se sčítají: ${v1} + ${v2} = ${vSum} km/h.`,
          `Vyděl vzdálenost ${dist} km součtovou rychlostí ${vSum} km/h a výsledek převeď na minuty (krát 60).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_motion_catchup',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'word_problems',
    topicName: 'CERMAT Slovní úlohy: Dohonění pomalejšího',
    curriculumRef: 'CERMAT JPZ · Slovní úloha · Pohyb s náskokem',
    difficulty: 'hard',
    generate: (ctx) => {
      const vSlow = pick([15, 20, 24, 30, 40]);
      const diffV = pick([10, 15, 20, 30]);
      const vFast = vSlow + diffV;
      const headStartHours = pick([0.5, 1, 1.5, 2]);
      const headStartKm = vSlow * headStartHours;
      // Time for fast to catch up: tFast = headStartKm / diffV
      const tFast = headStartKm / diffV;
      const tFastMin = Math.round(tFast * 60);
      const ans = numericAnswers(tFastMin, 'min');

      return {
        id: makeUniqueId('cermat_motion_catchup'),
        archetypeId: 'cermat_motion_catchup',
        curriculumRef: 'CERMAT JPZ · Slovní úloha · Pohyb s náskokem',
        variantSeed: `${vSlow}_${vFast}_${headStartHours}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'word_problems',
        topicName: 'CERMAT Slovní úlohy: Dohonění pomalejšího',
        title: 'Dohonění cyklisty po opožděném startu',
        question: `Cyklista vyjel na trasu rychlostí ${vSlow} km/h. O ${formatCz(headStartHours)} hod. později za ním po stejné trase vyrazil druhý jezdec rychlostí ${vFast} km/h. Za kolik MINUT od svého startu druhý jezdec prvního dohoní?`,
        realWorldContext:
          'Klasická CERMAT úloha na vyrovnání náskoku pomocí rozdílové rychlosti (využívaná i v letectví a železničním dispečinku).',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${tFastMin} minut`],
        unit: 'min',
        difficulty: 'hard',
        stepByStepSolution: `1. Náskok prvního cyklisty při startu druhého: s₀ = ${vSlow} · ${formatCz(headStartHours)} = ${headStartKm} km.\n2. Rychlost přibližování (rozdíl rychlostí): Δv = ${vFast} - ${vSlow} = ${diffV} km/h.\n3. Čas do dohonění: t = ${headStartKm} / ${diffV} = ${formatCz(tFast)} h = ${tFastMin} minut.`,
        hints: [
          `Spočítej, jak velký náskok v km má první cyklista v momentě, kdy vyjíždí druhý.`,
          `Druhý jezdec náskok stahuje rychlostí (${vFast} - ${vSlow}) = ${diffV} km/h. Vyděl náskok tímto rozdílem.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_shared_work',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'word_problems',
    topicName: 'CERMAT Slovní úlohy: Společná práce',
    curriculumRef: 'CERMAT JPZ · Úloha 10 · Společná práce',
    difficulty: 'hard',
    generate: (ctx) => {
      const scenario = pick(SHARED_WORK_SCENARIOS);
      // Choose t1, t2 such that (t1 * t2) / (t1 + t2) is an integer!
      const validPairs = [
        [3, 6, 2],
        [4, 12, 3],
        [6, 12, 4],
        [10, 15, 6],
        [12, 24, 8],
        [15, 30, 10],
        [20, 30, 12],
        [12, 36, 9],
      ];
      const [t1, t2, tTogether] = pick(validPairs);
      const ans = numericAnswers(tTogether, 'h');

      return {
        id: makeUniqueId('cermat_shared_work'),
        archetypeId: 'cermat_shared_work',
        curriculumRef: 'CERMAT JPZ · Úloha 10 · Společná práce',
        variantSeed: `${scenario.task}_${t1}_${t2}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'word_problems',
        topicName: 'CERMAT Slovní úlohy: Společná práce',
        title: `Společný výkon: ${scenario.task}`,
        question: `Samostatně zvládne ${scenario.actor1} ${scenario.task} za ${t1} hodin a ${scenario.actor2} za ${t2} hodin. Za kolik hodin ${scenario.verbDone}, pokud budou pracovat oba současně?`,
        realWorldContext:
          'Rozvrhování kapacit ve výrobě, napouštění nádrží i paralelní zpracování dat.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${tTogether} hodin`],
        unit: 'h',
        difficulty: 'hard',
        stepByStepSolution: `Za 1 hodinu udělá ${scenario.actor1} 1/${t1} práce a ${scenario.actor2} 1/${t2} práce.\nSpolečná rovnice: x · (1/${t1} + 1/${t2}) = 1.\nSpolečný jmenovatel dává x = (${t1}·${t2}) / (${t1}+${t2}) = ${t1 * t2} / ${t1 + t2} = ${tTogether} h.`,
        hints: [
          `Vyjádři si, jakou část celé práce vykoná každý z nich za JEDNU hodinu (1/${t1} a 1/${t2}).`,
          `Sečti zlomky 1/${t1} + 1/${t2} a zjisti, kolikrát se výsledek vejde do celku (1).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_double_percentage',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'fractions_percentages',
    topicName: 'CERMAT Procenta: Opakovaná změna ceny ("chyták")',
    curriculumRef: 'CERMAT JPZ · Úloha 2 · Postupná procenta',
    difficulty: 'medium',
    generate: (ctx) => {
      const product = pick(ESHOP_PRODUCTS);
      const origPrice = pick([1000, 1200, 1500, 2000, 2500, 3000, 4000]);
      const p1 = pick([10, 20, 25, 30]);
      const p2 = pick([10, 20, 25]);
      const afterInc = origPrice * (1 + p1 / 100);
      const finalPrice = Math.round(afterInc * (1 - p2 / 100));
      const ans = numericAnswers(finalPrice, 'Kč');

      return {
        id: makeUniqueId('cermat_double_percentage'),
        archetypeId: 'cermat_double_percentage',
        curriculumRef: 'CERMAT JPZ · Úloha 2 · Postupná procenta',
        variantSeed: `${product.item}_${origPrice}_${p1}_${p2}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'fractions_percentages',
        topicName: 'CERMAT Procenta: Opakovaná změna ceny ("chyták")',
        title: `Zdražení o ${p1} % a následná sleva o ${p2} %`,
        question: `Zboží (${product.item}) stálo původně ${origPrice} Kč. Nejprve bylo zdraženo o ${p1} % a o měsíc později bylo z nové ceny zlevněno o ${p2} %. Kolik Kč nyní zboží stojí?`,
        realWorldContext:
          'Nejčastější CERMAT chyták! Procenta se při druhé změně nepočítají z původní ceny, ale z již změněného základu.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        unit: 'Kč',
        difficulty: 'medium',
        stepByStepSolution: `1. Po zdražení o ${p1} %: ${origPrice} · ${formatCz(1 + p1 / 100)} = ${afterInc} Kč.\n2. Zleva ${p2} % se počítá z ${afterInc} Kč: ${afterInc} · ${formatCz(1 - p2 / 100)} = ${finalPrice} Kč.`,
        hints: [
          `Pozor: i když jsou procenta stejná (např. +20 % a -20 %), výsledek NENÍ původní cena!`,
          `Nejprve vypočítej cenu po zdražení o ${p1} % a teprve z této nové ceny odečti ${p2} %.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_pythagoras_isosceles',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'geometry',
    topicName: 'CERMAT Geometrie: Pythagorova věta a obsah',
    curriculumRef: 'CERMAT JPZ · Úloha 12 · Planimetrie',
    difficulty: 'medium',
    generate: (ctx) => {
      // Isosceles triangle from Pythagorean triples: half-base = 3k or 4k, height = 4k or 3k, leg = 5k
      const k = randInt(1, 5);
      const halfBase = 3 * k;
      const height = 4 * k;
      const leg = 5 * k;
      const base = 2 * halfBase;
      const area = (base * height) / 2;
      const ans = numericAnswers(area, 'cm²');

      return {
        id: makeUniqueId('cermat_pythagoras_isosceles'),
        archetypeId: 'cermat_pythagoras_isosceles',
        curriculumRef: 'CERMAT JPZ · Úloha 12 · Planimetrie',
        variantSeed: `${base}_${leg}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'geometry',
        topicName: 'CERMAT Geometrie: Pythagorova věta a obsah',
        title: `Obsah rovnoramenného trojúhelníku`,
        question: `Rovnoramenný trojúhelník má základnu délky a = ${base} cm a obě ramena délky b = ${leg} cm. Vypočítej obsah tohoto trojúhelníku v cm².`,
        realWorldContext:
          'Výpočet plochy štítu střechy, stanové plachty nebo architektonického prvku z délek jeho hran.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${area} cm2`],
        unit: 'cm²',
        difficulty: 'medium',
        stepByStepSolution: `1. Výška va rozdělí základnu na dvě poloviny po ${halfBase} cm.\n2. Z Pythagorovy věty: va² = ${leg}² - ${halfBase}² = ${leg * leg} - ${halfBase * halfBase} = ${height * height} => va = ${height} cm.\n3. Obsah S = (a · va) / 2 = (${base} · ${height}) / 2 = ${area} cm².`,
        hints: [
          `Spusť výšku k základně – rozdělí rovnoramenný trojúhelník na dva shodné pravoúhlé trojúhelníky s jednou odvěsnou ${halfBase} cm.`,
          `Pomocí Pythagorovy věty najdi výšku va a pak spočítej S = (a · va) / 2.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_solid_liters',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'geometry',
    topicName: 'CERMAT Stereometrie: Objem tělesa a litry',
    curriculumRef: 'CERMAT JPZ · Úloha 14 · Tělesa a objem',
    difficulty: 'medium',
    generate: (ctx) => {
      const lengthDm = randInt(5, 12);
      const widthDm = randInt(3, 6);
      const heightDm = randInt(4, 7);
      const fillPct = pick([50, 75, 80]);
      const totalLiters = lengthDm * widthDm * heightDm;
      const actualLiters = (totalLiters * fillPct) / 100;
      const ans = numericAnswers(actualLiters, 'l');

      return {
        id: makeUniqueId('cermat_solid_liters'),
        archetypeId: 'cermat_solid_liters',
        curriculumRef: 'CERMAT JPZ · Úloha 14 · Tělesa a objem',
        variantSeed: `${lengthDm}_${widthDm}_${heightDm}_${fillPct}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'geometry',
        topicName: 'CERMAT Stereometrie: Objem tělesa a litry',
        title: `Objem vody v akváriu (převod na litry)`,
        question: `Akvárium tvaru kvádru má vnitřní rozměry ${lengthDm * 10} cm × ${widthDm * 10} cm a výšku ${heightDm * 10} cm. Je naplněno vodou přesně ze ${fillPct} % své výšky. Kolik litrů vody je v akváriu?`,
        realWorldContext:
          'CERMAT velmi často testuje klíčový převod 1 dm³ = 1 litr a práci s rozměry zadanými v centimetrech.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${actualLiters} litrů`],
        unit: 'l',
        difficulty: 'medium',
        stepByStepSolution: `1. Převedeme rozměry na decimetry (1 dm = 10 cm): ${lengthDm} dm, ${widthDm} dm, ${heightDm} dm.\n2. Plný objem kvádru: V = ${lengthDm} · ${widthDm} · ${heightDm} = ${totalLiters} dm³ = ${totalLiters} l.\n3. ${fillPct} % z objemu: ${totalLiters} · ${formatCz(fillPct / 100)} = ${actualLiters} litrů.`,
        hints: [
          `Převeď si nejprve všechny rozměry z centimetrů na decimetry, protože 1 dm³ = 1 litr!`,
          `Vypočítej plný objem kvádru V = a · b · c a pak vezmi ${fillPct} % z výsledku.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_ratio_three_parts',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'fractions_percentages',
    topicName: 'CERMAT Poměry: Rozdělení celku v poměru a : b : c',
    curriculumRef: 'CERMAT JPZ · Poměr tří částí',
    difficulty: 'easy',
    generate: (ctx) => {
      const r1 = randInt(2, 4);
      const r2 = randInt(3, 5);
      const r3 = randInt(5, 8);
      const sumParts = r1 + r2 + r3;
      const onePart = randInt(4, 15) * 100;
      const total = sumParts * onePart;
      const largest = Math.max(r1, r2, r3) * onePart;
      const ans = numericAnswers(largest, 'Kč');

      return {
        id: makeUniqueId('cermat_ratio_three_parts'),
        archetypeId: 'cermat_ratio_three_parts',
        curriculumRef: 'CERMAT JPZ · Poměr tří částí',
        variantSeed: `${r1}_${r2}_${r3}_${onePart}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'fractions_percentages',
        topicName: 'CERMAT Poměry: Rozdělení celku v poměru a : b : c',
        title: `Rozdělení odměny v poměru ${r1} : ${r2} : ${r3}`,
        question: `Tři sourozenci si rozdělují finanční výhru ${total.toLocaleString('cs-CZ')} Kč v poměru ${r1} : ${r2} : ${r3}. Kolik Kč dostane sourozenec s nejvyšším podílem?`,
        realWorldContext:
          'Rozdělování zisku společníků firmy, míchání stavebních směsí i rozpočtování v projektech.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        unit: 'Kč',
        difficulty: 'easy',
        stepByStepSolution: `1. Celkový počet dílů: ${r1} + ${r2} + ${r3} = ${sumParts}.\n2. Hodnota 1 dílu: ${total} : ${sumParts} = ${onePart} Kč.\n3. Největší podíl (${Math.max(r1, r2, r3)} dílů): ${Math.max(r1, r2, r3)} · ${onePart} = ${largest} Kč.`,
        hints: [
          `Sečti všechna čísla v poměru (${r1} + ${r2} + ${r3}), abys zjistil celkový počet stejných dílů.`,
          `Celkovou částku vyděl počtem dílů a výsledek vynásob největším číslem poměru.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_pattern_sequence',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'sequences',
    topicName: 'CERMAT Nestandardní úlohy: Číselné a obrazcové řady',
    curriculumRef: 'CERMAT JPZ · Úloha 15 · Závislosti a řady',
    difficulty: 'medium',
    generate: (ctx) => {
      // Matchstick / tile pattern: step 1 has base + step, each next adds diff
      const first = pick([4, 5, 6, 7]);
      const diff = pick([3, 4, 5]);
      const targetN = randInt(12, 25);
      const valN = first + (targetN - 1) * diff;
      const ans = numericAnswers(valN);

      return {
        id: makeUniqueId('cermat_pattern_sequence'),
        archetypeId: 'cermat_pattern_sequence',
        curriculumRef: 'CERMAT JPZ · Úloha 15 · Závislosti a řady',
        variantSeed: `${first}_${diff}_${targetN}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'sequences',
        topicName: 'CERMAT Nestandardní úlohy: Číselné a obrazcové řady',
        title: `Stavba obrazců ze zápalek (${targetN}. obrázek)`,
        question: `Žák skládá řadu obrazců z dřívek podle pravidla:\n• 1. obrazec má ${first} dřívek\n• 2. obrazec má ${first + diff} dřívek\n• 3. obrazec má ${first + 2 * diff} dřívek\nKolik dřívek bude potřebovat na sestavení ${targetN}. obrazce?`,
        realWorldContext:
          'Rozpoznávání vzorů (pattern recognition) je základním kamenem matematického myšlení i algoritmizace v IT.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${valN} dřívek`],
        unit: 'dřívek',
        difficulty: 'medium',
        stepByStepSolution: `Každý další obrazec přidá vždy ${diff} dřívka.\nObecný předpis pro n-tý obrazec: a_n = ${first} + (n - 1) · ${diff}.\nPro n = ${targetN}: a_${targetN} = ${first} + ${targetN - 1} · ${diff} = ${first} + ${(targetN - 1) * diff} = ${valN}.`,
        hints: [
          `Všimni si, o kolik dřívek narůstá každý další krok (${diff}).`,
          `K počátečním ${first} dřívkům přičteš (${targetN} - 1)-krát přírůstek ${diff}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_system_word_tickets',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'equations',
    topicName: 'CERMAT Soustava rovnic: Slovní úloha o vstupenkách',
    curriculumRef: 'CERMAT JPZ · Soustava rovnic ze zadání',
    difficulty: 'hard',
    generate: (ctx) => {
      const priceAdult = pick([120, 150, 180, 200]);
      const priceChild = pick([60, 80, 90, 100]);
      const nAdult = randInt(8, 20);
      const nChild = randInt(10, 25);
      const totalPeople = nAdult + nChild;
      const totalMoney = nAdult * priceAdult + nChild * priceChild;
      const ans = numericAnswers(nAdult);

      return {
        id: makeUniqueId('cermat_system_word_tickets'),
        archetypeId: 'cermat_system_word_tickets',
        curriculumRef: 'CERMAT JPZ · Soustava rovnic ze zadání',
        variantSeed: `${priceAdult}_${priceChild}_${nAdult}_${nChild}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'equations',
        topicName: 'CERMAT Soustava rovnic: Slovní úloha o vstupenkách',
        title: `Vstupenky do muzea: Dospělí a děti`,
        question: `Skupina ${totalPeople} návštěvníků zaplatila za vstupenky do muzea dohromady ${totalMoney.toLocaleString('cs-CZ')} Kč. Vstupenka pro dospělého stojí ${priceAdult} Kč a dětská vstupenka ${priceChild} Kč. Kolik dospělých bylo ve skupině?`,
        realWorldContext:
          'Modelování reálných situací pomocí soustavy dvou rovnic o dvou neznámých.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${nAdult} dospělých`],
        unit: 'dospělých',
        difficulty: 'hard',
        stepByStepSolution: `Označme počet dospělých x a dětí y.\n1) x + y = ${totalPeople} => y = ${totalPeople} - x\n2) ${priceAdult}x + ${priceChild}y = ${totalMoney}\nDosadíme: ${priceAdult}x + ${priceChild}(${totalPeople} - x) = ${totalMoney}\n${priceAdult - priceChild}x = ${totalMoney - priceChild * totalPeople}\nx = ${nAdult} dospělých.`,
        hints: [
          `Označ si počet dospělých jako x. Počet dětí pak můžeš vyjádřit jako (${totalPeople} - x).`,
          `Sestav rovnici pro celkovou tržbu: ${priceAdult}·x + ${priceChild}·(${totalPeople} - x) = ${totalMoney}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_probability_marbles',
    schoolTypes: ['cermat_prep', 'primary_school'],
    grades: ['grade_9', 'primary_mid'],
    topic: 'probability',
    topicName: 'CERMAT Pravděpodobnost a kombinatorika',
    curriculumRef: 'CERMAT JPZ · Pravděpodobnost v procentech',
    difficulty: 'easy',
    generate: (ctx) => {
      const totalPool = pick([20, 25, 40, 50]);
      const red = randInt(4, Math.floor(totalPool * 0.6));
      const pct = (red / totalPool) * 100;
      const ans = numericAnswers(pct, '%');

      return {
        id: makeUniqueId('cermat_probability_marbles'),
        archetypeId: 'cermat_probability_marbles',
        curriculumRef: 'CERMAT JPZ · Pravděpodobnost v procentech',
        variantSeed: `${totalPool}_${red}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'probability',
        topicName: 'CERMAT Pravděpodobnost a kombinatorika',
        title: `Pravděpodobnost vytažení výherního losu`,
        question: `V osudí je celkem ${totalPool} losů, z toho je přesně ${red} výherních a ostatní jsou nevýherní. Jaká je pravděpodobnost v PROCENTECH, že při prvním náhodném vytažení získáš výherní los?`,
        realWorldContext:
          'Statistika, hodnocení rizik a pochopení reálné šance na výhru či výskyt jevu.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${pct} %`],
        unit: '%',
        difficulty: 'easy',
        stepByStepSolution: `P = (počet příznivých možností) / (počet všech možností) = ${red} / ${totalPool} = ${formatCz(red / totalPool)} = ${pct} %.`,
        hints: [
          `Vyděl počet výherních losů (${red}) celkovým počtem všech losů (${totalPool}).`,
          `Výsledné desetinné číslo nebo zlomek převeď na procenta (vynásob 100).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_semicircle_square_pi',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'geometry',
    topicName: 'CERMAT Geometrie: Obrazce složené z kruhu a čtverce',
    curriculumRef: 'CERMAT JPZ · Složené obrazce s π',
    difficulty: 'hard',
    generate: (ctx) => {
      const r = pick([2, 4, 6, 8, 10]);
      const side = 2 * r;
      const squareArea = side * side;
      // Two semicircles on opposite sides of square = 1 full circle with radius r
      const circleArea = Number((3.14 * r * r).toFixed(2));
      const totalArea = Number((squareArea + circleArea).toFixed(2));
      const ans = numericAnswers(totalArea, 'cm²');

      return {
        id: makeUniqueId('cermat_semicircle_square_pi'),
        archetypeId: 'cermat_semicircle_square_pi',
        curriculumRef: 'CERMAT JPZ · Složené obrazce s π',
        variantSeed: `${side}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'geometry',
        topicName: 'CERMAT Geometrie: Obrazce složené z kruhu a čtverce',
        title: `Obsah hřiště: Čtverec a dva půlkruhy`,
        question: `Plán stadionu tvoří čtverec o straně a = ${side} cm, ke kterému jsou z vnějšku ke dvěma protějším stranám připojeny dva shodné půlkruhy o průměru d = ${side} cm. Vypočítej celkový obsah obrazce v cm² (použij π = 3,14).`,
        realWorldContext:
          'Velmi častá závěrečná úloha testů CERMAT ověřující schopnost složit dva půlkruhy v jeden celý kruh.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${totalArea} cm2`],
        unit: 'cm²',
        difficulty: 'hard',
        stepByStepSolution: `1. Obsah čtverce: S₁ = ${side}² = ${squareArea} cm².\n2. Dva shodné půlkruhy o průměru ${side} cm (r = ${r} cm) tvoří dohromady 1 celý kruh: S₂ = π · r² = 3,14 · ${r}² = ${formatCz(circleArea)} cm².\n3. Celkem: ${squareArea} + ${formatCz(circleArea)} = ${formatCz(totalArea)} cm².`,
        hints: [
          `Spojením dvou shodných půlkruhů vznikne jeden celý kruh o poloměru r = ${r} cm (polovina strany čtverce).`,
          `Sečti obsah čtverce (a²) a obsah jednoho kruhu (π · r²).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_mixtures_solution',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'word_problems',
    topicName: 'CERMAT Slovní úlohy: Roztoky a procentní koncentrace',
    curriculumRef: 'CERMAT JPZ · Úloha o směsích a roztocích',
    difficulty: 'hard',
    generate: (ctx) => {
      const m1 = pick([200, 300, 400]);
      const p1 = pick([10, 15, 20]);
      const m2 = pick([100, 200, 300]);
      // Ensure (m1*p1 + m2*p2) divisible by (m1+m2)
      const totalM = m1 + m2;
      const targetPct = p1 + pick([5, 10]);
      const p2 = (targetPct * totalM - m1 * p1) / m2;
      if (p2 <= 0 || p2 > 80 || !Number.isInteger(p2)) {
        const ansSafe = numericAnswers(16, '%');
        return {
          id: makeUniqueId('cermat_mixtures_solution'),
          archetypeId: 'cermat_mixtures_solution',
          curriculumRef: 'CERMAT JPZ · Úloha o směsích a roztocích',
          variantSeed: `safe_300_200`,
          grade: ctx.grade,
          schoolType: ctx.schoolType,
          topic: 'word_problems',
          topicName: 'CERMAT Slovní úlohy: Roztoky a procentní koncentrace',
          title: `Koncentrace výsledného solného roztoku`,
          question: `Laborant smíchal 300 g 10% solného roztoku s 200 g 25% solného roztoku. Kolik procent soli obsahuje výsledný roztok?`,
          realWorldContext:
            'Příprava dezinfekcí, chemických roztoků, džusů a slitin kovů.',
          correctAnswer: ansSafe.correctAnswer,
          acceptableAnswers: ansSafe.acceptableAnswers,
          unit: '%',
          difficulty: 'hard',
          stepByStepSolution: `1. Sůl v prvním roztoku: 300 · 0,10 = 30 g.\n2. Sůl ve druhém roztoku: 200 · 0,25 = 50 g.\n3. Celkem soli: 80 g v 500 g roztoku => 80 / 500 = 0,16 = 16 %.`,
          hints: [
            `Spočítej zvlášť hmotnost čisté soli v prvním roztoku a zvlášť ve druhém roztoku.`,
            `Sečti hmotnost soli a vyděl ji celkovou hmotností směsi (500 g).`,
          ],
          type: 'number',
        };
      }

      const salt1 = (m1 * p1) / 100;
      const salt2 = (m2 * p2) / 100;
      const ans = numericAnswers(targetPct, '%');

      return {
        id: makeUniqueId('cermat_mixtures_solution'),
        archetypeId: 'cermat_mixtures_solution',
        curriculumRef: 'CERMAT JPZ · Úloha o směsích a roztocích',
        variantSeed: `${m1}_${p1}_${m2}_${p2}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'word_problems',
        topicName: 'CERMAT Slovní úlohy: Roztoky a procentní koncentrace',
        title: `Smíchání ${p1}% a ${p2}% roztoku`,
        question: `Smícháme ${m1} g ${p1}% roztoku a ${m2} g ${p2}% roztoku téže látky. Jakou koncentraci v PROCENTECH bude mít vzniklá směs?`,
        realWorldContext:
          'Typová úloha z přijímacích zkoušek CERMAT i chemických výpočtů koncentrací.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        unit: '%',
        difficulty: 'hard',
        stepByStepSolution: `1. Čistá látka v 1. roztoku: ${m1} · ${formatCz(p1 / 100)} = ${salt1} g.\n2. Čistá látka ve 2. roztoku: ${m2} · ${formatCz(p2 / 100)} = ${salt2} g.\n3. Celkem: ${salt1 + salt2} g látky ve ${totalM} g roztoku => (${salt1 + salt2} / ${totalM}) · 100 = ${targetPct} %.`,
        hints: [
          `Vypočítej, kolik gramů čisté rozpuštěné látky je v každém z obou roztoků.`,
          `Celkové množství čisté látky vyděl celkovou hmotností roztoku (${totalM} g) a převeď na procenta.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_rational_expr_eval',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'equations',
    topicName: 'CERMAT Výrazy: Zjednodušení lomeného výrazu',
    curriculumRef: 'CERMAT JPZ · Lomené výrazy',
    difficulty: 'medium',
    generate: (ctx) => {
      // (x^2 - a^2) / (x + a) + (b*x) evaluated at x = xVal (with xVal != -a)
      const a = randInt(2, 6);
      const b = randInt(2, 5);
      const xVal = randInt(3, 9);
      // Simplified = (x - a) + b*x = (b + 1)*x - a
      const result = (b + 1) * xVal - a;
      const ans = numericAnswers(result);

      return {
        id: makeUniqueId('cermat_rational_expr_eval'),
        archetypeId: 'cermat_rational_expr_eval',
        curriculumRef: 'CERMAT JPZ · Lomené výrazy',
        variantSeed: `${a}_${b}_${xVal}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'equations',
        topicName: 'CERMAT Výrazy: Zjednodušení lomeného výrazu',
        title: `Úprava lomeného výrazu a dosazení hodnoty`,
        question: `Pro x ≠ -${a} zjednoduš výraz:\n(x² - ${a * a}) / (x + ${a}) + ${b}x\na urči jeho hodnotu pro x = ${xVal}.`,
        realWorldContext:
          'Rozklad na součin a krácení lomených výrazů je pravidelně součást algebraické sekce testů CERMAT.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `1. Čitatel rozložíme podle vzorce a² - b²: x² - ${a * a} = (x - ${a})(x + ${a}).\n2. Vykrátíme (x + ${a}) a zůstane (x - ${a}) + ${b}x = ${b + 1}x - ${a}.\n3. Pro x = ${xVal}: ${b + 1}·${xVal} - ${a} = ${result}.`,
        hints: [
          `Rozlož čitatel (x² - ${a * a}) pomocí vzorce (x - ${a})·(x + ${a}).`,
          `Po vykrácení (x + ${a}) přičti ${b}x a dosaď x = ${xVal}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_solid_scaling_ratio',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'geometry',
    topicName: 'CERMAT Tělesa: Změna objemu při zvětšení hran',
    curriculumRef: 'CERMAT JPZ · Podobnost a poměr objemů',
    difficulty: 'medium',
    generate: (ctx) => {
      const k = pick([2, 3, 4]);
      const baseVol = randInt(4, 15);
      const askSurface = randInt(0, 1) === 1;
      const factor = askSurface ? k * k : k * k * k;
      const newVal = baseVol * factor;
      const unit = askSurface ? 'cm²' : 'cm³';
      const ans = numericAnswers(newVal, unit);

      return {
        id: makeUniqueId('cermat_solid_scaling_ratio'),
        archetypeId: 'cermat_solid_scaling_ratio',
        curriculumRef: 'CERMAT JPZ · Podobnost a poměr objemů',
        variantSeed: `${k}_${baseVol}_${askSurface}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'geometry',
        topicName: 'CERMAT Tělesa: Změna objemu při zvětšení hran',
        title: askSurface ? `Zvětšení povrchu tělesa ${k}krát` : `Zvětšení objemu tělesa ${k}krát`,
        question: askSurface
          ? `Malý model krychle má povrch ${baseVol} cm². Každá jeho hrana se zvětší ${k}krát. Jaký bude povrch nové zvětšené krychle v cm²?`
          : `Malý model kvádru má objem ${baseVol} cm³. Každý jeho rozměr (délka, šířka i výška) se zvětší ${k}krát. Jaký bude objem nového zvětšeného kvádru v cm³?`,
        realWorldContext:
          'Klíčový CERMAT princip: délky rostou k-krát, obsahy/povrchy k²-krát a objemy k³-krát (důležité ve stavebnictví i biologii).',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${newVal} ${askSurface ? 'cm2' : 'cm3'}`],
        unit,
        difficulty: 'medium',
        stepByStepSolution: askSurface
          ? `Při zvětšení každé hrany ${k}krát vzroste povrch k² = ${k}² = ${factor}krát.\nNový povrch = ${baseVol} · ${factor} = ${newVal} cm².`
          : `Při zvětšení všech 3 rozměrů ${k}krát vzroste objem k³ = ${k}³ = ${factor}krát.\nNový objem = ${baseVol} · ${factor} = ${newVal} cm³.`,
        hints: [
          askSurface
            ? `Pozor: povrch není jen ${k}krát větší! Zvětšily se oba rozměry každé stěny.`
            : `Pozor: objem není jen ${k}krát větší! Zvětšily se všechny tři rozměry (a · b · c).`,
          `Vynásob původní hodnotu (${baseVol}) číslem ${askSurface ? `${k}²` : `${k}³`}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_table_linear_function',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    topic: 'functions',
    topicName: 'CERMAT Závislosti: Čtení dat z tabulky hodnot',
    curriculumRef: 'CERMAT JPZ · Přímá úměrnost a tabulky',
    difficulty: 'easy',
    generate: (ctx) => {
      const fixedFee = pick([150, 200, 250, 300]);
      const hourlyRate = pick([120, 140, 160, 180, 200]);
      const targetH = randInt(5, 9);
      const result = fixedFee + hourlyRate * targetH;
      const ans = numericAnswers(result, 'Kč');

      return {
        id: makeUniqueId('cermat_table_linear_function'),
        archetypeId: 'cermat_table_linear_function',
        curriculumRef: 'CERMAT JPZ · Přímá úměrnost a tabulky',
        variantSeed: `${fixedFee}_${hourlyRate}_${targetH}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'functions',
        topicName: 'CERMAT Závislosti: Čtení dat z tabulky hodnot',
        title: `Ceník půjčovny kol z tabulky závislosti`,
        question: `Půjčovna kol účtuje pevný poplatek a sazbu za každou započatou hodinu podle tabulky:\n• 1 hodina → ${fixedFee + hourlyRate} Kč\n• 2 hodiny → ${fixedFee + 2 * hourlyRate} Kč\n• 3 hodiny → ${fixedFee + 3 * hourlyRate} Kč\nKolik Kč zaplatí zákazník za ${targetH} hodin?`,
        realWorldContext:
          'Čtení lineární závislosti z tabulek ceníků, tarifů a jízdních řádů v běžném životě i v testech CERMAT.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, result.toLocaleString('cs-CZ')],
        unit: 'Kč',
        difficulty: 'easy',
        stepByStepSolution: `1. Rozdíl mezi 2. a 1. hodinou udává hodinovou sazbu: (${fixedFee + 2 * hourlyRate}) - (${fixedFee + hourlyRate}) = ${hourlyRate} Kč/h.\n2. Základní pevný poplatek (pro 0 hodin): ${fixedFee + hourlyRate} - ${hourlyRate} = ${fixedFee} Kč.\n3. Cena za ${targetH} hodin = ${fixedFee} + ${targetH} · ${hourlyRate} = ${result} Kč.`,
        hints: [
          `Zkontroluj rozdíl cen mezi 1. a 2. hodinou – zjistíš cenu za každou další hodinu.`,
          `Odečti tuto hodinovou sazbu od ceny za 1 hodinu, tím zjistíš pevný poplatek (${fixedFee} Kč).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_fraction_chain_ops',
    schoolTypes: ['cermat_prep'],
    grades: ['grade_9'],
    gradeYears: [9],
    topic: 'fractions_percentages',
    topicName: 'CERMAT Zlomky: Výpočet složeného číselného výrazu',
    curriculumRef: 'CERMAT JPZ · Úloha 2 · Operace se zlomky',
    difficulty: 'medium',
    generate: (ctx) => {
      // ((a/b + c/d) : (e/f)) designed to simplify cleanly to an integer or .5
      const variants = [
        { a: 3, b: 4, c: 1, d: 2, e: 5, f: 8, result: 2, sumNum: 5, sumDen: 4 },
        { a: 2, b: 3, c: 5, d: 6, e: 1, f: 2, result: 3, sumNum: 3, sumDen: 2 },
        { a: 5, b: 6, c: 1, d: 3, e: 7, f: 12, result: 2, sumNum: 7, sumDen: 6 },
        { a: 4, b: 5, c: 7, d: 10, e: 3, f: 10, result: 5, sumNum: 3, sumDen: 2 },
        { a: 7, b: 8, c: 3, d: 4, e: 13, f: 16, result: 2, sumNum: 13, sumDen: 8 },
        { a: 5, b: 4, c: 1, d: 2, e: 7, f: 16, result: 4, sumNum: 7, sumDen: 4 },
      ];
      const v = pick(variants);
      const ans = numericAnswers(v.result);

      return {
        id: makeUniqueId('cermat_fraction_chain_ops'),
        archetypeId: 'cermat_fraction_chain_ops',
        curriculumRef: 'CERMAT JPZ · Úloha 2 · Operace se zlomky',
        variantSeed: `${v.a}_${v.b}_${v.c}_${v.d}_${v.e}_${v.f}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'fractions_percentages',
        topicName: 'CERMAT Zlomky: Výpočet složeného číselného výrazu',
        title: `Výpočet výrazu se zlomky bez kalkulačky`,
        question: `Vypočítej a výsledek zapiš v základním tvaru (jako celé číslo):\n(${v.a}/${v.b} + ${v.c}/${v.d}) : (${v.e}/${v.f})`,
        realWorldContext:
          'Úlohy 1 až 3 v testech CERMAT vždy ověřují jistotu při sčítání a dělení zlomků bez použití kalkulačky.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        difficulty: 'medium',
        stepByStepSolution: `1. Nejprve upravíme závorku na společného jmenovatele:\n${v.a}/${v.b} + ${v.c}/${v.d} = ${v.sumNum}/${v.sumDen}.\n2. Dělení zlomkem nahradíme násobením převráceným zlomkem:\n(${v.sumNum}/${v.sumDen}) · (${v.f}/${v.e}) = ${v.result}.`,
        hints: [
          `Začni výpočtem v závorce – převeď ${v.a}/${v.b} a ${v.c}/${v.d} na společného jmenovatele.`,
          `Dělení zlomkem ${v.e}/${v.f} převedeš na násobení převráceným zlomkem ${v.f}/${v.e}.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'cermat_indirect_proportion_workers',
    schoolTypes: ['cermat_prep', 'primary_school'],
    grades: ['grade_9', 'primary_mid'],
    gradeYears: [7, 8, 9],
    topic: 'word_problems',
    topicName: 'CERMAT Úměrnost: Nepřímá úměrnost a změna počtu strojů',
    curriculumRef: 'CERMAT JPZ · Úloha 6 · Nepřímá úměrnost',
    difficulty: 'easy',
    generate: (ctx) => {
      const scenarios = [
        { item: 'čerpadel', action: 'napustí bazén', unit: 'hodin' },
        { item: 'tiskáren', action: 'vytiskne celou zakázku', unit: 'hodin' },
        { item: 'kombajnů', action: 'sklidí pole', unit: 'hodin' },
      ];
      const sc = pick(scenarios);
      const pairs = [
        { n1: 4, t1: 12, n2: 6, t2: 8 },
        { n1: 3, t1: 10, n2: 5, t2: 6 },
        { n1: 6, t1: 8, n2: 4, t2: 12 },
        { n1: 5, t1: 12, n2: 6, t2: 10 },
        { n1: 8, t1: 9, n2: 6, t2: 12 },
        { n1: 4, t1: 15, n2: 10, t2: 6 },
      ];
      const p = pick(pairs);
      const ans = numericAnswers(p.t2, 'h');

      return {
        id: makeUniqueId('cermat_indirect_proportion_workers'),
        archetypeId: 'cermat_indirect_proportion_workers',
        curriculumRef: 'CERMAT JPZ · Úloha 6 · Nepřímá úměrnost',
        variantSeed: `${sc.item}_${p.n1}_${p.t1}_${p.n2}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'word_problems',
        topicName: 'CERMAT Úměrnost: Nepřímá úměrnost a změna počtu strojů',
        title: `Nepřímá úměrnost: ${p.n2} ${sc.item} místo ${p.n1}`,
        question: `${p.n1} stejně výkonných ${sc.item} ${sc.action} za ${p.t1} ${sc.unit}. Za kolik hodin zvládne stejnou práci ${p.n2} těchto ${sc.item}?`,
        realWorldContext:
          'Plánování lidských zdrojů a techniky – čím více strojů nasadíme, tím kratší dobu zakázka potrvá.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${p.t2} hodin`],
        unit: 'h',
        difficulty: 'easy',
        stepByStepSolution: `Jde o nepřímou úměrnost (součin počtu a času je stálý):\nCelkový objem práce = ${p.n1} · ${p.t1} = ${p.n1 * p.t1} strojových hodin.\nČas pro ${p.n2} ${sc.item}: t = ${p.n1 * p.t1} / ${p.n2} = ${p.t2} h.`,
        hints: [
          `Pozor: více ${sc.item} znamená KRATŠÍ čas (nejde o přímou, ale nepřímou úměrnost).`,
          `Vynásob původní počet ${p.n1} časem ${p.t1} a výsledek vyděl novým počtem ${p.n2}.`,
        ],
        type: 'number',
      };
    },
  },
];
