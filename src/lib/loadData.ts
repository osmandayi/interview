import type { QAData, FlatQAItem } from '../types/qa';
import data from '../data/qa.json';

export const qaData: QAData = data as QAData;

export const flatItems: FlatQAItem[] = qaData.categories.flatMap((cat) =>
  cat.subcategories.flatMap((sub) =>
    sub.items.map((item) => ({
      ...item,
      categoryId: cat.id,
      categoryTitle: cat.title,
      subcategoryId: sub.id,
      subcategoryTitle: sub.title
    }))
  )
);

export function findItemById(id: string): FlatQAItem | undefined {
  return flatItems.find((i) => i.id === id);
}
