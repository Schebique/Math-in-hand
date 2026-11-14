import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security HTTP headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
});

// JSON body parser with size limit to prevent payload bombs
app.use(express.json({ limit: '100kb' }));

// In-Memory Rate Limiter for AI APIs (Max 25 requests / minute per IP)
interface RateRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateRecord>();

const rateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 25;

  let record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(ip, record);
  } else {
    record.count += 1;
  }

  // Periodic cleanup
  if (rateLimitMap.size > 1000) {
    for (const [key, rec] of rateLimitMap.entries()) {
      if (now > rec.resetTime) rateLimitMap.delete(key);
    }
  }

  if (record.count > maxRequests) {
    return res.status(429).json({
      hint: 'Příliš mnoho dotazů za krátký čas. Zkuste se na chvíli zamyslet a pokračovat za minutku.',
      guidingQuestion: 'Zkus si mezitím projít dosavadní kroky na papíře.',
      encouragement: 'V klidu pokračuj, matematika chce trpělivost.',
      isRateLimited: true,
    });
  }

  next();
};

// Input sanitization against Prompt Injection
const sanitizeForPrompt = (text: unknown, maxLength: number): string => {
  if (typeof text !== 'string') return '';
  return text
    .substring(0, maxLength)
    .replace(/[\r\n\t]/g, ' ')
    .replace(/(ignore\s+all\s+instructions|forget\s+all|reveal\s+system|jailbreak|system\s*prompt)/gi, '[filtr]')
    .trim();
};

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout po ${ms} ms`)), ms)
    ),
  ]);

// Initialize Gemini API client safely with official aistudio-build telemetry
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Socratic AI Hint Endpoint with Rate Limiting & Input Sanitization
app.post('/api/socratic-hint', rateLimiter, async (req, res) => {
  try {
    const { problem, userAnswer, studentGrade, previousHints } = req.body;

    if (!problem || typeof problem !== 'object') {
      return res.status(400).json({ error: 'Neplatné zadání příkladu.' });
    }

    // Sanitize all inputs
    const cleanTitle = sanitizeForPrompt(problem.title, 150);
    const cleanQuestion = sanitizeForPrompt(problem.question, 600);
    const cleanContext = sanitizeForPrompt(problem.realWorldContext, 300);
    const cleanUserAnswer = sanitizeForPrompt(userAnswer, 200);
    const safeGrade = sanitizeForPrompt(studentGrade, 50);

    const safePreviousHints = Array.isArray(previousHints)
      ? previousHints.slice(0, 5).map((h) => sanitizeForPrompt(h, 200))
      : [];

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response when GEMINI_API_KEY is not configured
      const fallbackHints = Array.isArray(problem.hints) && problem.hints.length > 0
        ? problem.hints
        : [
            'Zkontroluj si úpravu rovnice na obou stranách a dávej pozor na znaménka.',
            'Přemýšlej o tom, jaký základní vzorec nebo vztah zde propojuje zadané veličiny.',
            'Zkus si zkontrolovat převod jednotek nebo zaokrouhlení mezivýsledků.',
          ];
      const hintIndex = safePreviousHints.length % fallbackHints.length;
      return res.json({
        hint: fallbackHints[hintIndex],
        guidingQuestion: 'Jaký je tvůj první mezikrok při rozboru tohoto zadání?',
        encouragement: 'Nevzdávej to, každá chyba tě posouvá k pochopení principu!',
        isOfflineFallback: true,
      });
    }

    const studentContext =
      safeGrade === 'lyceum_2'
        ? 'studentka 2. ročníku obchodního lycea (zaměření na finance, zisk a marže)'
        : safeGrade === 'grade_9'
        ? 'žák 9. třídy základní školy připravující se na přijímací zkoušky CERMAT'
        : safeGrade === 'primary_mid'
        ? 'žák 2. stupně základní školy (6.–8. třída)'
        : safeGrade === 'grammar_school'
        ? 'student gymnázia nebo střední odborné školy'
        : 'vysokoškolský student 1. ročníku';

    const prompt = `
Jsi přísně sokratovský pedagogický asistent matematiky pro české školy.
Student je: ${studentContext}.

Zadání: "${cleanTitle}" - ${cleanQuestion}
Reálný kontext: ${cleanContext}
Správné řešení (pro tvou interní kontrolu, NIKDY ho neprozraď): ${problem.correctAnswer || 'neznámé'}
Odpověď studenta: "${cleanUserAnswer || 'nevím jak začít'}"
Předchozí nápovědy: ${JSON.stringify(safePreviousHints)}

