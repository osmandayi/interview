import { useState, useEffect } from 'react';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import { FavoritesProvider, useFavoritesContext } from './contexts/FavoritesContext';
import { SearchProvider, useSearchContext } from './contexts/SearchContext';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { QACard } from './components/QACard';
import { Welcome } from './components/Welcome';
import { FavoritesView } from './components/FavoritesView';
import { InterviewSetup } from './components/InterviewSetup';
import { InterviewView } from './components/InterviewView';
import { InterviewSummary } from './components/InterviewSummary';
import { useInterview } from './hooks/useInterview';
import { findItemById } from './lib/loadData';

type View = 'welcome' | 'qa' | 'favorites' | 'interview';

function AppInner() {
  const [view, setView] = useState<View>('welcome');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { open: openSearch } = useSearchContext();
  const { toggle: toggleFav } = useFavoritesContext();
  const { toggle: toggleTheme } = useThemeContext();
  const interview = useInterview();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      } else if (!isInput && e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      } else if (!isInput && e.key.toLowerCase() === 'f' && view === 'qa' && selectedId) {
        toggleFav(selectedId);
      } else if (!isInput && e.key.toLowerCase() === 't') {
        toggleTheme();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSearch, toggleFav, toggleTheme, view, selectedId, sidebarOpen]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setView('qa');
    setSidebarOpen(false);
    sessionStorage.setItem('qa-last-viewed', id);
  };

  const handleBrowse = () => {
    const last = sessionStorage.getItem('qa-last-viewed');
    if (last && findItemById(last)) {
      handleSelect(last);
    } else {
      setSidebarOpen(true);
    }
  };

  const selected = selectedId ? findItemById(selectedId) : null;

  const handleHome = () => {
    setView('welcome');
    setSelectedId(null);
    setSidebarOpen(false);
    interview.reset();
    sessionStorage.removeItem('qa-last-viewed');
  };

  return (
    <div className="h-full flex flex-col">
      <TopBar onMenuClick={() => setSidebarOpen((o) => !o)} onHome={handleHome} />

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`fixed md:static inset-y-0 left-0 z-40 transition-transform md:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar
            selectedId={selectedId}
            onSelect={handleSelect}
            view={view === 'favorites' ? 'favorites' : 'qa'}
            onViewChange={(v) => { setView(v); setSidebarOpen(false); }}
            onInterview={() => { interview.reset(); setView('interview'); setSidebarOpen(false); }}
          />
        </div>

        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto">
          {view === 'welcome' && (
            <Welcome
              onBrowse={handleBrowse}
              onFavorites={() => setView('favorites')}
              onInterview={() => { interview.reset(); setView('interview'); }}
            />
          )}
          {view === 'favorites' && (
            <FavoritesView onSelect={handleSelect} />
          )}
          {view === 'interview' && interview.status === 'setup' && (
            <InterviewSetup
              onStart={(f) => interview.start(f)}
              error={interview.setupError}
            />
          )}
          {view === 'interview' && interview.status === 'active' && interview.current && (
            <InterviewView
              item={interview.current}
              phase={interview.phase}
              result={interview.lastResult}
              remaining={interview.remaining}
              onSubmit={interview.submit}
              onNext={interview.next}
              onEnd={interview.end}
            />
          )}
          {view === 'interview' && interview.status === 'finished' && (
            <InterviewSummary
              history={interview.history}
              averageScore={interview.averageScore}
              onRestart={() => interview.reset()}
              onHome={handleHome}
            />
          )}
          {view === 'qa' && selected && (
            <div className="max-w-4xl mx-auto p-6">
              <QACard item={selected} />
            </div>
          )}
          {view === 'qa' && !selected && (
            <div className="p-6 text-center text-neutral-500">
              Soldaki menüden bir soru seç veya Ctrl+K ile ara.
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
        <SearchProvider>
          <AppInner />
        </SearchProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
