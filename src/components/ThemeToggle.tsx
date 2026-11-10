import { Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggle } = useThemeContext();
  return (
    <button onClick={toggle} aria-label="Tema değiştir" title="Tema (T)" className="btn-ghost">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
