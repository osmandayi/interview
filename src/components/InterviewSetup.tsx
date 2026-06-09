import { useState } from 'react';
import { Play } from 'lucide-react';
import { qaData } from '../lib/loadData';
import type { InterviewFilter } from '../hooks/useInterview';

type Props = {
  onStart: (filter: InterviewFilter) => void;
  error: string | null;
};

export function InterviewSetup({ onStart, error }: Props) {
  // scope value: '' = all, 'cat:<id>' = category, 'sub:<id>' = subcategory
  const [scope, setScope] = useState('');

  const handleStart = () => {
    if (scope.startsWith('cat:')) onStart({ categoryId: scope.slice(4) });
    else if (scope.startsWith('sub:')) onStart({ subcategoryId: scope.slice(4) });
    else onStart({});
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-6">
      <h1 className="text-2xl font-bold mb-2">Canlı Mülakat</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        Sistem sana tekrarsız sorular soracak. Cevabını yaz, anahtar kelime
        kapsamına göre yüzde puan al, gerçek cevabı gör.
      </p>

      <label className="block text-sm font-medium mb-2">Kapsam</label>
      <select
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        className="w-full mb-6 px-3 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
      >
        <option value="">Tüm havuz</option>
        {qaData.categories.map((cat) => [
          <option key={cat.id} value={`cat:${cat.id}`}>{cat.title} (tümü)</option>,
          ...cat.subcategories.map((sub) => (
            <option key={sub.id} value={`sub:${sub.id}`}>
              &nbsp;&nbsp;{cat.title} › {sub.title}
            </option>
          ))
        ])}
      </select>

      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        onClick={handleStart}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
      >
        <Play size={18} /> Başla
      </button>
    </div>
  );
}
