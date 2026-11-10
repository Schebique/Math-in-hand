import { jsPDF } from 'jspdf';
import { StudentProfile, ProblemHistoryItem } from '../types';

export function generateTeacherReportPDF(
  student: StudentProfile,
  history: ProblemHistoryItem[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const studentHistory = history.filter((h) => h.studentId === student.id);
  const totalSolved = studentHistory.length;
  const correctCount = studentHistory.filter((h) => h.isCorrect).length;
  const accuracy = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;
  const totalMinutes = Math.round(
    studentHistory.reduce((acc, cur) => acc + (cur.timeSpentSeconds || 60), 0) / 60
  );

  const gradeName =
    student.grade === 'lyceum_2'
      ? '2. ročník – Obchodní lyceum (zaměření na ekonomii a finance)'
      : student.grade === 'grade_9'
      ? '9. třída ZŠ – Příprava na přijímací zkoušky CERMAT'
      : 'Vysoká škola – Aplikovaná matematika';

  // Topic grouping
  const topicStats: Record<string, { total: number; correct: number; name: string }> = {};
  for (const item of studentHistory) {
    if (!topicStats[item.topic]) {
      topicStats[item.topic] = { total: 0, correct: 0, name: item.topicName || item.topic };
    }
    topicStats[item.topic].total += 1;
    if (item.isCorrect) topicStats[item.topic].correct += 1;
  }

  // Draw Header Banner
  doc.setFillColor(16, 185, 129); // Emerald primary
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('MathHero | ZPRÁVA O POKROKU V MATEMATICE', 14, 13);
  doc.setFontSize(10);
  doc.text('Podrobný pedagogický report pro vyučujícího a konzultace', 14, 21);

  // Student details section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.text(`Student: ${student.name}`, 14, 38);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Studijní zaměření: ${gradeName}`, 14, 45);
  doc.text(`Datum vygenerování: ${new Date().toLocaleDateString('cs-CZ')}`, 14, 51);

  // Summary Metrics Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 58, 182, 30, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text('Celkem vyřešeno úloh:', 20, 68);
  doc.setFontSize(14);
  doc.text(`${totalSolved} úloh`, 20, 78);

  doc.setFontSize(10);
  doc.text('Úspěšnost řešení:', 75, 68);
  doc.setFontSize(14);
  doc.text(`${accuracy} %`, 75, 78);

  doc.setFontSize(10);
  doc.text('Odhadovaný čas u úloh:', 130, 68);
  doc.setFontSize(14);
  doc.text(`${totalMinutes + student.todayMinutesStudied} minut`, 130, 78);

  // Table of topics
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Přehled zvládnutí jednotlivých matematických témat:', 14, 100);

  let y = 110;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('TÉMA A DOVEDNOST', 14, y);
  doc.text('POČET ÚLOH', 120, y);
  doc.text('ÚSPĚŠNOST', 160, y);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 2, 196, y + 2);
  y += 8;

  const topicEntries = Object.entries(topicStats);
  if (topicEntries.length === 0) {
    doc.setTextColor(71, 85, 105);
    doc.text('Zatím nebyly uloženy žádné vyřešené úlohy v aktuální relaci.', 14, y);
    y += 10;
  } else {
    for (const [, stat] of topicEntries) {
      const topicPct = Math.round((stat.correct / stat.total) * 100);
      doc.setTextColor(30, 41, 59);
      doc.text(stat.name.substring(0, 55), 14, y);
      doc.text(`${stat.total} ks`, 125, y);
      doc.text(`${topicPct} %`, 165, y);

      y += 8;
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
    }
  }

  // Educational Context & Socratic Note
  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, 182, 34, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Metodická poznámka pro vyučujícího:', 18, y + 8);
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Aplikace MathHero využívá sokratovskou metodu AI vedení. Při chybě student nedostává hotový',
    18,
    y + 15
  );
  doc.text(
    'výsledek, ale je veden návodnými otázkami k odhalení logického principu a reálného využití látky.',
    18,
    y + 21
  );
  doc.text(
    'Rozložené opakování (SM-2) pravidelně zařazuje problematické typy příkladů po 1, 3 a 7 dnech.',
    18,
    y + 27
  );

  // Signatures
  y += 46;
  doc.setDrawColor(148, 163, 184);
  doc.line(20, y + 10, 80, y + 10);
  doc.line(130, y + 10, 190, y + 10);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Podpis zákonného zástupce', 26, y + 15);
  doc.text('Podpis vyučujícího matematiky', 135, y + 15);

  doc.save(`MathHero_Report_${student.name}_${new Date().toISOString().split('T')[0]}.pdf`);
}
