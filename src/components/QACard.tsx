import { Star } from 'lucide-react';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { renderAnswer } from '../lib/renderAnswer';
import type { FlatQAItem } from '../types/qa';

type Props = { item: FlatQAItem };

export function QACard({ item }: Props) {
  const { toggle, isFavorite } = useFavoritesContext();
  const fav = isFavorite(item.id);

  return (
    <article className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
      <div className="text-xs text-neutral-500 mb-2">
        {item.categoryTitle} › {item.subcategoryTitle}
      </div>

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-xl font-semibold flex-1">{item.question}</h1>
        <button
          onClick={() => toggle(item.id)}
          aria-label={fav ? 'Favoriden çıkar' : 'Favoriye ekle'}
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <Star
            size={20}
            className={fav ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'}
          />
        </button>
      </div>

      <div>{renderAnswer(item.answer)}</div>

      {item.tags && item.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
