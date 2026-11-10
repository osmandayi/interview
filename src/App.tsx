import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import { FavoritesProvider, useFavoritesContext } from './contexts/FavoritesContext';
import { ProgressProvider, useProgressContext } from './contexts/ProgressContext';
import { SearchProvider, useSearchContext } from './contexts/SearchContext';
import { TopBar } from './components/TopBar';
import { Sidebar, ALL_CATEGORIES } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { QACard } from './components/QACard';
import { Welcome } from './components/Welcome';
import { FavoritesView } from './components/FavoritesView';
import { InterviewSetup } from './components/InterviewSetup';
import { InterviewView } from './components/InterviewView';
import { InterviewSummary } from './components/InterviewSummary';
import { useInterview } from './hooks/useInterview';
import type { InterviewFilter } from './hooks/useInterview';
import { findItemById, flatItems, qaData } from './lib/loadData';
import { readString, writeString } from './lib/storage';

type View = 'welcome' | 'qa' | 'favorites' | 'interview';

const LAST_VIEWED_KEY = 'qa-last-viewed';
const CATEGORY_TAB_KEY = 'qa-category-tab';

function scopeLabelOf(filter: InterviewFilter): string {
  if (filter.subcategoryId) {
    for (const cat of qaData.categories) {
      const sub = cat.subcategories.find((s) => s.id === filter.subcategoryId);
      if (sub) return `${cat.title} › ${sub.title}`;
    }
  }
  if (filter.categoryId) {
    return qaData.categories.find((c) => c.id === filter.categoryId)?.title ?? 'Kategori';
  }
  return 'Tüm havuz';
}

function initialCategoryTab(): string {
  const stored = readString(CATEGORY_TAB_KEY);
  return stored && (stored === ALL_CATEGORIES || qaData.categories.some((c) => c.id === stored))
    ? stored
    : ALL_CATEGORIES;
}

