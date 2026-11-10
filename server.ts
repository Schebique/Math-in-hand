import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

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

// Socratic AI Hint Endpoint
app.post('/api/socratic-hint', async (req, res) => {
  try {
    const { problem, userAnswer, studentGrade, previousHints } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Chybí zadání příkladu.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response when GEMINI_API_KEY is not configured yet
      const fallbackHints = problem.hints && problem.hints.length > 0
        ? problem.hints
        : [
            'Zkontroluj si úpravu rovnice na obou stranách a dávej pozor na znaménka.',
            'Přemýšlej o tom, jaký základní vzorec nebo vztah zde propojuje zadané veličiny.',
            'Zkus si zkontrolovat převod jednotek nebo zaokrouhlení mezivýsledků.',
          ];
      const hintIndex = (previousHints?.length || 0) % fallbackHints.length;
      return res.json({
        hint: fallbackHints[hintIndex],
        guidingQuestion: 'Jaký je tvůj první mezikrok při rozboru tohoto zadání?',
        encouragement: 'Nevzdávej to, každá chyba tě posouvá k pochopení principu!',
        isOfflineFallback: true,
      });
    }

    const studentContext =
      studentGrade === 'lyceum_2'
        ? 'studentka 2. ročníku obchodního lycea (připravuje se na ekonomické obory, oceňuje praktické uplatnění v byznysu a financích)'
        : studentGrade === 'grade_9'
        ? 'žák 9. třídy základní školy připravující se na přijímací zkoušky CERMAT'
        : 'vysokoškolský student technického či ekonomického směru';

    const prompt = `
Zadání příkladu: "${problem.title}" - ${problem.question}
Praktické uplatnění v reálném životě: ${problem.realWorldContext || 'Aplikace v praxi a logickém uvažování'}
Správné řešení (pro tvou interní kontrolu, NIKDY ho neprozraď): ${problem.correctAnswer} ${problem.unit || ''}
Odpověď studenta, která byla nesprávná: "${userAnswer || 'Nevím jak začít'}"
Předchozí udělené nápovědy v této úloze: ${JSON.stringify(previousHints || [])}

Student je: ${studentContext}.

Úkol:
1. Poskytni laskavou, sokratovskou nápovědu.
2. NIKDY neprozraď výsledek (${problem.correctAnswer}) ani konečný číselný krok!
3. Zaměř se na to, kde mohl vzniknout logický zádrhel a polož JEDNU přemýšlivou otázku na mezikrok nebo vzorec.
4. Krátce studenta povzbuď.

Vrať odpověď jako čistý validní JSON objekt bez markdownu okolo:
{
  "hint": "krátké vysvětlení principu nebo varování před častou chybou",
  "guidingQuestion": "jedna konkrétní otázka k mezikroku, která studenta navede",
  "encouragement": "krátká povzbuzující věta"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        hint: text.trim(),
        guidingQuestion: 'Zkus si projít postup od začátku a zkontrolovat jednotlivé kroky.',
        encouragement: 'Jsi na dobré cestě, pokračuj!',
      };
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Chyba při generování sokratovské nápovědy:', error);
    return res.status(500).json({
      hint: 'Zkus si ještě jednou pozorně projít zadání a rozepsat jednotlivé zadané hodnoty.',
      guidingQuestion: 'Který vzorec ti spojuje zadané veličiny se hledanou hodnotou?',
      encouragement: 'V klidu pokračuj, matematika chce jen správný úhel pohledu!',
      isOfflineFallback: true,
    });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Dev vs Production static handling
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
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
  console.log(`MathHero Server běžící na http://0.0.0.0:${PORT}`);
});
