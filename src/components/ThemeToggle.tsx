import { Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggle } = useThemeContext();
  return (
    <button
      onClick={toggle}
      aria-label="Tema değiştir"
      className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
