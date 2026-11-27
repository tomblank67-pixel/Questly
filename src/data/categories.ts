import type { CategoryId, Difficulty } from '../types';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  emoji: string;
  /** Tailwind-independent hex colour so it can be used in SVG/inline styles too. */
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'koerper', name: 'Körper', emoji: '💪', color: '#ff7a59' },
  { id: 'geist', name: 'Geist', emoji: '🧠', color: '#b49af0' },
  { id: 'soziales', name: 'Soziales', emoji: '💬', color: '#f28fa6' },
  { id: 'kreativitaet', name: 'Kreativität', emoji: '🎨', color: '#ffc94a' },
  { id: 'natur', name: 'Natur', emoji: '🌿', color: '#8bc47a' },
  { id: 'abenteuer', name: 'Abenteuer', emoji: '🧭', color: '#7fb8e6' },
];

export const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((c) => c.id);

export const categoryInfo = (id: CategoryId): CategoryInfo =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  leicht: 10,
  mittel: 25,
  episch: 50,
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  leicht: 'Leicht',
  mittel: 'Mittel',
  episch: 'Episch',
};
