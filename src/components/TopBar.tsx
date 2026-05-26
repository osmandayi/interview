import { Search, Menu, BookOpen } from 'lucide-react';
import { useSearchContext } from '../contexts/SearchContext';
import { ThemeToggle } from './ThemeToggle';

type Props = { onMenuClick: () => void };

export function TopBar({ onMenuClick }: Props) {
  const { open } = useSearchContext();

  return (
    <header className="h-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 gap-4 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        aria-label="Menu"
        className="md:hidden p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 font-semibold">
        <BookOpen size={20} className="text-blue-500" />
        <span>Interview QA</span>
      </div>

      <button
        onClick={open}
        className="flex-1 max-w-md mx-auto flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded text-sm text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
      >
        <Search size={16} />
        <span>Ara...</span>
        <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-600">Ctrl+K</kbd>
      </button>

      <ThemeToggle />
    </header>
  );
}
