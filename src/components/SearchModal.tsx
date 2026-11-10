import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSearchContext } from '../contexts/SearchContext';
import { useSearch } from '../hooks/useSearch';
import { flatItems } from '../lib/loadData';
import type { FlatQAItem } from '../types/qa';

type Props = {
  onSelect: (id: string) => void;
};

export function SearchModal({ onSelect }: Props) {
  const { isOpen, query, close, setQuery } = useSearchContext();
  const fuse = useSearch(flatItems);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const results: FlatQAItem[] = query.trim().length >= 2
    ? fuse.search(query).slice(0, 15).map((r) => r.item)
    : [];

  useEffect(() => {
    if (isOpen) {
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIdx]) {
      onSelect(results[activeIdx].id);
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4" onClick={close}>
      <div className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <Search size={18} className="text-neutral-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ara... (en az 2 karakter)"
            className="flex-1 bg-transparent outline-none text-base"
          />
          <button onClick={close} aria-label="Kapat" className="btn-ghost p-1.5">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && query.trim().length >= 2 && (
            <div className="p-6 text-center text-sm text-neutral-500">Sonuç bulunamadı.</div>
          )}
          {results.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); close(); }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition ${
                i === activeIdx ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="text-xs text-neutral-500 mb-1">
                {item.categoryTitle} › {item.subcategoryTitle}
              </div>
              <div className="font-medium text-sm">{item.question}</div>
            </button>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex justify-between">
          <span>{results.length} sonuç</span>
          <span className="flex gap-2"><span><kbd className="kbd">↑↓</kbd> gez</span><span><kbd className="kbd">Enter</kbd> aç</span><span><kbd className="kbd">Esc</kbd> kapat</span></span>
        </div>
      </div>
    </div>
  );
}