function AppInner() {
  const [view, setView] = useState<View>('welcome');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryTab, setCategoryTabState] = useState<string>(initialCategoryTab);
  const [lastViewedId, setLastViewedId] = useState<string | null>(() => {
    const id = readString(LAST_VIEWED_KEY);
    return id && findItemById(id) ? id : null;
  });
  const [timeLimit, setTimeLimit] = useState(0);
  const { open: openSearch, isOpen: searchOpen } = useSearchContext();
  const { toggle: toggleFav } = useFavoritesContext();
  const { toggleRead, isRead } = useProgressContext();
  const { toggle: toggleTheme } = useThemeContext();
  const interview = useInterview();

  const setCategoryTab = (id: string) => {
    setCategoryTabState(id);
    writeString(CATEGORY_TAB_KEY, id);
  };

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setView('qa');
    setSidebarOpen(false);
    setLastViewedId(id);
    writeString(LAST_VIEWED_KEY, id);
    document.querySelector('main')?.scrollTo({ top: 0 });
  }, []);

  const selected = selectedId ? findItemById(selectedId) : undefined;
  const selectedIndex = selected ? flatItems.findIndex((i) => i.id === selected.id) : -1;
  const prevItem = selectedIndex > 0 ? flatItems[selectedIndex - 1] : null;
  const nextItem = selectedIndex >= 0 && selectedIndex < flatItems.length - 1 ? flatItems[selectedIndex + 1] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
        return;
      }
      if (isInput || searchOpen || e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === 'escape' && sidebarOpen) {
        setSidebarOpen(false);
      } else if (key === 't') {
        toggleTheme();
      } else if (view === 'qa' && selectedId) {
        if (key === 'f') toggleFav(selectedId);
        else if (key === 'm') toggleRead(selectedId);
        else if (e.key === 'ArrowRight' && nextItem) handleSelect(nextItem.id);
        else if (e.key === 'ArrowLeft' && prevItem) handleSelect(prevItem.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSearch, searchOpen, toggleFav, toggleRead, toggleTheme, view, selectedId, sidebarOpen, nextItem, prevItem, handleSelect]);

  const handleOpenCategory = (categoryId: string) => {
    setCategoryTab(categoryId);
    const items = flatItems.filter((i) => i.categoryId === categoryId);
    const target = items.find((i) => !isRead(i.id)) ?? items[0];
    if (target) handleSelect(target.id);
  };

  const goInterview = () => {
    interview.reset();
    setView('interview');
    setSidebarOpen(false);
  };

  const handleHome = () => {
    setView('welcome');
    setSelectedId(null);
    setSidebarOpen(false);
    interview.reset();
  };

  const scopeLabel = scopeLabelOf(interview.filter);

  return (
    <div className="h-full flex flex-col">
      <TopBar onMenuClick={() => setSidebarOpen((o) => !o)} onHome={handleHome} menuOpen={sidebarOpen} />

      <div className="flex-1 flex overflow-hidden">
        {/* Masaüstünde sol panel, mobilde alttan açılan sayfa (bottom sheet) */}
        <div
          className={`fixed inset-x-0 bottom-0 z-40 h-[85vh] overflow-hidden rounded-t-3xl shadow-2xl
            transition-transform duration-300 ease-out
            md:static md:h-auto md:rounded-none md:shadow-none md:translate-y-0
            ${sidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <Sidebar
            selectedId={selectedId}
            onSelect={handleSelect}
            view={view === 'favorites' ? 'favorites' : view === 'qa' ? 'qa' : 'other'}
            onFavorites={() => { setView('favorites'); setSidebarOpen(false); }}
            onInterview={goInterview}
            categoryTab={categoryTab}
            onCategoryTab={setCategoryTab}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <div
          className={`md:hidden fixed inset-0 z-30 bg-neutral-950/40 backdrop-blur-[2px] transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          {view === 'welcome' && (
            <Welcome
              lastViewedId={lastViewedId}
              onOpenQuestion={handleSelect}
              onOpenCategory={handleOpenCategory}
              onFavorites={() => setView('favorites')}
              onInterview={goInterview}
            />
          )}
          {view === 'favorites' && <FavoritesView onSelect={handleSelect} />}
          {view === 'interview' && interview.status === 'setup' && (
            <InterviewSetup
              onStart={(f, limit) => { setTimeLimit(limit); interview.start(f); }}
              error={interview.setupError}
            />
          )}
          {view === 'interview' && interview.status === 'active' && interview.current && (
            <InterviewView
              key={interview.current.id}
              item={interview.current}
              phase={interview.phase}
              result={interview.lastResult}
              remaining={interview.remaining}
              answered={interview.history.length}
              timeLimit={timeLimit}
              onSubmit={interview.submit}
              onNext={interview.next}
              onEnd={interview.end}
            />
          )}
          {view === 'interview' && interview.status === 'finished' && (
            <InterviewSummary
              history={interview.history}
              averageScore={interview.averageScore}
              sessionId={interview.sessionId}
              scopeLabel={scopeLabel}
              onRestart={() => interview.reset()}
              onHome={handleHome}
              onOpenQuestion={handleSelect}
            />
          )}
          {view === 'qa' && selected && (
            <div className="max-w-3xl mx-auto py-6 md:py-10 px-4 md:px-6">
              <QACard
                item={selected}
                position={{ index: selectedIndex, total: flatItems.length }}
                prev={prevItem}
                next={nextItem}
                onNavigate={handleSelect}
              />
            </div>
          )}
          {view === 'qa' && !selected && (
            <div className="p-6 text-center text-neutral-500">
              Menüden bir soru seç veya Ctrl+K ile ara.
            </div>
          )}
        </main>
      </div>

      <SearchModal onSelect={handleSelect} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <ProgressProvider>
          <SearchProvider>
            <AppInner />
          </SearchProvider>
        </ProgressProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
