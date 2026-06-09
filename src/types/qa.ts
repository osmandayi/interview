export type QAData = {
  categories: Category[];
};

export type Category = {
  id: string;
  title: string;
  subcategories: Subcategory[];
};

export type Subcategory = {
  id: string;
  title: string;
  items: QAItem[];
};

export type QAItem = {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
  keywords?: string[];
};

export type FlatQAItem = QAItem & {
  categoryId: string;
  categoryTitle: string;
  subcategoryId: string;
  subcategoryTitle: string;
};
