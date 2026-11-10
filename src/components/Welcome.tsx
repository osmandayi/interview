import { useMemo } from 'react';
import { Search, Star, Mic, ArrowRight, History, BookOpenCheck, CircleCheck } from 'lucide-react';
import { flatItems, qaData, findItemById } from '../lib/loadData';
import { useSearchContext } from '../contexts/SearchContext';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { useProgressContext } from '../contexts/ProgressContext';
import { categoryMeta } from '../lib/categoryMeta';
import { loadSessions } from '../lib/sessions';
import { ProgressBar } from './ProgressBar';
import { scoreTone } from './ScoreRing';

type Props = {
  lastViewedId: string | null;
  onOpenQuestion: (id: string) => void;
  onOpenCategory: (categoryId: string) => void;
  onFavorites: () => void;
  onInterview: () => void;
};

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function Welcome({ lastViewedId, onOpenQuestion, onOpenCategory, onFavorites, onInterview }: Props) {
  const { open } = useSearchContext();
  const { ids: favIds } = useFavoritesContext();
  const { countRead } = useProgressContext();
  const sessions = useMemo(() => loadSessions().slice(0, 5), []);

  const totalRead = countRead(flatItems.map((i) => i.id));
  const totalPct = flatItems.length === 0 ? 0 : Math.round((totalRead / flatItems.length) * 100);
  const last = lastViewedId ? findItemById(lastViewedId) : undefined;

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 px-4 md:px-6 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-brand-100 dark:border-brand-900/50 bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-brand-950/60 dark:via-neutral-900 dark:to-emerald-950/30 p-6 md:p-10 mb-8">
        <div className="eyebrow mb-2 text-brand-600 dark:text-brand-300">Mülakat Bilgi Tabanı</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 max-w-xl">
          Mülakata hazırlan, eksiklerini gör.
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          {flatItems.length} soru · {qaData.categories.length} kategori · %{totalPct} tamamlandı
        </p>

        <div className="flex flex-wrap gap-3">
          {last ? (
            <button onClick={() => onOpenQuestion(last.id)} className="btn-primary px-5 max-w-full">
              <BookOpenCheck size={17} />
              <span className="truncate">Kaldığın yerden devam: {last.question}</span>
              <ArrowRight size={16} className="shrink-0" />
            </button>
          ) : (
            <button onClick={() => { if (flatItems[0]) onOpenQuestion(flatItems[0].id); }} className="btn-primary px-5" disabled={!flatItems[0]}>
              <BookOpenCheck size={17} /> Okumaya başla <ArrowRight size={16} />
            </button>
          )}
          <button onClick={onInterview} className="btn-secondary">
            <Mic size={17} className="text-emerald-500" /> Canlı Mülakat
          </button>
        </div>
      </section>

      {/* Kategoriler */}
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-lg font-semibold">Kategoriler</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {qaData.categories.map((cat) => {
          const ids = cat.subcategories.flatMap((s) => s.items.map((i) => i.id));
          const read = countRead(ids);
          const meta = categoryMeta(cat.id);
          const Icon = meta.icon;
          return (
            <button key={cat.id} onClick={() => onOpenCategory(cat.id)} className="card-interactive p-5 text-left group">
              <div className="flex items-start justify-between mb-4">
                <span className={`grid place-items-center h-11 w-11 rounded-xl ${meta.soft} ${meta.accent}`}>
                  <Icon size={22} />
                </span>
                {read === ids.length && ids.length > 0 ? (
                  <span className="chip bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <CircleCheck size={12} /> Tamamlandı
                  </span>
                ) : (
                  <ArrowRight size={18} className="text-neutral-300 dark:text-neutral-600 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
                )}
              </div>
              <div className="font-semibold text-lg mb-0.5">{cat.title}</div>
              <div className="text-sm text-neutral-500 mb-4">
                {cat.subcategories.length} alt kategori · {ids.length} soru
              </div>
              <ProgressBar value={read} total={ids.length} />
              <div className="mt-1.5 text-xs text-neutral-500 tabular-nums">{read}/{ids.length} okundu</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hızlı erişim */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Hızlı erişim</h2>
          <div className="space-y-1">
            <QuickLink icon={<Search size={17} className="text-brand-500" />} label="Ara" hint={<kbd className="kbd">Ctrl K</kbd>} onClick={open} />
            <QuickLink icon={<Star size={17} className="text-amber-500" />} label="Favorilerim" hint={<span className="text-xs text-neutral-500">{favIds.size}</span>} onClick={onFavorites} />
            <QuickLink icon={<Mic size={17} className="text-emerald-500" />} label="Canlı Mülakat" hint={<ArrowRight size={14} className="text-neutral-400" />} onClick={onInterview} />
          </div>
        </div>

        {/* Son mülakatlar */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <History size={17} className="text-neutral-400" /> Son mülakat oturumları
          </h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-neutral-500 py-4">
              Henüz oturum yok. Canlı Mülakat'ı bitirdiğinde skorların burada görünür.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className={`w-12 font-semibold tabular-nums ${scoreTone(s.average).text}`}>%{s.average}</span>
                  <span className="flex-1 min-w-0 truncate">{s.scope}</span>
                  <span className="text-xs text-neutral-500 tabular-nums">{s.count} soru</span>
                  <span className="text-xs text-neutral-400 hidden sm:inline">{dateFmt.format(s.finishedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, hint, onClick }: { icon: React.ReactNode; label: string; hint: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {hint}
    </button>
  );
}
