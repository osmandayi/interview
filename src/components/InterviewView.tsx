import { useEffect, useRef, useState } from 'react';
import { Send, ArrowRight, Square, Timer, CircleCheck, CircleX } from 'lucide-react';
import { renderAnswer } from '../lib/renderAnswer';
import { categoryMeta } from '../lib/categoryMeta';
import { ScoreRing } from './ScoreRing';
import { ProgressBar } from './ProgressBar';
import type { FlatQAItem } from '../types/qa';
import type { ScoreResult } from '../lib/scoring';
import type { InterviewPhase } from '../hooks/useInterview';

type Props = {
  item: FlatQAItem;
  phase: InterviewPhase;
  result: ScoreResult | null;
  remaining: number;
  answered: number;
  timeLimit: number; // saniye; 0 = sınırsız
  onSubmit: (text: string) => void;
  onNext: () => void;
  onEnd: () => void;
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Not: Bu bileşen her soru için `key={item.id}` ile yeniden mount edilir,
// böylece metin, süre ve uyarı durumları kendiliğinden sıfırlanır.
export function InterviewView({
  item, phase, result, remaining, answered, timeLimit, onSubmit, onNext, onEnd
}: Props) {
  const [text, setText] = useState('');
  const [submittedEmpty, setSubmittedEmpty] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const textRef = useRef(text);
  textRef.current = text;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const answering = phase === 'answering';
  const left = timeLimit > 0 ? Math.max(0, timeLimit - elapsed) : null;

  useEffect(() => {
    if (answering) textareaRef.current?.focus();
    else nextRef.current?.focus();
  }, [answering]);

  useEffect(() => {
    if (!answering) return;
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, [answering]);

  const submit = (value: string, byTimeout = false) => {
    setSubmittedEmpty(value.trim() === '');
    setTimedOut(byTimeout);
    onSubmit(value);
  };

  useEffect(() => {
    if (answering && left === 0) submit(textRef.current, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answering, left]);

  const meta = categoryMeta(item.categoryId);
  const Icon = meta.icon;
  const total = answered + remaining + (answering ? 1 : 0);
  const done = answered;

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-10 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-3 text-xs text-neutral-500">
        <span className="tabular-nums">Soru {answering ? answered + 1 : answered} / {total}</span>
        <ProgressBar value={done} total={total} className="flex-1" />
        <span
          className={`chip tabular-nums ${
            left !== null && left <= 10 && answering
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 animate-pulse'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
          aria-label={left !== null ? 'Kalan süre' : 'Geçen süre'}
        >
          <Timer size={12} /> {formatTime(left ?? elapsed)}
        </span>
      </div>

      <div className="card p-6 md:p-8 animate-fade-in">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`chip ${meta.soft} ${meta.accent}`}><Icon size={13} /> {item.categoryTitle}</span>
          <span className="text-xs text-neutral-500">{item.subcategoryTitle}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-5">{item.question}</h1>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (answering && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              submit(text);
            }
          }}
          disabled={!answering}
          rows={7}
          placeholder="Cevabını buraya yaz…"
          className="input text-[15px] leading-7 resize-y disabled:opacity-70"
        />

        {answering && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={() => submit(text)} className="btn-primary px-5">
              <Send size={17} /> Gönder
            </button>
            <button onClick={onEnd} className="btn-secondary">
              <Square size={15} /> Bitir
            </button>
            <span className="ml-auto text-xs text-neutral-400 hidden sm:inline">
              <kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">Enter</kbd> gönder
            </span>
          </div>
        )}
      </div>

      {!answering && result && (
        <div className="mt-5 space-y-5 animate-fade-in">
          <div className="card p-6 flex flex-col sm:flex-row gap-6 sm:items-center">
            <ScoreRing score={result.score} label={`${result.matched.length}/${result.matched.length + result.missed.length} kelime`} />
            <div className="flex-1 space-y-4">
              {timedOut && (
                <div className="text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">
                  Süre doldu — yazdığın kadarı gönderildi.
                </div>
              )}
              {submittedEmpty && (
                <div className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                  Boş cevap gönderdin — bu yüzden skor %0. Bildiğin kadarını yazmayı dene.
                </div>
              )}
              <KeywordGroup title="Yakaladıkların" words={result.matched} tone="good" />
              <KeywordGroup title="Kaçırdıkların" words={result.missed} tone="bad" />
            </div>
          </div>

          <div className="card p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="eyebrow">Gerçek cevap</div>
              {result.matched.length > 0 && (
                <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <mark className="rounded px-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200">vurgulu</mark>
                  = yakaladığın kelimeler
                </span>
              )}
            </div>
            <div>{renderAnswer(item.answer, { highlight: result.matched })}</div>
          </div>

          <div className="flex flex-wrap gap-3">
            {remaining > 0 ? (
              <button ref={nextRef} onClick={onNext} className="btn-primary px-5">
                Sonraki soru <ArrowRight size={17} />
              </button>
            ) : (
              <span className="text-sm text-neutral-500 self-center">Havuzdaki tüm sorular bitti.</span>
            )}
            <button onClick={onEnd} className="btn-secondary">
              <Square size={15} /> Bitir ve özeti gör
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function KeywordGroup({ title, words, tone }: { title: string; words: string[]; tone: 'good' | 'bad' }) {
  if (words.length === 0) return null;
  const good = tone === 'good';
  const Icon = good ? CircleCheck : CircleX;
  return (
    <div>
      <div className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1">
        <Icon size={13} className={good ? 'text-emerald-500' : 'text-rose-500'} /> {title} ({words.length})
      </div>
      <div className="flex flex-wrap gap-1.5">
        {words.map((k) => (
          <span
            key={k}
            className={`chip ${
              good
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
            }`}
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
