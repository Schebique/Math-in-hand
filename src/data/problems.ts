import { Problem, GradeLevel, TopicCategory, SchoolType } from '../types';

export const STATIC_PROBLEMS: Problem[] = [
  // ==========================================
  // 2. STUPEŇ ZÁKLADNÍ ŠKOLY (6.–8. TŘÍDA)
  // ==========================================
  {
    id: 'primary_frac_1',
    grade: 'primary_mid',
    schoolType: 'primary_school',
    topic: 'fractions_percentages',
    topicName: 'Zlomky a dělení celku: Vaření a pečení',
    title: 'Přepočet ingrediencí v receptu pro rodinu',
    question:
      'V receptu na bábovku pro 4 osoby je předepsáno 300 g mouky a 3/4 hrnku mléka. Chystáš pohoštění pro 6 osob. Kolik gramů mouky budeš potřebovat?',
    realWorldContext:
      'Klíčová dovednost pro každodenní život – vaření, pečení, ředění nátěrů na zeď nebo dávkování krmiva pro domácí mazlíčky podle váhy.',
    correctAnswer: '450',
    acceptableAnswers: ['450 g', '450 gramů', '450'],
    unit: 'g',
    difficulty: 'easy',
    stepByStepSolution:
      '1. Zjistíme množství mouky na 1 osobu: 300 g / 4 = 75 g na osobu.\n2. Vynásobíme novým počtem osob: 75 g · 6 = 450 g mouky.\nNebo pomocí poměru: 300 · (6 / 4) = 300 · 1,5 = 450 g.',
    hints: [
      'Nejprve spočítej, kolik gramů mouky připadá na 1 osobu.',
      'Vyděl 300 čtyřmi a poté výsledek vynásob šesti.',
    ],
    type: 'number',
  },
  {
    id: 'primary_ratio_1',
    grade: 'primary_mid',
    schoolType: 'primary_school',
    topic: 'word_problems',
    topicName: 'Poměry a měřítko mapy: Plánování výletu',
    title: 'Měření skutečné vzdálenosti na turistické mapě',
    question:
      'Turistická mapa má měřítko 1 : 50 000. Na mapě měří plánovaná trasa k rozhledně přesně 8 cm. Kolik kilometrů měří trasa ve skutečnosti?',
    realWorldContext:
      'Základ orientace v terénu a na túrách. Měřítko mapy ti umožní spočítat, zda stihneš dorazit před setměním na horskou chatu.',
    correctAnswer: '4',
    acceptableAnswers: ['4 km', '4 kilometry', '4'],
    unit: 'km',
    difficulty: 'easy',
    stepByStepSolution:
      'Měřítko 1 : 50 000 znamená, že 1 cm na mapě = 50 000 cm ve skutečnosti.\n8 cm na mapě = 8 · 50 000 cm = 400 000 cm.\n400 000 cm = 4 000 m = 4 km.',
    hints: [
      'Vynásob vzdálenost na mapě (8 cm) číslem 50 000.',
      'Dostaneš vzdálenost v centimetrech (400 000 cm). Převeď ji na metry (škrtni dvě nuly) a pak na kilometry (škrtni další tři nuly).',
    ],
    type: 'number',
  },

  // ==========================================
  // CERMAT PŘIJÍMACÍ ZKOUŠKY (9. TŘÍDA ZŠ NA SŠ)
  // ==========================================
  {
    id: 'cermat_eq_1',
    grade: 'grade_9',
    schoolType: 'cermat_prep',
    topic: 'equations',
    topicName: 'Lineární rovnice se zlomky (typový CERMAT)',
    title: 'Kořen rovnice se závorkami a společným jmenovatelem',
    question:
      'Najdi kořen x rovnice:\n(3x - 1) / 4 - (x - 2) / 2 = 1\nZadej výsledné číslo x.',
    realWorldContext:
      'Standardní a nejčastěji bodovaná úloha v jednotných přijímacích testech CERMAT na maturitní obory a gymnázia.',
    correctAnswer: '1',
    acceptableAnswers: ['1', 'x = 1', 'x=1'],
    difficulty: 'medium',
    stepByStepSolution:
      '1. Vynásobíme celou rovnici společným jmenovatelem 4:\n(3x - 1) - 2 · (x - 2) = 4 · 1\n2. Roznásobíme závorku s ohledem na minus:\n3x - 1 - 2x + 4 = 4\nx + 3 = 4\nx = 4 - 3\nx = 1.',
    hints: [
      'Pozor na minus před druhým zlomkem! Při roznásobení -(x - 2) se znaménko otočí na kladné: -2x + 4.',
      'Vynásob celou rovnici číslem 4 a nezapomeň na pravou stranu (1 · 4 = 4).',
      'Zjednoduš levou stranu rovnice: 3x - 2x je x, a -1 + 4 je +3.',
    ],
    type: 'number',
  },
  {
    id: 'cermat_word_motion',
    grade: 'grade_9',
    schoolType: 'cermat_prep',
    topic: 'word_problems',
    topicName: 'Slovní úlohy: Pohyb dvou vozidel proti sobě',
    title: 'Setkání na dálnici D1',
    question:
      'Dvě města jsou od sebe vzdálena 180 km. Z města A vyjede osobní auto rychlostí 90 km/h. Současně proti němu z města B vyjede dodávka rychlostí 60 km/h. Za kolik hodin a minut se potkají? (Zadej čas v hodinách, např. 1.2)',
    realWorldContext:
      'Typická náročná CERMAT úloha prověřující prostorovou představivost a rovnici dráhy s = v · t, která se používá v dopravní logistice.',
    correctAnswer: '1.2',
    acceptableAnswers: ['1,2', '1.2', '1 hodina 12 minut', '1 h 12 min'],
    unit: 'hodin',
    difficulty: 'medium',
    stepByStepSolution:
      'Vzájemná rychlost přibližování je součet: v = 90 + 60 = 150 km/h.\nČas do setkání: t = s / v = 180 / 150 = 18 / 15 = 6 / 5 = 1,2 hodiny (1 h a 12 min).',
    hints: [
      'Když se vozidla pohybují proti sobě, jejich vzájemná rychlost se sčítá: 90 + 60 = 150 km/h.',
      'Vyděl celkovou vzdálenost 180 km součtovou rychlostí 150 km/h.',
    ],
    type: 'number',
  },
  {
    id: 'cermat_pyth_1',
    grade: 'grade_9',
    schoolType: 'cermat_prep',
    topic: 'geometry',
    topicName: 'Geometrie: Pythagorova věta a tělesa',
    title: 'Délka úhlopříčky obdélníkového pozemku',
    question:
      'Obdélníková zahrada má délky stran 15 m a 20 m. Majitel chce postavit plot napříč zahradou po její úhlopříčce. Jak dlouhý musí být tento plot v metrech?',
    realWorldContext:
      'Stavebnictví, vyměřování pozemků v katastru i kontrola pravých úhlů při stavbě základové desky domu.',
    correctAnswer: '25',
    acceptableAnswers: ['25 m', '25 metrů', '25'],
    unit: 'm',
    difficulty: 'easy',
    stepByStepSolution:
      'Úhlopříčka u pravoúhlého trojúhelníku: u² = 15² + 20²\nu² = 225 + 400 = 625\nu = √625 = 25 metrů.',
    hints: [
      'Zahrada tvoří dva pravoúhlé trojúhelníky, kde úhlopříčka je přeponou.',
      'Umocni 15² a 20², sečti je a výsledek odmocni.',
    ],
    type: 'number',
  },

  // ==========================================
  // OBCHODNÍ LYCEA A AKADEMIE
  // ==========================================
  {
    id: 'lyceum_fin_1',
    grade: 'lyceum_2',
    schoolType: 'business_lyceum',
    topic: 'finance',
    topicName: 'Finanční matematika: Složené úročení a vklady',
    title: 'Složené úročení rodinných úspor',
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
    schoolType: 'business_lyceum',
    topic: 'finance',
    topicName: 'Obchodní matematika: Marže vs. Obchodní přirážka',
    title: 'Kalkulace prodejní ceny pro e-shop',
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
    schoolType: 'business_lyceum',
    topic: 'functions',
    topicName: 'Podniková ekonomika: Bod zvratu (Break-even)',
    title: 'Hledání hranice neztrátovosti ve výrobě',
    question:
      'Studentská firma vyrábí ekologické láhve. Fixní měsíční náklady na provoz činí 15 000 Kč. Variabilní výrobní náklady na 1 láhev jsou 100 Kč a prodejní cena je stanovena na 250 Kč. Kolik lahví musí firma měsíčně prodat, aby dosáhla bodu zvratu?',
    realWorldContext:
      'Bod zvratu je klíčový ukazatel při tvorbě podnikatelského plánu. Říká startupům a firmám přesný minimální objem prodeje nutný k pokrytí všech nákladů na nájem, stroje i materiál.',
    correctAnswer: '100',
    acceptableAnswers: ['100 ks', '100 kusů', '100'],
    unit: 'ks',
    difficulty: 'easy',
    stepByStepSolution:
      'Příspěvek na úhradu na 1 kus = 250 - 100 = 150 Kč.\nPočet kusů = Fixní náklady / Příspěvek = 15 000 / 150 = 100 kusů.',
    hints: [
      'Z každé láhve zůstane firmě 250 - 100 = 150 Kč na pokrytí fixních výdajů.',
      'Vyděl 15 000 touto marží 150 Kč.',
    ],
    type: 'number',
  },

  // ==========================================
  // GYMNÁZIA A STŘEDNÍ ŠKOLY SOŠ
  // ==========================================
  {
    id: 'gym_quad_1',
    grade: 'grammar_school',
    schoolType: 'grammar_school',
    topic: 'equations',
    topicName: 'Kvadratické rovnice: Diskriminant',
    title: 'Kladný kořen kvadratické rovnice',
    question:
      'Vyřeš kvadratickou rovnici x² - 5x + 6 = 0. Jaký je její větší kořen?',
    realWorldContext:
      'Kvadratické rovnice popisují trajektorii vrhů ve fyzice (balistika, let basketbalového míče), brzdnou dráhu aut i parabolické antény satelitů.',
    correctAnswer: '3',
    acceptableAnswers: ['3', 'x = 3'],
    difficulty: 'easy',
    stepByStepSolution:
      'Diskriminant: D = b² - 4ac = (-5)² - 4 · 1 · 6 = 25 - 24 = 1.\nKořeny: x1,2 = (5 ± √1) / 2 = (5 ± 1) / 2.\nx1 = 6 / 2 = 3, x2 = 4 / 2 = 2.\nVětší kořen je x = 3.',
    hints: [
      'Použij vzorec pro diskriminant D = b² - 4ac, nebo Viètovy vzorce (hledáš dvě čísla, jejichž součin je 6 a součet je 5).',
      'Čísla 2 a 3 splňují 2 · 3 = 6 a 2 + 3 = 5.',
    ],
    type: 'number',
  },
  {
    id: 'sos_tech_1',
    grade: 'grammar_school',
    schoolType: 'vocational_sos',
    topic: 'geometry',
    topicName: 'Technická geometrie: Objem válcové nádrže',
    title: 'Kapacita zásobníku na chladicí kapalinu',
    question:
      'Válcová nádrž stroje má vnitřní poloměr r = 1 m a výšku v = 2 m. Kolik celých metrů krychlových (m³) chladicí kapaliny se do nádrže vejde při zaokrouhlení na 1 desetinné místo? (Použij π = 3,14)',
    realWorldContext:
      'Zásadní pro strojírenství, chemii a stavebnictví při dimenzování potrubí, zásobníků a čerpadel.',
    correctAnswer: '6.3',
    acceptableAnswers: ['6,3', '6.3', '6.28', '6,28'],
    unit: 'm³',
    difficulty: 'easy',
    stepByStepSolution:
      'Objem válce: V = π · r² · v.\nV = 3,14 · 1² · 2 = 3,14 · 2 = 6,28 m³ ≈ 6,3 m³.',
    hints: [
      'Vzorec pro objem válce je obsah podstavy (π · r²) krát výška v.',
      'Spočítej 3,14 · 1 · 2.',
    ],
    type: 'number',
  },

  // ==========================================
  // VYSOKÉ ŠKOLY (VŠ)
  // ==========================================
  {
    id: 'univ_calc_1',
    grade: 'university',
    schoolType: 'university',
    topic: 'calculus',
    topicName: 'Diferenciální počet: Okamžitá rychlost růstu',
    title: 'Marginální příjem a derivace',
    question:
      'Příjmová funkce technologické firmy je dána vztahem R(q) = 500q - 2q², kde q je počet prodaných licencí. Urči marginální příjem (hodnotu derivace R\'(q)) při prodeji q = 50 licencí.',
    realWorldContext:
      'Derivace popisují okamžitou míru změny. V mikroekonomii je mezní příjem (marginální veličina) základem pro stanovení optimálního objemu produkce a tržní rovnováhy.',
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
    schoolType: 'university',
    topic: 'matrices',
    topicName: 'Lineární algebra: Determinant matice 2x2',
    title: 'Determinant matice v 3D transformacích',
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

export {
  QuestionBank,
  questionBank,
  getQuestionBankStats,
  getCurriculumTopicsForSchool,
  getArchetypeCountForSchool,
  generateCurriculumProblem,
} from './problemGenerator';
import { generateCurriculumProblem } from './problemGenerator';

// Unified entry point with anti-repeat memory across all Czech curricula & CERMAT standards
export function generateDynamicProblem(
  grade: GradeLevel,
  topic?: TopicCategory,
  schoolType?: SchoolType,
  studentId?: string,
  gradeYear?: number
): Problem {
  return generateCurriculumProblem(grade, topic, schoolType, studentId, gradeYear);
}

