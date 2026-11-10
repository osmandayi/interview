import { Search, Menu, X, GraduationCap } from 'lucide-react';
import { useSearchContext } from '../contexts/SearchContext';
import { ThemeToggle } from './ThemeToggle';

type Props = { onMenuClick: () => void; onHome: () => void; menuOpen: boolean };

export function TopBar({ onMenuClick, onHome, menuOpen }: Props) {
  const { open } = useSearchContext();

  return (
    <header
      className="sticky z-30 h-14 shrink-0 flex items-center gap-2 md:gap-4 px-3 md:px-4
        bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <button
        onClick={onMenuClick}
        aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={menuOpen}
        className="md:hidden btn-ghost"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <button
        onClick={onHome}
        aria-label="Ana sayfaya dön"
        className="flex items-center gap-2 font-semibold px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
      >
        <span className="grid place-items-center h-8 w-8 rounded-lg bg-brand-600 text-white">
          <GraduationCap size={18} />
        </span>
        <span className="hidden sm:inline tracking-tight">Interview QA</span>
      </button>

      <button
        onClick={open}
        className="flex-1 max-w-md mx-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-500
          bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 transition"
      >
        <Search size={16} />
        <span>Ara…</span>
        <kbd className="kbd ml-auto hidden sm:inline">Ctrl K</kbd>
      </button>

      <ThemeToggle />
    </header>
  );
}
