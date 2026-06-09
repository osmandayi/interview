import { Search, BookOpen, Star, Mic } from 'lucide-react';
import { flatItems, qaData } from '../lib/loadData';
import { useSearchContext } from '../contexts/SearchContext';

type Props = {
  onBrowse: () => void;
  onFavorites: () => void;
  onInterview: () => void;
};

export function Welcome({ onBrowse, onFavorites, onInterview }: Props) {
  const { open } = useSearchContext();
  const totalQA = flatItems.length;
  const totalSubs = qaData.categories.reduce((sum, c) => sum + c.subcategories.length, 0);

  return (
    <div className="max-w-2xl mx-auto py-16 px-6 text-center">
      <BookOpen size={48} className="mx-auto text-blue-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Mülakat Bilgi Tabanı</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        {totalQA} soru • {totalSubs} alt-kategori
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={open}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
        >
          <Search size={24} className="text-blue-500" />
          <div className="font-semibold">Ara</div>
          <div className="text-xs text-neutral-500">Ctrl+K</div>
        </button>

        <button
          onClick={onBrowse}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
        >
          <BookOpen size={24} className="text-blue-500" />
          <div className="font-semibold">Kategorilere Göz At</div>
          <div className="text-xs text-neutral-500">Soldaki menü</div>
        </button>

        <button
          onClick={onFavorites}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
        >
          <Star size={24} className="text-yellow-500" />
          <div className="font-semibold">Favorilerim</div>
          <div className="text-xs text-neutral-500">İşaretlenmiş sorular</div>
        </button>
        <button
          onClick={onInterview}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
        >
          <Mic size={24} className="text-green-500" />
          <div className="font-semibold">Canlı Mülakat</div>
          <div className="text-xs text-neutral-500">Sorulara cevap ver</div>
        </button>
      </div>
    </div>
  );
}
