import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Star, Mic, Search, X, CircleCheck, Layers } from 'lucide-react';
import { qaData } from '../lib/loadData';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { useProgressContext } from '../contexts/ProgressContext';
import { ProgressBar } from './ProgressBar';
import { categoryMeta } from '../lib/categoryMeta';
import type { Category } from '../types/qa';

export const ALL_CATEGORIES = 'all';

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  view: 'qa' | 'favorites' | 'interview' | 'other';
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
  const [scrolled, setScrolled] = useState(false);

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

  const countOf = (c: Category) => c.subcategories.reduce((n, s) => n + s.items.length, 0);
  const tabs = [
    { id: ALL_CATEGORIES, title: 'Tümü', count: qaData.categories.reduce((n, c) => n + countOf(c), 0) },
    ...qaData.categories.map((c) => ({ id: c.id, title: c.title, count: countOf(c) }))
  ];

  return (
    <nav className="w-full md:w-80 h-full flex flex-col bg-white dark:bg-neutral-900 md:border-r border-neutral-200 dark:border-neutral-800">
      {/* Mobil tutamaç + kapat */}
      <div className="md:hidden relative flex items-center px-4 pt-3 pb-1">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <button onClick={onClose} aria-label="Menüyü kapat" className="btn-ghost absolute right-3 top-2">
          <X size={18} />
        </button>
      </div>

      <div
        className={`p-4 space-y-4 border-b transition-shadow ${
          scrolled
            ? 'border-neutral-200 dark:border-neutral-800 shadow-[0_6px_12px_-10px_rgba(0,0,0,0.35)] dark:shadow-[0_6px_12px_-8px_rgba(0,0,0,0.8)]'
            : 'border-neutral-200/80 dark:border-neutral-800'
        }`}
      >
        {/* Hızlı aksiyonlar */}
        <div className="grid grid-cols-2 gap-2">
          <ActionTile
            active={view === 'favorites'}
            onClick={onFavorites}
            label="Favoriler"
            sub={`${favIds.size} soru`}
            tone="amber"
            icon={<Star size={16} className={view === 'favorites' ? 'fill-current' : ''} />}
          />
          <ActionTile
            active={view === 'interview'}
            onClick={onInterview}
            label="Mülakat"
            sub="Canlı pratik"
            tone="emerald"
            icon={<Mic size={16} />}
          />
        </div>

        {/* Kategori sekmeleri — taşmasın diye 2x2 ızgara */}
        <div>
          <div className="eyebrow mb-2">Kategoriler</div>
          <div role="tablist" aria-label="Kategori" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/60">
            {tabs.map((t) => {
              const active = categoryTab === t.id;
              const meta = t.id === ALL_CATEGORIES ? null : categoryMeta(t.id);
              const Icon = meta ? meta.icon : Layers;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => onCategoryTab(t.id)}
                  title={t.title}
                  className={`flex items-center gap-1.5 min-w-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'bg-white dark:bg-neutral-950 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700 text-neutral-900 dark:text-neutral-50'
                      : 'text-neutral-500 dark:text-neutral-400 hover:bg-white/60 dark:hover:bg-neutral-700/50 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <Icon size={13} className={`shrink-0 ${active ? (meta ? meta.accent : 'text-brand-500') : ''}`} />
                  <span className="truncate">{t.title}</span>
                  <span className={`ml-auto tabular-nums text-[10px] ${active ? 'text-neutral-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
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

        <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 px-3 py-2.5">
          <div className="flex items-baseline justify-between text-xs mb-1.5">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">İlerleme</span>
            <span className="tabular-nums text-neutral-500">
              {scopeRead}/{scopeIds.length} ·{' '}
              <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                %{scopeIds.length === 0 ? 0 : Math.round((scopeRead / scopeIds.length) * 100)}
              </span>
            </span>
          </div>
          <ProgressBar value={scopeRead} total={scopeIds.length} />
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto overscroll-contain p-3"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
      >
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

const TILE_TONES = {
  amber: {
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    active: 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10'
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    active: 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
  }
} as const;

function ActionTile({
  active, onClick, label, sub, tone, icon
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  tone: keyof typeof TILE_TONES;
  icon: React.ReactNode;
}) {
  const t = TILE_TONES[tone];
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        active
          ? t.active
          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      <span className={`grid place-items-center h-8 w-8 shrink-0 rounded-lg ${t.icon}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-tight text-neutral-800 dark:text-neutral-100">{label}</span>
        <span className="block text-[11px] text-neutral-500 truncate">{sub}</span>
      </span>
    </button>
  );
}
