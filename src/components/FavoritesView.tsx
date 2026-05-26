import { Star } from 'lucide-react';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { flatItems } from '../lib/loadData';

type Props = { onSelect: (id: string) => void };

export function FavoritesView({ onSelect }: Props) {
  const { ids } = useFavoritesContext();
  const items = flatItems.filter((i) => ids.has(i.id));

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center">
        <Star size={48} className="mx-auto text-neutral-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Henüz favorin yok</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Bir soruyu favorilere eklemek için sağ üstündeki yıldıza tıkla.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Star className="fill-yellow-400 text-yellow-400" />
        Favoriler ({items.length})
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="text-left p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
          >
            <div className="text-xs text-neutral-500 mb-1">
              {item.categoryTitle} › {item.subcategoryTitle}
            </div>
            <div className="font-medium">{item.question}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
