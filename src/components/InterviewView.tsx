import { useState } from 'react';
import { Send, ArrowRight, Square } from 'lucide-react';
import { renderAnswer } from '../lib/renderAnswer';
import type { FlatQAItem } from '../types/qa';
import type { ScoreResult } from '../lib/scoring';
import type { InterviewPhase } from '../hooks/useInterview';

type Props = {
  item: FlatQAItem;
  phase: InterviewPhase;
  result: ScoreResult | null;
  remaining: number;
  onSubmit: (text: string) => void;
  onNext: () => void;
  onEnd: () => void;
};

function scoreColor(score: number): string {
  if (score >= 70) return 'text-green-600 dark:text-green-400';
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function InterviewView({ item, phase, result, remaining, onSubmit, onNext, onEnd }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    onSubmit(text);
  };

  const handleNext = () => {
    setText('');
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-xs text-neutral-500 mb-2">
        {item.categoryTitle} › {item.subcategoryTitle}
        {' · '}Kalan soru: {remaining}
      </div>
      <h1 className="text-xl font-semibold mb-4">{item.question}</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={phase === 'feedback'}
        rows={6}
        placeholder="Cevabını buraya yaz..."
        className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 disabled:opacity-60 mb-4"
      />

      {phase === 'answering' && (
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            <Send size={18} /> Gönder
          </button>
          <button
            onClick={onEnd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Square size={16} /> Bitir
          </button>
        </div>
      )}

      {phase === 'feedback' && result && (
        <div className="mt-2">
          <div className="flex items-baseline gap-3 mb-4">
            <span className={`text-4xl font-bold ${scoreColor(result.score)}`}>
              %{result.score}
            </span>
            <span className="text-sm text-neutral-500">
              {result.matched.length}/{result.matched.length + result.missed.length} anahtar kelime
            </span>
          </div>

          {result.matched.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-neutral-500 mb-1">Yakaladıkların</div>
              <div className="flex flex-wrap gap-2">
                {result.matched.map((k) => (
                  <span key={k} className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missed.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-medium text-neutral-500 mb-1">Kaçırdıkların</div>
              <div className="flex flex-wrap gap-2">
                {result.missed.map((k) => (
                  <span key={k} className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mb-5">
            <div className="text-xs font-medium text-neutral-500 mb-2">Gerçek cevap</div>
            <div>{renderAnswer(item.answer)}</div>
          </div>

          <div className="flex gap-3">
            {remaining > 0 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Sonraki soru <ArrowRight size={18} />
              </button>
            ) : (
              <span className="text-sm text-neutral-500 self-center">Havuzdaki tüm sorular bitti.</span>
            )}
            <button
              onClick={onEnd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <Square size={16} /> Bitir ve özeti gör
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
