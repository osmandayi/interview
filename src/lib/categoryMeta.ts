import { Monitor, Server, FlaskConical, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type CategoryMeta = { icon: LucideIcon; accent: string; soft: string };

const META: Record<string, CategoryMeta> = {
  frontend: {
    icon: Monitor,
    accent: 'text-sky-600 dark:text-sky-400',
    soft: 'bg-sky-50 dark:bg-sky-900/30'
  },
  backend: {
    icon: Server,
    accent: 'text-violet-600 dark:text-violet-400',
    soft: 'bg-violet-50 dark:bg-violet-900/30'
  },
  tester: {
    icon: FlaskConical,
    accent: 'text-emerald-600 dark:text-emerald-400',
    soft: 'bg-emerald-50 dark:bg-emerald-900/30'
  }
};

const FALLBACK: CategoryMeta = {
  icon: Layers,
  accent: 'text-brand-600 dark:text-brand-400',
  soft: 'bg-brand-50 dark:bg-brand-900/30'
};

export function categoryMeta(id: string): CategoryMeta {
  return META[id] ?? FALLBACK;
}
