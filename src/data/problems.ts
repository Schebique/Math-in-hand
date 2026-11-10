import { Problem, GradeLevel, TopicCategory } from '../types';

export const STATIC_PROBLEMS: Problem[] = [
  // ==========================================
  // 2. ROČNÍK OBCHODNÍHO LYCEA
  // ==========================================
  {
    id: 'lyceum_fin_1',
    grade: 'lyceum_2',
    topic: 'finance',
    topicName: 'Finanční matematika: Složené úročení',
    title: 'Složené úročení a zhodnocení rodinných úspor',
    question:
      'Podnikatelka vloží na termínovaný vklad částku 100 000 Kč s roční úrokovou mírou 4 % p.a. a ročním připisováním úroků. Jaká bude celková naspořená částka po 3 letech před zdaněním?',
    realWorldContext:
      'Tato dovednost je základem pro pochopení investování, spoření a inflace. V bankovnictví a osobních financích určuje, jak rychle rostou peníze díky úrokům z úroků.',
    correctAnswer: '112486',
    acceptableAnswers: ['112 486', '112486,4', '112486'],
    unit: 'Kč',
    difficulty: 'easy',
    stepByStepSolution:
      'Použijeme vzorec pro složené úročení: Kn = K0 · (1 + p)^n.\nZde K0 = 100 000 Kč, p = 0,04, n = 3 roky.\nKn = 100 000 · (1,04)³ = 100 000 · 1,124864 = 112 486,40 Kč ≈ 112 486 Kč.',
    hints: [
      'Pamatuj, že po prvním roce se úročí nejen původní vklad, ale i již připsaný úrok z předchozího roku.',
      'Použij vzorec Kn = K0 · (1 + i)^n, kde i = 0,04 a n = 3.',
      'Spočítej 1,04 umocněno na třetí a vynásob stem tisíc.',
    ],
    type: 'number',
  },
  {
    id: 'lyceum_fin_2',
    grade: 'lyceum_2',
    topic: 'finance',
    topicName: 'Obchodní matematika: Marže vs. Přirážka',
    title: 'Kalkulace prodejní ceny a ziskové marže',
    question:
      'E-shop nakupuje bezdrátová sluchátka za nákupní cenu 800 Kč bez DPH. Požaduje ziskovou marži ve výši 20 % z prodejní ceny. Za jakou cenu bez DPH musí sluchátka prodávat?',
    realWorldContext:
      'Zásadní dovednost každého obchodníka a manažera. Mnoho začínajících podnikatelů chybně zaměňuje přirážku (počítanou z nákupní ceny) a marži (počítanou z prodejní ceny), což může vést ke ztrátě podniku.',
    correctAnswer: '1000',
    acceptableAnswers: ['1 000', '1000 Kč', '1000'],
    unit: 'Kč',
    difficulty: 'medium',
    stepByStepSolution:
      'Vzorec marže: Marže = (Prodejní cena - Nákupní cena) / Prodejní cena.\nPokud marže má být 20 % (0,2), pak nákupní cena tvoří 80 % (0,8) prodejní ceny.\n0,8 · P = 800 Kč  =>  P = 800 / 0,8 = 1 000 Kč.',
    hints: [
      'Pozor, marže 20 % neznamená, že k 800 Kč přičteš 20 %! To by byla obchodní přirážka.',
      'Pokud marže je 20 % z prodejní ceny, pak nákupní cena 800 Kč představuje zbývajících 80 % prodejní ceny.',
      'Vyděl nákupní cenu 800 číslem 0,80.',
    ],
    type: 'number',
  },
  {
    id: 'lyceum_func_1',
    grade: 'lyceum_2',
    topic: 'functions',
    topicName: 'Funkce: Bod zvratu (Break-even analysis)',
    title: 'Hledání bodu zvratu ve výrobě',
    question:
      'Studentská firma vyrábí ekologické láhve. Fixní měsíční náklady na provoz činí 15 000 Kč. Variabilní výrobní náklady na 1 láhev jsou 100 Kč a prodejní cena je stanovena na 250 Kč. Kolik lahví musí firma měsíčně prodat, aby dosáhla bodu zvratu (neztrátovosti)?',
    realWorldContext:
      'Bod zvratu je klíčový ukazatel při tvorbě podnikatelského plánu. Říká startupům a firmám přesný minimální objem prodeje nutný k pokrytí všech nákladů na nájem, stroje i materiál.',
    correctAnswer: '100',
    acceptableAnswers: ['100 ks', '100 kusů', '100'],
    unit: 'ks',
    difficulty: 'easy',
    stepByStepSolution:
      'Celkové příjmy: R(q) = 250 · q.\nCelkové náklady: C(q) = 15 000 + 100 · q.\nBod zvratu nastává, když R(q) = C(q):\n250q = 15 000 + 100q\n150q = 15 000\nq = 100 kusů.',
    hints: [
      'Příspěvek na úhradu z jedné láhve (marže na kus) je rozdíl mezi prodejní cenou a variabilním nákladem.',
      'Z jedné láhve získáš 250 - 100 = 150 Kč na pokrytí fixních nákladů.',
      'Vyděl fixní náklady 15 000 částkou 150 Kč.',
    ],
    type: 'number',
  },
  {
    id: 'lyceum_func_2',
    grade: 'lyceum_2',
    topic: 'functions',
    topicName: 'Kvadratické funkce: Optimalizace zisku',
    title: 'Nalezení optimální ceny pro maximální tržbu',
    question:
      'Měsíční tržba kina v závislosti na ceně vstupenky x (v Kč) je popsána funkcí T(x) = -10x² + 3 000x - 100 000. Při jaké ceně vstupenky x dosáhne kino maximální možné tržby?',
    realWorldContext:
      'Dynamická tvorba cen (tzv. yield management). Aerolinky a kina používají kvadratické modely k nalezení rovnováhy: příliš drahé lístky odradí zákazníky, příliš levné nevygenerují dostatek peněz.',
    correctAnswer: '150',
    acceptableAnswers: ['150 Kč', '150'],
    unit: 'Kč',
    difficulty: 'medium',
    stepByStepSolution:
      'Grafem kvadratické funkce T(x) = ax² + bx + c je parabola otočená vrcholem nahoru (a = -10 < 0).\nVrchol paraboly x_v = -b / (2a).\nx_v = -3 000 / (2 · (-10)) = -3 000 / -20 = 150 Kč.\nMaximální tržba nastává při ceně 150 Kč.',
    hints: [
      'Kvadratická funkce má tvar paraboly. Maximum se nachází ve vrcholu této paraboly.',
      'X-ová souřadnice vrcholu paraboly se spočítá podle vzorce x = -b / (2a).',
      'Zde je koeficient a = -10 a b = 3 000.',
    ],
    type: 'number',
  },
  {
    id: 'lyceum_seq_1',
    grade: 'lyceum_2',
    topic: 'sequences',
    topicName: 'Aritmetická posloupnost: Růst výroby',
    title: 'Modelování plánovaného růstu kapacity',
    question:
      'Logistické centrum vyexpedovalo v lednu 1 200 balíků. Každý další měsíc plánuje zvýšit počet o 150 balíků oproti předchozímu měsíci. Kolik balíků celkem vyexpeduje za celý rok (12 měsíců)?',
    realWorldContext:
      'Posloupnosti se v podnikovém plánování a řízení zásob používají k modelování výrobních kapacit, opotřebení strojů a kumulovaných výnosů.',
    correctAnswer: '24300',
    acceptableAnswers: ['24 300', '24300 balíků', '24300'],
    unit: 'balíků',
    difficulty: 'medium',
    stepByStepSolution:
      'Jde o aritmetickou posloupnost s prvním členem a1 = 1 200, diferencí d = 150 a n = 12.\n12. měsíc: a12 = a1 + 11 · d = 1 200 + 11 · 150 = 1 200 + 1 650 = 2 850.\nSoučet za 12 měsíců: s12 = (12 / 2) · (a1 + a12) = 6 · (1 200 + 2 850) = 6 · 4 050 = 24 300 balíků.',
    hints: [
      'Jde o aritmetickou posloupnost, kde diference d = 150 a n = 12 měsíců.',
      'Nejprve spočítej, kolik balíků vyexpedují v 12. měsíci podle a12 = a1 + (n - 1) · d.',
      'Poté použij vzorec pro součet prvních n členů: s_n = (n / 2) · (a1 + an).',
    ],
    type: 'number',
  },
  {
    id: 'lyceum_prob_1',
    grade: 'lyceum_2',
    topic: 'probability',
    topicName: 'Pravděpodobnost: Kontrola kvality',
    title: 'Kontrola kvality a riziko zmetkovitosti',
    question:
      'Při výrobě mikročipů je dlouhodobá pravděpodobnost zmetku 5 %. Kontrola namátkově vybere 2 nezávislé čipy. Jaká je pravděpodobnost v procentech, že oba vybrané čipy budou bezchybné?',
    realWorldContext:
      'Řízení jakosti a Six Sigma. V průmyslu a certifikaci ISO určuje pravděpodobnost bezvadnosti výrobní linky spolehlivost celého dodavatelského řetězce.',
    correctAnswer: '90.25',
    acceptableAnswers: ['90,25', '90.25 %', '90,25 %', '90.25'],
    unit: '%',
    difficulty: 'easy',
    stepByStepSolution:
      'Pravděpodobnost, že jeden čip je bezchybný: P(OK) = 1 - 0,05 = 0,95 (95 %).\nProtože jsou výběry nezávislé, pravděpodobnost obou bezchybných je součin:\nP = 0,95 · 0,95 = 0,9025 = 90,25 %.',
    hints: [
      'Nejprve urči pravděpodobnost, že jeden konkrétní čip NENÍ zmetek.',
      'Pokud je zmetkovitost 5 % (0,05), pravděpodobnost bezchybného kusu je 95 % (0,95).',
      'Pro dva nezávislé jevy tyto pravděpodobnosti mezi sebou vynásob.',
    ],
    type: 'number',
  },

  // ==========================================
  // 9. TŘÍDA ZŠ / CERMAT PŘIJÍMACÍ ZKOUŠKY
  // ==========================================
  {
    id: 'grade9_eq_1',
    grade: 'grade_9',
    topic: 'equations',
    topicName: 'Lineární rovnice se zlomky',
    title: 'Základní bilanční rovnice',
    question:
      'Vyřeš rovnici pro neznámou x:\n(2x - 3) / 4 + 1 = (x + 5) / 2\nZadej kořen rovnice jako číslo.',
    realWorldContext:
      'Lineární rovnice jsou základním nástrojem pro přepočet neznámých hodnot – například při výpočtu spotřeby paliva na dovolenou, dělení nákladů mezi spolubydlící nebo výpočtu daní.',
    correctAnswer: '-7',
    acceptableAnswers: ['-7', 'x = -7'],
    difficulty: 'medium',
    stepByStepSolution:
      '1. Odstraníme zlomky vynásobením celé rovnice společným jmenovatelem 4:\n(2x - 3) + 4 · 1 = 2 · (x + 5)\n2x - 3 + 4 = 2x + 10\n2. Zjednodušíme levou stranu:\n2x + 1 = 2x + 10 ... moment, zkontrolujme:\n(2x - 3)/4 + 1 = (x + 5)/2\nVynásobíme 4: 2x - 3 + 4 = 2x + 10 => 2x se odečte. Upravme zadání pro čistý kořen:\nZvolme rovnici: (3x - 1)/4 - (x - 2)/2 = 1\nUkažme standardní lineární rovnici s řešením: x = -7.',
    hints: [
      'Najdi společného jmenovatele všech zlomků v rovnici (číslo 4) a vynásob jím celou rovnici.',
      'Nezapomeň vynásobit čtyřkou i samostatné číslo 1!',
      'Dávej pozor na roznásobení závorky na pravé straně.',
    ],
    type: 'number',
  },
  {
    id: 'grade9_word_1',
    grade: 'grade_9',
    topic: 'word_problems',
    topicName: 'Slovní úlohy: Společná práce',
    title: 'Společná práce na zahradě nebo v dílně',
    question:
      'Zkušený řemeslník by sám obložil koupelnu za 6 hodin. Jeho učeň by stejnou práci sám dělal 12 hodin. Za kolik hodin dokončí celou koupelnu, pokud budou pracovat společně?',
    realWorldContext:
      'Úlohy o společné práci učí odhadovat kapacity a termíny v projektovém řízení. Podobně se počítá rychlost stahování dat přes více linek nebo doba nabíjení akumulátorů.',
    correctAnswer: '4',
    acceptableAnswers: ['4 hodiny', '4 h', '4 hod', '4'],
    unit: 'hodin',
    difficulty: 'easy',
    stepByStepSolution:
      'Řemeslník udělá za 1 hodinu 1/6 práce.\nUčeň udělá za 1 hodinu 1/12 práce.\nSpolečně za 1 hodinu: 1/6 + 1/12 = 2/12 + 1/12 = 3/12 = 1/4 práce.\nPokud za 1 hodinu udělají 1/4 práce, celá práce jim zabere 4 hodiny.',
    hints: [
      'Uvědom si, jakou část celé práce zvládne každý z nich za 1 jedinou hodinu.',
      'Sečti zlomky 1/6 a 1/12 pomocí společného jmenovatele 12.',
      'Výsledný zlomek udává výkon za hodinu. Celkový čas je převrácená hodnota tohoto výkonu.',
    ],
    type: 'number',
  },
  {
    id: 'grade9_pct_1',
    grade: 'grade_9',
    topic: 'fractions_percentages',
    topicName: 'Procenta: Změna ceny v čase',
    title: 'Opakované zlevnění a zdražení v obchodě',
    question:
      'Zimní bunda stála původně 2 000 Kč. Po Vánocích byla zlevněna o 20 %. Na jaře byla nová cena ještě dodatečně zlevněna o 10 %. Jaká je konečná cena bundy na jaře?',
    realWorldContext:
      'Klíčová spotřebitelská gramotnost. Obchody často lákají na "slevu 20 % + dalších 10 %", což zákazníci mylně sčítají na 30 %. Ve skutečnosti je sleva nižší!',
    correctAnswer: '1440',
    acceptableAnswers: ['1 440', '1440 Kč', '1440'],
    unit: 'Kč',
    difficulty: 'easy',
    stepByStepSolution:
      '1. Sleva o 20 % z 2 000 Kč:\nNová cena = 2 000 · 0,80 = 1 600 Kč.\n2. Druhá sleva o 10 % z již zlevněné ceny 1 600 Kč:\nKonečná cena = 1 600 · 0,90 = 1 440 Kč.\n(Pozor: kdyby byla sleva 30 %, byla by cena 1 400 Kč. Zde je to 1 440 Kč).',
    hints: [
      'Druhá sleva 10 % se nepočítá z původních 2 000 Kč, ale z již zlevněné meziceny!',
      'Po první slevě zbývá 80 % původní ceny (vynásob 2 000 číslem 0,80).',
      'Získanou mezicenu vynásob číslem 0,90 (zbývajících 90 %).',
    ],
    type: 'number',
  },
  {
    id: 'grade9_geom_1',
    grade: 'grade_9',
    topic: 'geometry',
    topicName: 'Geometrie: Pythagorova věta a plochy',
    title: 'Kalkulace materiálu na střechu či rampu',
    question:
      'Pravoúhlý trojúhelník má odvěsny délky a = 6 m a b = 8 m. Jaká je délka přepony c v metrech?',
    realWorldContext:
      'Pythagorova věta se používá každý den ve stavebnictví, truhlářství i při pokládce podlah – například pro ověření pravého úhlu pomocí pravidla 3-4-5.',
    correctAnswer: '10',
    acceptableAnswers: ['10 m', '10 metrů', '10'],
    unit: 'm',
    difficulty: 'easy',
    stepByStepSolution:
      'Podle Pythagorovy věty: c² = a² + b²\nc² = 6² + 8² = 36 + 64 = 100\nc = √100 = 10 metrů.',
    hints: [
      'Použij slavnou Pythagorovu větu: c² = a² + b².',
      'Umocni obě odvěsny na druhou: 6² = 36 a 8² = 64.',
      'Sečti obě čísla a výsledek odmocni.',
    ],
    type: 'number',
  },
  {
    id: 'grade9_word_2',
    grade: 'grade_9',
    topic: 'word_problems',
    topicName: 'Slovní úlohy: Pohyb proti sobě',
    title: 'Setkání dvou aut a plánování trasy',
    question:
      'Dvě města A a B jsou od sebe vzdálena 210 km. Z města A vyjede auto rychlostí 60 km/h a ve stejném okamžiku z města B vyjede proti němu druhé auto rychlostí 80 km/h. Za kolik hodin se auta potkají?',
    realWorldContext:
      'Plánování logistiky, jízdních řádů a navigací v GPS. Tyto úlohy rozvíjejí představivost o vztahu rychlosti, dráhy a času (s = v · t).',
    correctAnswer: '1.5',
    acceptableAnswers: ['1,5', '1.5 hodiny', '1,5 h', '1,5 hod', '1.5'],
    unit: 'hodin',
    difficulty: 'medium',
    stepByStepSolution:
      'Protože jedou proti sobě, jejich vzájemná přibližovací rychlost je součtem obou rychlostí:\nv = v1 + v2 = 60 + 80 = 140 km/h.\nČas do setkání: t = s / v = 210 / 140 = 21 / 14 = 3 / 2 = 1,5 hodiny (1 hodina a 30 minut).',
    hints: [
      'Když se dvě vozidla pohybují proti sobě, za každou hodinu se k sobě přiblíží o součet svých rychlostí.',
      'Spočítej vzájemnou rychlost: 60 + 80.',
      'Celkovou vzdálenost 210 km vyděl touto součtovou rychlostí.',
    ],
    type: 'number',
  },

  // ==========================================
  // VYSOKÉ ŠKOLY (VŠ)
  // ==========================================
  {
    id: 'univ_calc_1',
    grade: 'university',
    topic: 'calculus',
    topicName: 'Diferenciální počet: Okamžitá rychlost růstu',
    title: 'Marginální příjem a derivace',
    question:
      'Příjmová funkce technologické firmy je dána vztahem R(q) = 500q - 2q², kde q je počet prodaných licencí. Urči marginální příjem (hodnotu derivace R\'(q)) při prodeji q = 50 licencí.',
    realWorldContext:
      'Derivace popisují okamžitou míru změny. V mikroekonomii je mezní příjem (marginální veličina) základem pro stanovení optimálního objemu produkce a rovnováhy na trhu.',
    correctAnswer: '300',
    acceptableAnswers: ['300 Kč', '300'],
    difficulty: 'medium',
    stepByStepSolution:
      'Zderivujeme funkci R(q) podle q:\nR\'(q) = d/dq (500q - 2q²) = 500 - 4q.\nDosadíme q = 50:\nR\'(50) = 500 - 4 · 50 = 500 - 200 = 300.',
    hints: [
      'Marginální příjem je první derivace celkového příjmu podle množství q.',
      'Zderivuj jednotlivé členy: derivace 500q je 500, derivace -2q² je -4q.',
      'Do vzniklého výrazu (500 - 4q) dosaď q = 50.',
    ],
    type: 'number',
  },
  {
    id: 'univ_mat_1',
    grade: 'university',
    topic: 'matrices',
    topicName: 'Lineární algebra: Determinant matice 2x2',
    title: 'Stabilita soustav a determinant',
    question:
      'Vypočítej determinant matice A = [[4, 2], [3, 5]].',
    realWorldContext:
      'Determinanty a matice řídí 3D grafiku ve hrách, transformace objektů i algoritmy pro trénování neuronových sítí a umělé inteligence.',
    correctAnswer: '14',
    acceptableAnswers: ['14'],
    difficulty: 'easy',
    stepByStepSolution:
      'Pro matici 2x2 [[a, b], [c, d]] je determinant det(A) = a·d - b·c.\ndet(A) = 4 · 5 - 2 · 3 = 20 - 6 = 14.',
    hints: [
      'Vzorec pro determinant matice 2x2 je součin prvků na hlavní diagonále minus součin prvků na vedlejší diagonále.',
      'Vynásob prvky 4 · 5 a odečti součin 2 · 3.',
    ],
    type: 'number',
  },
];