BEZPEČNOSTNÍ PRAVIDLA:
1. NIKDY neprozraď výsledek (${problem.correctAnswer}) ani konečný číselný krok.
2. Pokud se student pokouší ptát na řešení, instruuj ho k samostatnému mezikroku.
3. Polož JEDNU přemýšlivou otázku na vzorec nebo postup.
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hint: { type: Type.STRING, description: 'Krátké vysvětlení principu nebo varování před chybou' },
              guidingQuestion: { type: Type.STRING, description: 'Jedna konkrétní otázka k mezikroku' },
              encouragement: { type: Type.STRING, description: 'Krátká povzbuzující věta' },
            },
            required: ['hint', 'guidingQuestion', 'encouragement'],
          },
        },
      }),
      15000,
      'SocraticHint'
    );

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        hint: text.trim().substring(0, 300),
        guidingQuestion: 'Zkus si projít postup od začátku a zkontrolovat jednotlivé kroky.',
        encouragement: 'Jsi na dobré cestě, pokračuj!',
      };
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Bezpečně zachycená chyba při sokratovské nápovědě:', error instanceof Error ? error.message : String(error));
    const problemHints = Array.isArray(req.body?.problem?.hints) ? req.body.problem.hints : [];
    const fallbackHint =
      problemHints[0] ||
      'Zkus si ještě jednou pozorně projít zadání a rozepsat jednotlivé zadané hodnoty.';
    return res.json({
      hint: fallbackHint,
      guidingQuestion: 'Který vzorec ti spojuje zadané veličiny se hledanou hodnotou?',
      encouragement: 'V klidu pokračuj, matematika chce jen správný úhel pohledu!',
      isOfflineFallback: true,
    });
  }
});

