import { RotateCcw, Home } from 'lucide-react';
import type { AnswerRecord } from '../hooks/useInterview';

type Props = {
  history: AnswerRecord[];
  averageScore: number;
  onRestart: () => void;
  onHome: () => void;
};

export function InterviewSummary({ history, averageScore, onRestart, onHome }: Props) {
  return (
    <div className="max-w-xl mx-auto py-16 px-6 text-center">
      <h1 className="text-2xl font-bold mb-6">Mülakat Özeti</h1>

      <div className="flex justify-center gap-10 mb-8">
        <div>
          <div className="text-4xl font-bold">{history.length}</div>
          <div className="text-sm text-neutral-500">cevaplanan soru</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">%{averageScore}</div>
          <div className="text-sm text-neutral-500">ortalama skor</div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          <RotateCcw size={18} /> Yeni oturum
        </button>
        <button
          onClick={onHome}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <Home size={18} /> Ana sayfa
        </button>
      </div>
    </div>
  );
}
