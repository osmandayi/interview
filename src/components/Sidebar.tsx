import { useState } from 'react';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { qaData } from '../lib/loadData';
import { useFavoritesContext } from '../contexts/FavoritesContext';

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  view: 'qa' | 'favorites';
  onViewChange: (v: 'qa' | 'favorites') => void;
};

export function Sidebar({ selectedId, onSelect, view, onViewChange }: Props) {
  const { ids: favIds } = useFavoritesContext();
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(qaData.categories.map((c) => c.id))
  );

  const toggleCategory = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <nav className="w-full md:w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto h-full">
      <div className="p-4">
        <button
          onClick={() => onViewChange('favorites')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium mb-4 ${
            view === 'favorites'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Star size={16} className={view === 'favorites' ? 'fill-yellow-400 text-yellow-400' : ''} />
          Favoriler ({favIds.size})
        </button>

        {qaData.categories.map((cat) => (
          <div key={cat.id} className="mb-2">
            <button
              onClick={() => toggleCategory(cat.id)}
              className="w-full flex items-center gap-1 px-2 py-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {expanded.has(cat.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {cat.title}
            </button>
            {expanded.has(cat.id) && (
              <div className="ml-2 mt-1">
                {cat.subcategories.map((sub) => (
                  <div key={sub.id} className="mb-2">
                    <div className="text-xs font-medium text-neutral-500 px-2 py-1">{sub.title}</div>
                    <ul>
                      {sub.items.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => { onViewChange('qa'); onSelect(item.id); }}
                            className={`w-full text-left text-sm px-3 py-1.5 rounded transition ${
                              view === 'qa' && selectedId === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            {item.question}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
