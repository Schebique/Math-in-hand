# MathHero: Inteligentní matematický trenažér s AI průvodcem

Aplikace pro procvičování matematiky s automatickým generováním příkladů pro střední i základní školy (2. ročník obchodního lycea a 9. třída CERMAT), doplněná o sokratovskou AI nápovědu, Duolingo gamifikaci, rodičovský dashboard s časovými limity a exportem reportů do PDF, a plný offline PWA režim s tmavým tématem.

## Uživatelské volby a klíčová rozhodnutí

> [!IMPORTANT]
> Na základě vašich odpovědí jsme specifikovali klíčové pilíře aplikace:

- **Potvrzená cílová skupina a profily studentů**: 
  - Primární profil pro dceru: **2. ročník obchodního lycea** (lineární a kvadratické funkce, finanční matematika a procenta, posloupnosti, základy pravděpodobnosti a statistiky, analytická geometrie, matice).
  - Sekundární profil pro syna: **9. třída ZŠ / CERMAT přijímací zkoušky** (početní operace, zlomky, poměry, lineární rovnice a soustavy, slovní úlohy, planimetrie a tělesa).
  - Pokročilá volitelná úroveň: **VŠ matematika** (diferenciální a integrální počet, lineární algebra).
- **Gamifikační systém ve stylu Duolingo**:
  - Zisk mincí (MathCoins), XP bodů, denní série (Streak) s ochranou zmrazení (Streak Freeze).
  - Výběr a kustomizace avatarů (student, vědec, astronaut, čaroděj čísel atd.).
  - Žebříčky (Týdenní liga: Bronzová, Stříbrná, Zlatá, Diamantová).
  - Tematické odznaky (např. *Mistr zlomků*, *Finanční guru*, *Noční sova*, *Nezlomná série 7 dní*).
- **Praktické využití v reálném životě („K čemu je to v praxi dobré?“)**:
  - U každého tématu i konkrétního příkladu bude jasný reálný kontext a vysvětlení praktického smyslu dané matematické dovednosti:
    - *Pro obchodní lyceum (dcera)*: složené úročení a inflace, optimalizace firemních nákladů a marží, analýza ziskovosti, vyhodnocování rizik a pravděpodobností, modelování trendů růstu.
    - *Pro 9. třídu / CERMAT (syn)*: slevy a DPH v obchodech, rozpočty a poměry při stavbě či vaření, výpočet spotřeby paliva a průměrné rychlosti, výpočty plochy a materiálů (obklady, koberce).
    - *Pro VŠ matematiku*: šifrování dat, strojové učení a AI optimalizace, predikční křivky a fyzikální simulace.
- **Sokratovský AI mentor (Gemini 3.8 Flash)**:
  - Trpělivý kouč, který při chybě **nikdy neprozradí výsledek**. Místo toho položí 1–2 návodné otázky, zkontroluje mezikrok nebo připomene klíčový matematický princip.
- **Rodičovská kontrola a reporty**:
  - PINem chráněný rodičovský dashboard.
  - Nastavení denních časových limitů a obtížnosti.
  - Přehledné grafy úspěšnosti podle témat.
  - Generování a okamžité stažení **PDF reportu pro učitele** se souhrnem zvládnutých témat a detailních chyb.
- **Offline-first PWA & Cloud synchronizace**:
  - Funguje zcela offline díky Service Workeru a vestavěné procedurální databázi stovek typů příkladů.
  - Cloud synchronizace profilů mezi telefonem (iOS/Android) a počítačem přes exportní/importní kód a synchronizační cloudový profil.
- **Spaced Repetition (Rozložené opakování)**:
  - Algoritmus SM-2 (Leitner systém) automaticky zařazuje příklady, ve kterých student dříve chyboval, do doporučených revizí po 1, 3 a 7 dnech.

---

## 1. Přehled a hlavní koncept

Aplikace funguje jako adaptivní digitální doučovatel matematiky navržený speciálně pro potřeby rodiny. Student (dcera nebo syn) se může okamžitě pustit do procvičování přizpůsobeného svému ročníku, získávat okamžitou zpětnou vazbu a herní odměny.

Když student udělá chybu, aplikace nezobrazí suché "Špatně, správně je X", ale aktivuje **AI Sokratovského průvodce**, který studenta navede k uvědomění si chyby v logickém postupu.

Rodič má k dispozici samostatný přehled o tom, jak často a s jakou úspěšností děti trénují, kolik času u matematiky strávily, které oblasti jim dělají potíže, a může jedním kliknutím vygenerovat formální tiskový PDF report pro učitele matematiky.

---

## 2. Uživatelské rozhraní a vizuální design

### Klíčové toky (User Flows)
1. **Výběr profilu a tématu**: Rychlé přepnutí mezi profilem dcery (Obchodní lyceum), syna (9. třída CERMAT) a rodičem.
2. **Tréninková relace**:
   - Zobrazení přehledného zadání příkladu s matematickým formátováním.
   - Možnost psát výsledek nebo mezikrok.
   - Okamžité vyhodnocení s vizuální oslavou (zvukové efekty / konfety při úspěchu, body a mince).
   - Při chybě se otevře diskrétní sokratovská záložka: AI nabídne nápovědu a otázku na zamyšlení.
3. **Denní mise & Obchod s odměnami**:
   - Plnění 3 denních úkolů (např. *Vyřeš 5 rovnic*, *Udrž sérii*, *Procvič slabá místa*).
   - Útrata mincí za nové avatary a doplňky.
4. **Rozložené opakování (Spaced Repetition)**:
   - Sekce *„K procvičení dnes“* s příklady, které potřebují zopakovat podle křivky zapomínání.
