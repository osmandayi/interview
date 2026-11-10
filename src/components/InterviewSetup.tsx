import { useState } from 'react';
import { Play, Mic, Timer, Layers } from 'lucide-react';
import { qaData, flatItems } from '../lib/loadData';
import { categoryMeta } from '../lib/categoryMeta';
import type { InterviewFilter } from '../hooks/useInterview';

export const TIME_LIMITS = [0, 60, 120, 180] as const;

type Props = {
  onStart: (filter: InterviewFilter, timeLimit: number) => void;
  error: string | null;
};

export function InterviewSetup({ onStart, error }: Props) {
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<number>(0);

  const category = qaData.categories.find((c) => c.id === categoryId);
  const poolSize = flatItems.filter(
    (i) =>
      (!categoryId || i.categoryId === categoryId) &&
      (!subcategoryId || i.subcategoryId === subcategoryId)
  ).length;

  const pickCategory = (id: string) => {
    setCategoryId(id);
    setSubcategoryId('');
  };

  const handleStart = () => {
    if (subcategoryId) onStart({ subcategoryId }, timeLimit);
    else if (categoryId) onStart({ categoryId }, timeLimit);
    else onStart({}, timeLimit);
  };

  const scopeOptions = [{ id: '', title: 'Tüm havuz' }, ...qaData.categories.map((c) => ({ id: c.id, title: c.title }))];

  return (
    <div className="max-w-2xl mx-auto py-10 md:py-16 px-4 md:px-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <span className="grid place-items-center h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
          <Mic size={20} />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Canlı Mülakat</h1>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        Sistem sana tekrarsız sorular sorar. Cevabını yaz; anahtar kelime kapsamına göre puan al, gerçek
        cevabı yakaladığın kelimeler vurgulanmış şekilde gör.
      </p>

      <div className="card p-5 md:p-6 space-y-6">
        <section>
          <div className="eyebrow mb-3">Kapsam</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {scopeOptions.map((opt) => {
              const meta = opt.id ? categoryMeta(opt.id) : null;
              const Icon = meta ? meta.icon : Layers;
              const active = categoryId === opt.id;
              return (
                <button
                  key={opt.id || 'all'}
                  onClick={() => pickCategory(opt.id)}
                  aria-pressed={active}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left text-sm font-medium transition ${
                    active
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <Icon size={18} className={meta ? meta.accent : 'text-brand-500'} />
                  {opt.title}
                </button>
              );
            })}
          </div>

          {category && (
            <div className="mt-4">
              <label htmlFor="sub" className="block text-sm font-medium mb-1.5">Alt kategori</label>
              <select
                id="sub"
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="input"
              >
                <option value="">{category.title} — tümü</option>
                {category.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.title} ({sub.items.length})</option>
                ))}
              </select>
            </div>
          )}
        </section>

        <section>
          <div className="eyebrow mb-3 flex items-center gap-1.5"><Timer size={13} /> Soru başına süre</div>
          <div className="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/70">
            {TIME_LIMITS.map((t) => (
              <button
                key={t}
                onClick={() => setTimeLimit(t)}
                aria-pressed={timeLimit === t}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  timeLimit === t
                    ? 'bg-white dark:bg-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {t === 0 ? 'Sınırsız' : `${t / 60} dk`}
              </button>
            ))}
          </div>
          {timeLimit > 0 && (
            <p className="mt-2 text-xs text-neutral-500">Süre dolduğunda cevabın otomatik gönderilir.</p>
          )}
        </section>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-sm text-neutral-500">{poolSize} soru</span>
          <button onClick={handleStart} className="btn-primary px-5">
            <Play size={17} /> Başla
          </button>
        </div>
      </div>
    </div>
  );
}
