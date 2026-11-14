import {
  ProblemArchetype,
  randInt,
  pick,
  gcd,
  lcm,
  makeUniqueId,
  numericAnswers,
  formatCz,
} from './types';
import { RECIPES, TOURIST_DESTINATIONS, ESHOP_PRODUCTS } from './czechContexts';

export const PRIMARY_ARCHETYPES: ProblemArchetype[] = [
  {
    id: 'prim_recipe_ratio',
    schoolTypes: ['primary_school'],
    grades: ['primary_mid'],
    topic: 'fractions_percentages',
    topicName: 'Zlomky a poměry: Přímá úměrnost v praxi',
    curriculumRef: 'RVP ZV · Poměr a přímá úměrnost',
    difficulty: 'easy',
    generate: (ctx) => {
      const recipe = pick(RECIPES);
      const basePeople = randInt(2, 5);
      const perPerson = randInt(4, 14) * 15; // clean integer per person
      const baseAmount = basePeople * perPerson;
      const mult = randInt(2, 4);
      const targetPeople = basePeople * mult + (randInt(0, 1) === 1 ? basePeople : 0);
      const result = perPerson * targetPeople;
      const ans = numericAnswers(result, recipe.unit);

      return {
        id: makeUniqueId('prim_recipe_ratio'),
        archetypeId: 'prim_recipe_ratio',
        curriculumRef: 'RVP ZV · Poměr a přímá úměrnost',
        variantSeed: `${recipe.dish}_${basePeople}_${baseAmount}_${targetPeople}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'fractions_percentages',
        topicName: 'Zlomky a poměry: Přímá úměrnost v praxi',
        title: `Přepočet receptu na ${recipe.dish} (${targetPeople} osob)`,
        question: `Recept na ${recipe.dish} pro ${basePeople} osoby vyžaduje ${baseAmount} ${recipe.unit} ${recipe.ingredient}. Chystáš pohoštění pro ${targetPeople} osob. Kolik gramů ${recipe.ingredient} budeš potřebovat?`,
        realWorldContext:
          'Přímá úměrnost a trojčlenka patří k nejpoužívanějším výpočtům v běžném životě – od vaření přes ředění barev až po dávkování hnojiva.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        unit: recipe.unit,
        difficulty: 'easy',
        stepByStepSolution: `1. Množství na 1 osobu: ${baseAmount} : ${basePeople} = ${perPerson} g.\n2. Pro ${targetPeople} osob: ${perPerson} · ${targetPeople} = ${result} g.`,
        hints: [
          `Nejprve vypočítej spotřebu pro 1 osobu vydělením ${baseAmount} číslem ${basePeople}.`,
          `Získanou dávku na osobu pak vynásob novým počtem (${targetPeople}).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'prim_map_scale',
    schoolTypes: ['primary_school'],
    grades: ['primary_mid'],
    topic: 'word_problems',
    topicName: 'Měřítko mapy a převody jednotek délky',
    curriculumRef: 'RVP ZV · Měřítko mapy',
    difficulty: 'easy',
    generate: (ctx) => {
      const dest = pick(TOURIST_DESTINATIONS);
      const scaleK = pick([20000, 25000, 50000, 100000]);
      // Ensure clean integer or 0.5 km result
      const mapCm = scaleK === 25000 ? pick([4, 8, 12, 16]) : scaleK === 20000 ? pick([5, 10, 15, 20]) : randInt(3, 14);
      const realKm = (mapCm * scaleK) / 100000;
      const ans = numericAnswers(realKm, 'km');

      return {
        id: makeUniqueId('prim_map_scale'),
        archetypeId: 'prim_map_scale',
        curriculumRef: 'RVP ZV · Měřítko mapy',
        variantSeed: `${dest.name}_${scaleK}_${mapCm}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'word_problems',
        topicName: 'Měřítko mapy a převody jednotek délky',
        title: `Trasa k ${dest.name}`,
        question: `Na ${dest.mapUnit} v měřítku 1 : ${scaleK.toLocaleString('cs-CZ')} měří plánovaná pěší trasa k ${dest.name} přesně ${mapCm} cm. Kolik kilometrů ujdeš ve skutečnosti?`,
        realWorldContext:
          'Orientace v turistických mapách a technických výkresech staveb – převod mezi zmenšením na papíře a reálnou vzdáleností v terénu.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${formatCz(realKm)} kilometrů`],
        unit: 'km',
        difficulty: 'easy',
        stepByStepSolution: `1 cm na mapě odpovídá ${scaleK.toLocaleString('cs-CZ')} cm = ${scaleK / 100} m ve skutečnosti.\n${mapCm} cm · ${scaleK.toLocaleString('cs-CZ')} = ${(mapCm * scaleK).toLocaleString('cs-CZ')} cm = ${(mapCm * scaleK) / 100} m = ${formatCz(realKm)} km.`,
        hints: [
          `Vynásob délku na mapě (${mapCm} cm) číslem ${scaleK.toLocaleString('cs-CZ')}.`,
          `Pamatuj, že 1 km = 100 000 cm (pro převod z cm na km posuň desetinnou čárku o 5 míst doleva).`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'prim_divisibility_lcm',
    schoolTypes: ['primary_school'],
    grades: ['primary_mid'],
    topic: 'arithmetic_basic',
    topicName: 'Dělitelnost: Nejmenší společný násobek (NSN)',
    curriculumRef: 'RVP ZV · 6. třída · Dělitelnost',
    difficulty: 'medium',
    generate: (ctx) => {
      const pairs = [
        [12, 18],
        [15, 20],
        [12, 16],
        [14, 21],
        [10, 15],
        [18, 24],
        [20, 30],
        [16, 24],
      ];
      const [a, b] = pick(pairs);
      const ansVal = lcm(a, b);
      const ans = numericAnswers(ansVal, 'min');

      return {
        id: makeUniqueId('prim_divisibility_lcm'),
        archetypeId: 'prim_divisibility_lcm',
        curriculumRef: 'RVP ZV · 6. třída · Dělitelnost',
        variantSeed: `${a}_${b}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'arithmetic_basic',
        topicName: 'Dělitelnost: Nejmenší společný násobek (NSN)',
        title: `Společný odjezd autobusů ze zastávky`,
        question: `Ze zastávky u školy odjíždí linka A každých ${a} minut a linka B každých ${b} minut. V 7:00 odjely oba autobusy současně. Za kolik minut se oba spoje na zastávce opět potkají v tentýž čas?`,
        realWorldContext:
          'Jízdní řády MHD, synchronizace výrobních linek i plánování pravidelné údržby strojů využívají nejmenší společný násobek.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${ansVal} minut`],
        unit: 'min',
        difficulty: 'medium',
        stepByStepSolution: `Hledáme nejmenší společný násobek NSN(${a}; ${b}).\nNásobky ${a}: ${a}, ${2 * a}, ${3 * a}...\nNásobky ${b}: ${b}, ${2 * b}, ${3 * b}...\nNejmenší společný násobek je ${ansVal} minut.`,
        hints: [
          `Vypiš si postupně násobky většího čísla (${Math.max(a, b)}) a sleduj, které z nich je poprvé dělitelné i druhým číslem (${Math.min(a, b)}).`,
          `Nebo použij rozklad na prvočinitele a vyber nejvyšší mocniny všech prvočísel.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'prim_divisibility_gcd',
    schoolTypes: ['primary_school'],
    grades: ['primary_mid'],
    topic: 'arithmetic_basic',
    topicName: 'Dělitelnost: Největší společný dělitel (NSD)',
    curriculumRef: 'RVP ZV · 6. třída · Dělitelnost',
    difficulty: 'medium',
    generate: (ctx) => {
      const factor = pick([6, 8, 9, 12, 15]);
      const m1 = randInt(3, 7);
      let m2 = randInt(3, 8);
      while (gcd(m1, m2) !== 1 || m1 === m2) {
        m2 = randInt(3, 9);
      }
      const countA = factor * m1;
      const countB = factor * m2;
      const ans = numericAnswers(factor);

      return {
        id: makeUniqueId('prim_divisibility_gcd'),
        archetypeId: 'prim_divisibility_gcd',
        curriculumRef: 'RVP ZV · 6. třída · Dělitelnost',
        variantSeed: `${countA}_${countB}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'arithmetic_basic',
        topicName: 'Dělitelnost: Největší společný dělitel (NSD)',
        title: `Dárkové balíčky pro školní soutěž`,
        question: `Organizátoři soutěže mají ${countA} čokoládových tyčinek a ${countB} propisek. Chtějí z nich sestavit co největší počet naprosto stejných dárkových balíčků tak, aby nic nezbylo. Kolik nejvíce balíčků mohou připravit?`,
        realWorldContext:
          'Logistika, balení zásilek a spravedlivé rozdělování zásob bez přebytků.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${factor} balíčků`],
        unit: 'balíčků',
        difficulty: 'medium',
        stepByStepSolution: `Maximální počet stejných balíčků odpovídá největšímu společnému děliteli NSD(${countA}; ${countB}).\n${countA} = ${factor} · ${m1} a ${countB} = ${factor} · ${m2} (čísla ${m1} a ${m2} jsou nesoudělná).\nNSD = ${factor} balíčků (v každém bude ${m1} tyčinek a ${m2} propisek).`,
        hints: [
          `Hledáš největší číslo, kterým lze beze zbytku vydělit jak ${countA}, tak ${countB}.`,
          `Rozlož si obě čísla na prvočinitele a vynásob společné prvočinitele.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'prim_percentage_part_base',
    schoolTypes: ['primary_school'],
    grades: ['primary_mid'],
    topic: 'fractions_percentages',
    topicName: 'Procenta: Výpočet základu ze známé části',
    curriculumRef: 'RVP ZV · 7. třída · Procenta',
    difficulty: 'medium',
    generate: (ctx) => {
      const product = pick(ESHOP_PRODUCTS);
      const pct = pick([20, 25, 30, 40, 60, 75, 80]);
      const onePct = randInt(6, 25);
      const base = onePct * 100;
      const part = onePct * pct;
      const ans = numericAnswers(base, 'Kč');

      return {
        id: makeUniqueId('prim_percentage_part_base'),
        archetypeId: 'prim_percentage_part_base',
        curriculumRef: 'RVP ZV · 7. třída · Procenta',
        variantSeed: `${product.item}_${pct}_${base}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'fractions_percentages',
        topicName: 'Procenta: Výpočet základu ze známé části',
        title: `Původní cena produktu před slevou`,
        question: `Zákazník zaplatil v akci za ${product.item} částku ${part} Kč, což představuje přesně ${pct} % původní ceny. Jaká byla původní cena před slevou v Kč?`,
        realWorldContext:
          'Pochopení procentového základu chrání před marketingovými triky a usnadňuje výpočet slev i marží.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: ans.acceptableAnswers,
        unit: 'Kč',
        difficulty: 'medium',
        stepByStepSolution: `${pct} % odpovídá částce ${part} Kč.\n1 % = ${part} : ${pct} = ${onePct} Kč.\n100 % (původní cena) = ${onePct} · 100 = ${base} Kč.`,
        hints: [
          `Pozor, nepočítej ${pct} % z ${part} Kč! Částka ${part} Kč UŽ je ${pct} %.`,
          `Nejprve vyděl ${part} číslem ${pct}, čímž získáš 1 %, a pak výsledek vynásob 100.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'prim_linear_eq_basic',
    schoolTypes: ['primary_school'],
    grades: ['primary_mid'],
    topic: 'equations',
    topicName: 'Lineární rovnice s jednou neznámou',
    curriculumRef: 'RVP ZV · 8. třída · Rovnice',
    difficulty: 'easy',
    generate: (ctx) => {
      const x = randInt(-6, 9);
      const a = randInt(4, 9);
      const c = randInt(1, 3);
      const b = randInt(-12, 12);
      const d = (a - c) * x + b;
      const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const ans = numericAnswers(x);

      return {
        id: makeUniqueId('prim_linear_eq_basic'),
        archetypeId: 'prim_linear_eq_basic',
        curriculumRef: 'RVP ZV · 8. třída · Rovnice',
        variantSeed: `${a}_${b}_${c}_${d}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'equations',
        topicName: 'Lineární rovnice s jednou neznámou',
        title: `Řešení lineární rovnice ${a}x ${bStr} = ${c}x + ${d}`,
        question: `Vypočítej neznámou x z rovnice:\n${a}x ${bStr} = ${c}x ${d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`}`,
        realWorldContext:
          'Rovnice tvoří univerzální jazyk matematiky pro vyhledání neznámé hodnoty v ekonomii, fyzice i programování.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `x = ${x}`, `x=${x}`],
        difficulty: 'easy',
        stepByStepSolution: `1. Převedeme členy s x na levou stranu: (${a} - ${c})x = ${d} - (${b})\n2. ${a - c}x = ${d - b}\n3. Vydělíme ${a - c}: x = ${x}.`,
        hints: [
          `Odečti ${c}x od obou stran rovnice, aby proměnná x zůstala jen na jedné straně.`,
          `Číslo ${b} převeď s opačným znaménkem na pravou stranu a rovnici vyděl koeficientem u x.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'prim_geometry_angles_triangle',
    schoolTypes: ['primary_school'],
    grades: ['primary_mid'],
    topic: 'geometry',
    topicName: 'Geometrie: Vnitřní a vnější úhly trojúhelníku',
    curriculumRef: 'RVP ZV · 7. třída · Úhly a trojúhelníky',
    difficulty: 'easy',
    generate: (ctx) => {
      const alpha = randInt(32, 78);
      const beta = randInt(28, 72);
      const gamma = 180 - alpha - beta;
      const askExternal = randInt(0, 1) === 1;
      const answerVal = askExternal ? 180 - gamma : gamma;
      const ans = numericAnswers(answerVal, '°');

      return {
        id: makeUniqueId('prim_geometry_angles_triangle'),
        archetypeId: 'prim_geometry_angles_triangle',
        curriculumRef: 'RVP ZV · 7. třída · Úhly a trojúhelníky',
        variantSeed: `${alpha}_${beta}_${askExternal}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'geometry',
        topicName: 'Geometrie: Vnitřní a vnější úhly trojúhelníku',
        title: askExternal ? 'Vnější úhel trojúhelníku' : 'Třetí vnitřní úhel trojúhelníku',
        question: askExternal
          ? `V trojúhelníku ABC mají vnitřní úhly velikosti α = ${alpha}° a β = ${beta}°. Kolik stupňů měří vnější úhel γ' při vrcholu C?`
          : `V trojúhelníku ABC známe velikosti dvou vnitřních úhlů: α = ${alpha}° a β = ${beta}°. Kolik stupňů měří třetí vnitřní úhel γ?`,
        realWorldContext:
          'Výpočty sklonu střech, geodetické zaměřování pozemků a návrh nosných příhradových konstrukcí.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${answerVal} stupňů`],
        unit: '°',
        difficulty: 'easy',
        stepByStepSolution: askExternal
          ? `Součet vnitřních úhlů trojúhelníku je 180°.\nγ = 180° - (${alpha}° + ${beta}°) = ${gamma}°.\nVnější úhel γ' je vedlejší k γ: γ' = 180° - ${gamma}° = ${answerVal}° (nebo přímo α + β = ${answerVal}°).`
          : `Součet vnitřních úhlů v každém trojúhelníku je 180°.\nγ = 180° - (${alpha}° + ${beta}°) = 180° - ${alpha + beta}° = ${gamma}°.`,
        hints: [
          `Součet všech tří vnitřních úhlů trojúhelníku je vždy 180°.`,
          askExternal
            ? `Vnější úhel trojúhelníku je roven součtu dvou nesousedních vnitřních úhlů (α + β).`
            : `Sečti ${alpha}° a ${beta}° a odečti od 180°.`,
        ],
        type: 'number',
      };
    },
  },
  {
    id: 'prim_inverse_proportion_pumps',
    schoolTypes: ['primary_school'],
    grades: ['primary_mid'],
    topic: 'word_problems',
    topicName: 'Nepřímá úměrnost: Výkon a doba práce',
    curriculumRef: 'RVP ZV · 7. třída · Nepřímá úměrnost',
    difficulty: 'medium',
    generate: (ctx) => {
      const k1 = pick([2, 3, 4, 5, 6]);
      const t1 = pick([6, 8, 10, 12, 15, 18]);
      const totalWork = k1 * t1;
      // Pick divisor of totalWork different from k1
      const candidates = [2, 3, 4, 5, 6, 8, 9, 10, 12].filter((d) => d !== k1 && totalWork % d === 0);
      const k2 = pick(candidates);
      const t2 = totalWork / k2;
      const ans = numericAnswers(t2, 'h');

      return {
        id: makeUniqueId('prim_inverse_proportion_pumps'),
        archetypeId: 'prim_inverse_proportion_pumps',
        curriculumRef: 'RVP ZV · 7. třída · Nepřímá úměrnost',
        variantSeed: `${k1}_${t1}_${k2}`,
        grade: ctx.grade,
        schoolType: ctx.schoolType,
        topic: 'word_problems',
        topicName: 'Nepřímá úměrnost: Výkon a doba práce',
        title: `Nepřímá úměrnost: Čerpání vody ze sklepa`,
        question: `Stejně výkonná čerpadla vyčerpávají zatopený sklep. ${k1} čerpadla práci zvládnou za ${t1} hodin. Za kolik hodin vyčerpá stejný sklep ${k2} takových čerpadel?`,
        realWorldContext:
          'Plánování kapacit na stavbě, v IT výpočtech i při odhadu, jak tým pracovníků zkrátí termín dokončení zakázky.',
        correctAnswer: ans.correctAnswer,
        acceptableAnswers: [...ans.acceptableAnswers, `${t2} hodin`, `${t2} hod`],
        unit: 'h',
        difficulty: 'medium',
        stepByStepSolution: `Jde o nepřímou úměrnost (více čerpadel = kratší čas).\nCelkový objem práce = ${k1} · ${t1} = ${totalWork} čerpadlo-hodin.\nPro ${k2} čerpadel: ${totalWork} : ${k2} = ${t2} hodin.`,
        hints: [
          `Pozor: více čerpadel znamená MÉNĚ času, nejde tedy o přímou, ale o nepřímou úměrnost.`,
          `Vynásob původní počet čerpadel původním časem (${k1} · ${t1}) a výsledek vyděl novým počtem (${k2}).`,
        ],
        type: 'number',
      };
    },
  },
];