5. **Rodičovský panel**:
   - Bezpečný přístup přes 4místný PIN.
   - Detailní metriky (čas studia, počet vyřešených úloh, procentuální úspěšnost podle témat).
   - Nastavení časovače (např. limit 30 minut denně nebo cíl 20 minut).
   - Tlačítko pro vygenerování a export PDF reportu pro učitele.

### Vizuální identita a téma
- **Barevná paleta (60-30-10)**:
  - *Světlý režim*: Čistý jemně šedobílý podklad (`#F8FAFC`), bílé karty se subtilními rámečky (`#E2E8F0`), akcenty v barvě svěží smaragdové zelené (`#10B981` pro úspěch a růst), energické safírové modré (`#2563EB` pro navigaci) a zlaté (`#F59E0B` pro mince a hvězdy).
  - *Tmavý režim pro večerní studium*: Hluboká břidlicová (`#0B0F19`), zvýšené povrchy karet (`#151D2F`), decentní rámečky (`#1E293B`) s plnou podporou `@custom-variant dark`.
- **Typografie**:
  - Moderní přátelské písmo pro nadpisy a herní prvky (`Outfit` / `Plus Jakarta Sans`).
  - Jasně čitelné číslice a vzorce (`tabular-nums`, matematický serif a přehledné zlomky/mocniny).
- **Mobilní ergonomie (iOS & Android)**:
  - Spodní navigační lišta (Procvičování, Opakování, Žebříček, Obchod, Rodič).
  - Dotykové prvky minimálně 48px pro pohodlné ovládání jednou rukou na mobilu.
  - Responzivní přechod na velký 2-sloupcový layout na tabletu a počítači.

---

## 3. Klíčová produktová rozhodnutí a architektura

### Rozhodnutí 1: Generování příkladů – hybridní deterministický engine + AI rozšíření
- **Zvolený přístup**: Klientský deterministický matematický generátor s desítkami šablon a náhodnými parametry doplněný o možnost generování úloh přes Gemini.
- **Důvod**: Umožňuje **100% offline provoz** bez internetu v metru či na cestách, okamžité načtení bez latence a přesnou kontrolu nad správným matematickým výsledkem.

### Rozhodnutí 2: Sokratovský asistent bez prozrazování výsledků
- **Zvolený přístup**: Gemini 3.8 Flash volaný přes serverový Express endpoint `/api/socratic-hint`. Prompt je striktně instruován v češtině chovat se jako trpělivý učitel, který studenta směřuje k mezikroku, aniž by prozradil konečné číslo. V offline režimu aplikace nabízí předpřipravené stupňovité nápovědy (Krok 1, Krok 2).

### Rozhodnutí 3: Export reportu pro učitele do PDF
- **Zvolený přístup**: Čisté generování standardního PDF dokumentu na klientovi (pomocí strukturovaného tiskového layoutu a jsPDF/HTML tiskové šablony).
- **Důvod**: Okamžité vygenerování bezpečně v prohlížeči bez odesílání osobních údajů studenta na externí tiskové servery, formát A4 připravený k tisku nebo zaslání e-mailem učiteli.

---

## 4. Technická architektura a datová strategie

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UŽIVATELSKÉ ROZHRANÍ (PWA)                      │
│                                                                        │
│  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────────────┐  │
│  │ Trénink & Příklad│  │  AI Socratic Chat │  │   Gamifikace & Shop │  │
│  │ (Matematika SŠ/ZŠ│  │   (Otázky/Tipy)   │  │   (XP, Mince, Strek)│  │
│  └────────┬─────────┘  └─────────┬─────────┘  └──────────┬──────────┘  │
│           │                      │                       │             │
│  ┌────────┴─────────┐  ┌─────────┴─────────┐  ┌──────────┴──────────┐  │
│  │  Rozložené opak. │  │ Rodičovský Panel  │  │  Export do PDF      │  │
│  │  (SM-2 Algoritmus│  │ (Limity, Statistiky│  │  (Report pro školu)│  │
│  └────────┬─────────┘  └─────────┬─────────┘  └──────────┬──────────┘  │
└───────────┼──────────────────────┼───────────────────────┼─────────────┘
            ▼                      ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   APLIKAČNÍ STAV & OFFLINE ENGINE                      │
│                                                                        │
│  • Procedurální generátor příkladů (Lyceum 2. roč, ZŠ 9. roč, VŠ)      │
│  • LocalStorage / IndexedDB perzistence se synchronizačním exportem    │
│  • Service Worker & PWA Manifest (Offline cache pro iOS/Android)       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SERVEROVÁ ČÁST (Express / Node.js)                 │
│                                                                        │
│  • POST /api/socratic-hint  ──► Gemini 3.8 Flash (@google/genai)       │
│  • GET  /api/health                                                    │
│  • Statický hosting produkčního PWA buildu                             │
└────────────────────────────────────────────────────────────────────────┘
```

### Datový model
- **StudentProfile**: `id`, `name`, `role` (dcera / syn), `grade` (lyceum / devitka / vs), `xp`, `coins`, `streak`, `lastActiveDate`, `avatarId`, `unlockedBadges`.
- **ProblemDefinition**: `id`, `topic`, `difficulty`, `title`, `question`, `realWorldContext` (konkrétní uplatnění v praxi a byznysu/životě), `correctAnswer`, `unit`, `stepByStepSolution`, `hints` (odstupňované nápovědy).
- **ProblemHistory**: `problemId`, `topic`, `difficulty`, `isCorrect`, `userAnswers`, `hintsUsed`, `timeSpentSec`, `timestamp`, `nextReviewDate`, `interval`, `repetitions`, `easeFactor` (SM-2 parametry).
- **ParentSettings**: `pinCode`, `dailyTimeLimitMinutes`, `allowedTopics`, `difficultyOverrides`.