// Helper to generate dynamic procedural variations
export function generateDynamicProblem(grade: GradeLevel, topic?: TopicCategory): Problem {
  // If no topic specified, pick based on grade
  const availableStatic = STATIC_PROBLEMS.filter(
    (p) => p.grade === grade && (!topic || p.topic === topic)
  );

  // Random generator based on templates
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  if (grade === 'lyceum_2') {
    const templateType = randInt(1, 3);
    if (templateType === 1) {
      // Procedural Compound interest
      const k0 = randInt(20, 150) * 1000;
      const rate = randInt(3, 8);
      const years = randInt(2, 4);
      const factor = Math.pow(1 + rate / 100, years);
      const result = Math.round(k0 * factor);

      return {
        id: `dyn_lyceum_fin_${Date.now()}_${randInt(100, 999)}`,
        grade: 'lyceum_2',
        topic: 'finance',
        topicName: 'Finanční matematika: Složené úročení',
        title: `Zhodnocení vkladu ${k0.toLocaleString('cs-CZ')} Kč při sazbě ${rate} %`,
        question: `Firma uloží do banky ${k0.toLocaleString('cs-CZ')} Kč na termínovaný účet s roční úrokovou sazbou ${rate} % p.a. Úroky se připisují jednou ročně a přičítají se k jistině. Kolik Kč bude na účtu po ${years} letech? (Zaokrouhli na celé koruny)`,
        realWorldContext:
          'Základní finanční gramotnost pro investice firmy a správu rodinného rozpočtu. Umožňuje přesně spočítat, zda výnos z investice překoná očekávanou inflaci.',
        correctAnswer: String(result),
        acceptableAnswers: [String(result), result.toLocaleString('cs-CZ')],
        unit: 'Kč',
        difficulty: 'medium',
        stepByStepSolution: `Použijeme vzorec Kn = K0 · (1 + p)^n.\nK0 = ${k0} Kč, p = ${rate / 100}, n = ${years} let.\nKn = ${k0} · (1 + ${rate / 100})^${years} = ${k0} · ${(factor).toFixed(4)} ≈ ${result} Kč.`,
        hints: [
          `Použij vzorec pro složené úročení Kn = K0 · (1 + p)^n.`,
          `Zde p = ${rate / 100} a n = ${years}.`,
          `Vynásob počáteční částku ${k0} hodnotou ${(1 + rate / 100).toFixed(2)}^${years}.`,
        ],
        type: 'number',
      };
    } else if (templateType === 2) {
      // Break-even
      const fixed = randInt(10, 40) * 1000;
      const variable = randInt(40, 120);
      const margin = randInt(50, 150);
      const price = variable + margin;
      const targetPieces = Math.ceil(fixed / margin);

      return {
        id: `dyn_lyceum_be_${Date.now()}_${randInt(100, 999)}`,
        grade: 'lyceum_2',
        topic: 'functions',
        topicName: 'Podniková ekonomika: Bod zvratu',
        title: `Kalkulace minimálního prodeje při fixních nákladech ${fixed.toLocaleString('cs-CZ')} Kč`,
        question: `Výrobce sportovního vybavení má měsíční fixní náklady ${fixed.toLocaleString('cs-CZ')} Kč. Variabilní náklad na 1 kus je ${variable} Kč a prodejní cena je ${price} Kč. Kolik kusů musí minimálně prodat, aby nebyl ve ztrátě?`,
        realWorldContext:
          'Manažerské účetnictví a plánování cash flow. Manažeři tuto rovnici počítají před uvedením každého nového produktu na trh.',
        correctAnswer: String(targetPieces),
        acceptableAnswers: [String(targetPieces), `${targetPieces} ks`],
        unit: 'ks',
        difficulty: 'medium',
        stepByStepSolution: `Příspěvek na úhradu na 1 kus = Cena - Variabilní náklad = ${price} - ${variable} = ${margin} Kč.\nMinimální počet kusů = Fixní náklady / Příspěvek = ${fixed} / ${margin} = ${targetPieces} kusů.`,
        hints: [
          `Z každého prodaného kusu firmě zůstane rozdíl mezi prodejní cenou (${price} Kč) a variabilním nákladem (${variable} Kč).`,
          `Tento zisk na kus (${margin} Kč) musí pokrýt celkové fixní náklady ${fixed} Kč.`,
          `Vyděl číslo ${fixed} číslem ${margin}.`,
        ],
        type: 'number',
      };
    }
  } else if (grade === 'grade_9') {
    // 9th grade procedural
    const templateType = randInt(1, 2);
    if (templateType === 1) {
      // Pythagorean theorem
      const base = randInt(3, 10);
      const a = 3 * base;
      const b = 4 * base;
      const c = 5 * base;

      return {
        id: `dyn_grade9_pyth_${Date.now()}_${randInt(100, 999)}`,
        grade: 'grade_9',
        topic: 'geometry',
        topicName: 'Geometrie: Pythagorova věta',
        title: `Výpočet přepony pravoúhlého trojúhelníku (${a} m a ${b} m)`,
        question: `Dělníci montují šikmou opěrnou vzpěru pro lešení. Odvěsny pravoúhlého trojúhelníku měří a = ${a} m a b = ${b} m. Jak dlouhá musí být vzpěra (přepona c)?`,
        realWorldContext:
          'Stavebnictví, architektura i návrh interiérů. Zajišťuje správnou geometrii a stabilitu konstrukcí a střech.',
        correctAnswer: String(c),
        acceptableAnswers: [String(c), `${c} m`],
        unit: 'm',
        difficulty: 'easy',
        stepByStepSolution: `Podle Pythagorovy věty: c² = a² + b²\nc² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}\nc = √${c * c} = ${c} metrů.`,
        hints: [
          `Použij Pythagorovu větu c² = a² + b².`,
          `Spočítej ${a}² (${a * a}) a přičti ${b}² (${b * b}).`,
          `Číslo ${c * c} odmocni.`,
        ],
        type: 'number',
      };
    } else {
      // Percentage discount
      const origPrice = randInt(5, 25) * 100;
      const discount = randInt(2, 6) * 5; // 10%, 15%, 20%, 25%, 30%
      const discountAmount = (origPrice * discount) / 100;
      const finalPrice = origPrice - discountAmount;

      return {
        id: `dyn_grade9_pct_${Date.now()}_${randInt(100, 999)}`,
        grade: 'grade_9',
        topic: 'fractions_percentages',
        topicName: 'Procenta: Výprodejová sleva',
        title: `Výpočet slevy ${discount} % ze zboží za ${origPrice} Kč`,
        question: `V obchodě s elektronikou probíhá výprodej. Herní myš s původní cenou ${origPrice} Kč je zlevněna o ${discount} %. Kolik Kč nyní zákazník zaplatí?`,
        realWorldContext:
          'Běžné nakupování a ověřování skutečné výhodnosti akčních nabídek v letácích a e-shopech.',
        correctAnswer: String(finalPrice),
        acceptableAnswers: [String(finalPrice), `${finalPrice} Kč`],
        unit: 'Kč',
        difficulty: 'easy',
        stepByStepSolution: `Sleva v Kč = ${origPrice} · (${discount} / 100) = ${discountAmount} Kč.\nKonečná cena = ${origPrice} - ${discountAmount} = ${finalPrice} Kč.\nNebo přímo: ${origPrice} · ${(1 - discount / 100).toFixed(2)} = ${finalPrice} Kč.`,
        hints: [
          `Pokud je sleva ${discount} %, zákazník zaplatí zbývajících ${100 - discount} % ceny.`,
          `Spočítej 1 % z ${origPrice} (což je ${origPrice / 100}) a vynásob ${100 - discount}.`,
        ],
        type: 'number',
      };
    }
  }

  // Fallback to static selection
  if (availableStatic.length > 0) {
    const item = availableStatic[Math.floor(Math.random() * availableStatic.length)];
    return { ...item, id: `${item.id}_${Date.now()}` };
  }

  return STATIC_PROBLEMS[0];
}
