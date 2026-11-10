import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Star, Mic, Search, X, CircleCheck } from 'lucide-react';
import { qaData } from '../lib/loadData';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { useProgressContext } from '../contexts/ProgressContext';
import { ProgressBar } from './ProgressBar';
import type { Category } from '../types/qa';

export const ALL_CATEGORIES = 'all';

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  view: 'qa' | 'favorites' | 'other';
  onFavorites: () => void;
  onInterview: () => void;
  categoryTab: string;
  onCategoryTab: (id: string) => void;
  onClose: () => void;
};

const TR_FOLD: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };

function fold(s: string): string {
  return s
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşü]/g, (c) => TR_FOLD[c] ?? c);
}

export function Sidebar({
  selectedId, onSelect, view, onFavorites, onInterview, categoryTab, onCategoryTab, onClose
}: Props) {
  const { ids: favIds } = useFavoritesContext();
  const { isRead, countRead } = useProgressContext();
  const [filter, setFilter] = useState('');
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());

  const categories: Category[] = useMemo(
    () =>
      categoryTab === ALL_CATEGORIES
        ? qaData.categories
        : qaData.categories.filter((c) => c.id === categoryTab),
    [categoryTab]
  );

  // Seçili sorunun bulunduğu alt kategoriyi otomatik aç.
  useEffect(() => {
    if (!selectedId) return;
    for (const cat of qaData.categories) {
      for (const sub of cat.subcategories) {
        if (sub.items.some((i) => i.id === selectedId)) {
          setOpenSubs((prev) => (prev.has(sub.id) ? prev : new Set(prev).add(sub.id)));
          return;
        }
      }
    }
  }, [selectedId]);

  const q = fold(filter.trim());
  const filtering = q.length > 0;

  const visible = useMemo(
    () =>
      categories
        .map((cat) => ({
          cat,
          subs: cat.subcategories
            .map((sub) => ({
              sub,
              items: filtering ? sub.items.filter((i) => fold(i.question).includes(q)) : sub.items
            }))
            .filter((s) => s.items.length > 0)
        }))
        .filter((c) => c.subs.length > 0),
    [categories, filtering, q]
  );

  const scopeIds = categories.flatMap((c) => c.subcategories.flatMap((s) => s.items.map((i) => i.id)));
  const scopeRead = countRead(scopeIds);

  const toggleSub = (id: string) =>
    setOpenSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const tabs = [{ id: ALL_CATEGORIES, title: 'Tümü' }, ...qaData.categories.map((c) => ({ id: c.id, title: c.title }))];

  return (
    <nav className="w-full md:w-80 h-full flex flex-col bg-white dark:bg-neutral-900 md:border-r border-neutral-200 dark:border-neutral-800">
      {/* Mobil tutamaç + kapat */}
      <div className="md:hidden relative flex items-center px-4 pt-3 pb-1">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <button onClick={onClose} aria-label="Menüyü kapat" className="btn-ghost absolute right-3 top-2">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-3 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onFavorites}
            className={`btn justify-start px-3 py-2 ${
              view === 'favorites'
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Star size={16} className={view === 'favorites' ? 'fill-amber-400 text-amber-400' : 'text-amber-500'} />
            Favoriler
            <span className="ml-auto text-xs text-neutral-500">{favIds.size}</span>
          </button>
          <button onClick={onInterview} className="btn justify-start px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <Mic size={16} className="text-emerald-500" />
            Mülakat
          </button>
        </div>

        {/* Kategori sekmeleri */}
        <div role="tablist" aria-label="Kategori" className="flex gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/70 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={categoryTab === t.id}
              onClick={() => onCategoryTab(t.id)}
              className={`flex-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                categoryTab === t.id
                  ? 'bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-neutral-50'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>

        {/* Filtre */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setFilter(''); }}
            placeholder="Menüde filtrele…"
            aria-label="Soruları filtrele"
            className="input pl-9 pr-8 py-1.5"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              aria-label="Filtreyi temizle"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-neutral-400 hover:text-neutral-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>İlerleme</span>
            <span>{scopeRead}/{scopeIds.length} okundu</span>
          </div>
          <ProgressBar value={scopeRead} total={scopeIds.length} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {visible.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-neutral-500">“{filter}” ile eşleşen soru yok.</p>
        )}

        {visible.map(({ cat, subs }) => (
          <div key={cat.id} className="mb-3">
            {categoryTab === ALL_CATEGORIES && (
              <div className="eyebrow px-2 pt-2 pb-1">{cat.title}</div>
            )}
            {subs.map(({ sub, items }) => {
              const open = filtering || openSubs.has(sub.id);
              const subIds = sub.items.map((i) => i.id);
              const read = countRead(subIds);
              return (
                <div key={sub.id} className="mb-1">
                  <button
                    onClick={() => toggleSub(sub.id)}
                    aria-expanded={open}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    {open ? (
                      <ChevronDown size={15} className="text-neutral-400 shrink-0" />
                    ) : (
                      <ChevronRight size={15} className="text-neutral-400 shrink-0" />
                    )}
                    <span className="flex-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">{sub.title}</span>
                    <span
                      className={`chip shrink-0 ${
                        read === subIds.length
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                      }`}
                    >
                      {read}/{subIds.length}
                    </span>
                  </button>

                  {open && (
                    <ul className="ml-4 pl-2 border-l border-neutral-200 dark:border-neutral-800 animate-fade-in">
                      {items.map((item) => {
                        const active = view === 'qa' && selectedId === item.id;
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => onSelect(item.id)}
                              aria-current={active ? 'page' : undefined}
                              className={`w-full flex items-start gap-2 text-left text-sm px-2.5 py-1.5 rounded-lg transition ${
                                active
                                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium'
                                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                              }`}
                            >
                              <span className="flex-1">{item.question}</span>
                              {isRead(item.id) && (
                                <CircleCheck size={14} className="mt-0.5 shrink-0 text-emerald-500" aria-label="Okundu" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