// Optional AI Problem Generator Endpoint (Czech RVP / CERMAT / University)
app.post('/api/generate-problem', rateLimiter, async (req, res) => {
  try {
    const { schoolType, grade, gradeYear, topic, recentTitles } = req.body || {};

    const safeSchool = sanitizeForPrompt(schoolType, 40) || 'cermat_prep';
    const safeGrade = sanitizeForPrompt(grade, 40) || 'grade_9';
    const safeYear = typeof gradeYear === 'number' && gradeYear >= 1 && gradeYear <= 12 ? gradeYear : 9;
    const safeTopic = sanitizeForPrompt(topic, 40) || 'all';
    const safeRecent = Array.isArray(recentTitles)
      ? recentTitles.slice(-8).map((t) => sanitizeForPrompt(t, 100))
      : [];

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI generátor není momentálně dostupný.',
        isOfflineFallback: true,
      });
    }

    const schoolDescription =
      safeSchool === 'business_lyceum'
        ? `Obchodní lyceum (${safeYear}. ročník, RVP OA – finanční matematika, úvěry, marže, DPH, bod zvratu, posloupnosti v ekonomii, statistika, optimalizace zisku)`
        : safeSchool === 'cermat_prep'
        ? `Přijímací zkoušky CERMAT JPZ 9. třída ZŠ (lineární rovnice se zlomky, výrazy, pohyb, společná práce, směsi, procenta, Pythagorova věta, složené útvary s kruhy, tělesa a litry)`
        : safeSchool === 'primary_school'
        ? `2. stupeň základní školy (${safeYear}. třída, RVP ZV – zlomky, poměry, měřítko mapy, NSD/NSN, úměrnost, procenta, úhly)`
        : safeSchool === 'university'
        ? `Vysoká škola (${safeYear}. ročník – Matematická analýza MA1 a Lineární algebra: limity, derivace, extrémy, určité integrály, determinanty 2x2/3x3, matice, SLAR, vektory)`
        : `Gymnázium / SOŠ (${safeYear}. ročník, RVP G/SOŠ – kvadratické a exponenciální rovnice, funkce, analytická geometrie, stereometrie, kombinatorika)`;

    const topicInstruction =
      safeTopic && safeTopic !== 'all'
        ? `Zaměř úlohu výhradně na téma "${safeTopic}".`
        : 'Vyber rozmanité téma z daných osnov.';

    const prompt = `
Vytvoř JEDNU originální, matematicky 100% ověřenou českou úlohu s jediným jednoznačným číselným výsledkem.
Úroveň: ${schoolDescription}.
${topicInstruction}
Neopakuj tyto nedávné názvy úloh: ${JSON.stringify(safeRecent)}.

Požadavky:
1. Výsledek (correctAnswer) musí být čisté číslo (např. "450" nebo "12.5" nebo "-3") bez jednotek v poli correctAnswer; jednotku uveď do pole unit (pokud existuje, např. "Kč", "cm²", "%", nebo "").
2. Před zapsáním JSONu si výpočet pečlivě ověř v krocích tak, aby stepByStepSolution přesně sedělo s correctAnswer.
3. Zadání piš srozumitelně v češtině podle stylu českých učebnic a CERMATu.
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Stručný výstižný název úlohy česky' },
              topicName: { type: Type.STRING, description: 'Název tematického okruhu' },
              question: { type: Type.STRING, description: 'Úplné zadání úlohy s jasným dotazem na jeden číselný výsledek' },
              realWorldContext: { type: Type.STRING, description: 'Praktické využití v reálném životě (1–2 věty)' },
              correctAnswer: { type: Type.STRING, description: 'Pouze přesné výsledné číslo jako řetězec (s desetinnou tečkou pokud je desetinné)' },
              unit: { type: Type.STRING, description: 'Jednotka výsledku (např. Kč, km, cm², %, nebo prázdný řetězec)' },
              difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
              stepByStepSolution: { type: Type.STRING, description: 'Podrobný správný postup výpočtu po krocích' },
              hints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 až 3 sokratovské nápovědy, které neprozrazují výsledek',
              },
            },
            required: [
              'title',
              'topicName',
              'question',
              'realWorldContext',
              'correctAnswer',
              'unit',
              'difficulty',
              'stepByStepSolution',
              'hints',
            ],
          },
        },
      }),
      18000,
      'GenerateProblem'
    );

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.question || parsed.correctAnswer === undefined || parsed.correctAnswer === '') {
      throw new Error('Neúplný výstup AI generátoru.');
    }

    const cleanAns = String(parsed.correctAnswer).trim().replace(',', '.');
    const commaAns = cleanAns.replace('.', ',');
    const unitStr = typeof parsed.unit === 'string' ? parsed.unit.trim() : '';

    return res.json({
      id: `ai_${Date.now()}_${Math.floor(Math.random() * 9000) + 1000}`,
      archetypeId: `ai_generated_${safeTopic}`,
      curriculumRef: `AI Generátor · ${safeSchool === 'cermat_prep' ? 'CERMAT JPZ' : safeSchool === 'business_lyceum' ? 'Obchodní lyceum' : 'České osnovy RVP'}`,
      variantSeed: `ai_${parsed.title}`,
      grade: safeGrade,
      schoolType: safeSchool,
      topic: safeTopic !== 'all' ? safeTopic : (safeSchool === 'business_lyceum' ? 'finance' : 'word_problems'),
      topicName: parsed.topicName || 'AI Matematická výzva',
      title: parsed.title,
      question: parsed.question,
      realWorldContext: parsed.realWorldContext,
      correctAnswer: cleanAns,
      acceptableAnswers: Array.from(
        new Set([
          cleanAns,
          commaAns,
          ...(unitStr ? [`${cleanAns} ${unitStr}`, `${commaAns} ${unitStr}`] : []),
        ])
      ),
      unit: unitStr || undefined,
      difficulty: ['easy', 'medium', 'hard'].includes(parsed.difficulty) ? parsed.difficulty : 'medium',
      stepByStepSolution: parsed.stepByStepSolution,
      hints: Array.isArray(parsed.hints) && parsed.hints.length > 0 ? parsed.hints : ['Rozepiš si zadané hodnoty a najdi vztah mezi nimi.'],
      type: 'number',
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Chyba při AI generování příkladu:', errMsg);
    return res.status(500).json({
      error: 'Nepodařilo se vygenerovat AI úlohu.',
      detail: errMsg.slice(0, 180),
      isOfflineFallback: true,
    });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    rateLimitingEnabled: true,
  });
});

// Dev vs Production static handling
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'spa',
  });
  app.get('/@vite/client', async (req, res, next) => {
    try {
      const result = await vite.transformRequest(req.originalUrl);
      if (!result) return next();
      const safeCode = result.code.replace(
        /const transport = normalizeModuleRunnerTransport\(\(\(\) => \{[\s\S]*?\}\)\(\)\);/,
        'const transport = normalizeModuleRunnerTransport({ async connect() {}, async disconnect() {}, send() {} });'
      );
      res.setHeader('Content-Type', 'application/javascript');
      return res.send(safeCode);
    } catch {
      return next();
    }
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MathHero Zabezpečený Server běžící na http://0.0.0.0:${PORT}`);
});
