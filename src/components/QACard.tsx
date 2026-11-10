import { Star, CircleCheck, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { useProgressContext } from '../contexts/ProgressContext';
import { renderAnswer } from '../lib/renderAnswer';
import { categoryMeta } from '../lib/categoryMeta';
import type { FlatQAItem } from '../types/qa';

type Props = {
  item: FlatQAItem;
  position: { index: number; total: number };
  prev: FlatQAItem | null;
  next: FlatQAItem | null;
  onNavigate: (id: string) => void;
};

export function QACard({ item, position, prev, next, onNavigate }: Props) {
  const { toggle, isFavorite } = useFavoritesContext();
  const { toggleRead, isRead } = useProgressContext();
  const fav = isFavorite(item.id);
  const read = isRead(item.id);
  const meta = categoryMeta(item.categoryId);
  const Icon = meta.icon;

  return (
    <div className="animate-fade-in" key={item.id}>
      <article className="card p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`chip ${meta.soft} ${meta.accent}`}>
            <Icon size={13} /> {item.categoryTitle}
          </span>
          <span className="text-xs text-neutral-500">{item.subcategoryTitle}</span>
          <span className="ml-auto text-xs text-neutral-400 tabular-nums">
            {position.index + 1} / {position.total}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold tracking-tight flex-1 text-neutral-900 dark:text-neutral-50">
            {item.question}
          </h1>
          <button
            onClick={() => toggle(item.id)}
            aria-label={fav ? 'Favoriden çıkar' : 'Favoriye ekle'}
            title="Favori (F)"
            className="btn-ghost shrink-0"
          >
            <Star size={20} className={fav ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'} />
          </button>
        </div>

        <div>{renderAnswer(item.answer)}</div>

        {item.tags && item.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="chip bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center gap-3">
          <button
            onClick={() => toggleRead(item.id)}
            title="Okundu (M)"
            className={
              read
                ? 'btn bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                : 'btn-secondary'
            }
          >
            {read ? <CircleCheck size={16} /> : <Circle size={16} />}
            {read ? 'Okundu' : 'Okundu olarak işaretle'}
          </button>
          <span className="text-xs text-neutral-400 hidden sm:inline">
            <kbd className="kbd">M</kbd> okundu · <kbd className="kbd">F</kbd> favori
          </span>
        </div>
      </article>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <NavButton dir="prev" item={prev} onNavigate={onNavigate} />
        <NavButton dir="next" item={next} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function NavButton({
  dir, item, onNavigate
}: { dir: 'prev' | 'next'; item: FlatQAItem | null; onNavigate: (id: string) => void }) {
  if (!item) return <div />;
  const isNext = dir === 'next';
  return (
    <button
      onClick={() => onNavigate(item.id)}
      className={`card-interactive p-4 flex items-center gap-3 ${isNext ? 'col-start-2 text-right flex-row-reverse' : ''}`}
    >
      {isNext ? <ChevronRight size={18} className="shrink-0 text-neutral-400" /> : <ChevronLeft size={18} className="shrink-0 text-neutral-400" />}
      <div className="min-w-0">
        <div className="text-xs text-neutral-500 mb-0.5">
          {isNext ? 'Sonraki' : 'Önceki'} <kbd className="kbd ml-1">{isNext ? '→' : '←'}</kbd>
        </div>
        <div className="text-sm font-medium truncate">{item.question}</div>
      </div>
    </button>
  );
}
