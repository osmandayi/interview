import { useEffect, useMemo } from 'react';
import { RotateCcw, Home, TrendingDown, Trophy } from 'lucide-react';
import type { AnswerRecord } from '../hooks/useInterview';
import { findItemById } from '../lib/loadData';
import { saveSession } from '../lib/sessions';
import { ScoreRing, scoreTone } from './ScoreRing';
import { ProgressBar } from './ProgressBar';

type Props = {
  history: AnswerRecord[];
  averageScore: number;
  sessionId: string | null;
  scopeLabel: string;
  onRestart: () => void;
  onHome: () => void;
  onOpenQuestion: (id: string) => void;
};

type TopicStat = { id: string; title: string; category: string; count: number; avg: number; worstItemId: string };

export function InterviewSummary({
  history, averageScore, sessionId, scopeLabel, onRestart, onHome, onOpenQuestion
}: Props) {
  // Oturumu geçmişe kaydet (aynı id ile tekrar kaydedilmez).
  useEffect(() => {
    if (!sessionId || history.length === 0) return;
    saveSession({
      id: sessionId,
      finishedAt: Date.now(),
      scope: scopeLabel,
      count: history.length,
      average: averageScore
    });
  }, [sessionId, history.length, averageScore, scopeLabel]);

  const topics = useMemo<TopicStat[]>(() => {
    const map = new Map<string, { title: string; category: string; scores: number[]; worst: { id: string; score: number } }>();
    for (const rec of history) {
      const item = findItemById(rec.itemId);
      if (!item) continue;
      const entry = map.get(item.subcategoryId) ?? {
        title: item.subcategoryTitle,
        category: item.categoryTitle,
        scores: [],
        worst: { id: item.id, score: Infinity }
      };
      entry.scores.push(rec.score);
      if (rec.score < entry.worst.score) entry.worst = { id: item.id, score: rec.score };
      map.set(item.subcategoryId, entry);
    }
    return Array.from(map, ([id, e]) => ({
      id,
      title: e.title,
      category: e.category,
      count: e.scores.length,
      avg: Math.round(e.scores.reduce((a, b) => a + b, 0) / e.scores.length),
      worstItemId: e.worst.id
    })).sort((a, b) => a.avg - b.avg);
  }, [history]);

  const best = history.length > 0 ? Math.max(...history.map((h) => h.score)) : 0;

  return (
    <div className="max-w-2xl mx-auto py-10 md:py-16 px-4 md:px-6 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Mülakat Özeti</h1>
      <p className="text-sm text-neutral-500 mb-6">{scopeLabel}</p>

      <div className="card p-6 flex flex-col sm:flex-row items-center gap-6 mb-5">
        <ScoreRing score={averageScore} size={128} label="ortalama" />
        <div className="grid grid-cols-2 gap-6 flex-1 w-full">
          <Stat value={String(history.length)} label="cevaplanan soru" />
          <Stat value={`%${best}`} label="en iyi skor" icon={<Trophy size={14} className="text-amber-500" />} />
        </div>
      </div>

      {topics.length > 0 && (
        <div className="card p-6 mb-6">
          <div className="eyebrow mb-4 flex items-center gap-1.5">
            <TrendingDown size={13} /> Konulara göre (en zayıftan güçlüye)
          </div>
          <ul className="space-y-4">
            {topics.map((t, i) => (
              <li key={t.id}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <div className="min-w-0">
                    <span className="text-sm font-medium">{t.title}</span>
                    <span className="text-xs text-neutral-500"> · {t.category} · {t.count} soru</span>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${scoreTone(t.avg).text}`}>%{t.avg}</span>
                </div>
                <ProgressBar value={t.avg} total={100} />
                {i < 3 && t.avg < 70 && (
                  <button
                    onClick={() => onOpenQuestion(t.worstItemId)}
                    className="mt-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    En düşük skorlu soruyu tekrar oku →
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={onRestart} className="btn-primary px-5">
          <RotateCcw size={17} /> Yeni oturum
        </button>
        <button onClick={onHome} className="btn-secondary">
          <Home size={17} /> Ana sayfa
        </button>
      </div>
    </div>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="text-center sm:text-left">
      <div className="text-3xl font-bold tabular-nums flex items-center gap-1.5 justify-center sm:justify-start">
        {value} {icon}
      </div>
      <div className="text-sm text-neutral-500">{label}</div>
    </div>
  );
}
