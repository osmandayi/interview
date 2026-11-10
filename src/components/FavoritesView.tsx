import { Star, ArrowRight } from 'lucide-react';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { flatItems } from '../lib/loadData';
import { categoryMeta } from '../lib/categoryMeta';

type Props = { onSelect: (id: string) => void };

export function FavoritesView({ onSelect }: Props) {
  const { ids } = useFavoritesContext();
  const items = flatItems.filter((i) => ids.has(i.id));

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center animate-fade-in">
        <span className="mx-auto mb-5 grid place-items-center h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20">
          <Star size={30} className="text-amber-400" />
        </span>
        <h2 className="text-xl font-semibold mb-2">Henüz favorin yok</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Bir soruyu favorilere eklemek için yıldıza tıkla ya da soru açıkken <kbd className="kbd">F</kbd> tuşuna bas.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-10 px-4 md:px-6 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
        <Star className="fill-amber-400 text-amber-400" />
        Favoriler <span className="text-neutral-400 font-medium">({items.length})</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const meta = categoryMeta(item.categoryId);
          const Icon = meta.icon;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)} className="card-interactive p-4 text-left group">
              <div className="flex items-center gap-2 mb-2">
                <span className={`chip ${meta.soft} ${meta.accent}`}><Icon size={12} /> {item.categoryTitle}</span>
                <span className="text-xs text-neutral-500 truncate">{item.subcategoryTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium flex-1">{item.question}</span>
                <ArrowRight size={16} className="text-neutral-300 group-hover:text-brand-500 transition" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
