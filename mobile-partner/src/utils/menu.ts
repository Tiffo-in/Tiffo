// Dish/menu helpers for the partner menu editor.
//
// Mirrors the server contract in backend/src/controllers/tiffinController.js
// (updateMenuItems) and the menuItems schema in backend/src/models/Tiffin.js.
// PATCH /tiffins/:id/menu is a FULL REPLACE of the array, and the server throws
// on any item missing a name — so the client validates before sending rather
// than letting a half-built dish list fail the whole batch save.

/** Categories accepted by the Tiffin.menuItems schema enum. */
export const DISH_CATEGORIES = [
  'main',
  'side',
  'bread',
  'rice',
  'dal',
  'vegetable',
  'pickle',
  'sweet',
  'beverage',
  'other',
] as const;

export type DishCategory = (typeof DISH_CATEGORIES)[number];

/** Common dish tags surfaced as quick toggles in the editor. */
export const DISH_TAGS = ['veg', 'non-veg', 'spicy', 'jain', 'vegan', 'contains-nuts'] as const;

export interface MenuItem {
  /** Local-only id for list keys/reordering; never sent to the server. */
  id: string;
  name: string;
  description: string;
  image: string;
  category: DishCategory;
  tags: string[];
}

/** Payload shape the server expects — note `id` is intentionally absent. */
export interface MenuItemPayload {
  name: string;
  description: string;
  image: string;
  category: DishCategory;
  tags: string[];
}

export function isDishCategory(value: string): value is DishCategory {
  return (DISH_CATEGORIES as readonly string[]).includes(value);
}

/** Create a blank dish for the editor. */
export function createEmptyDish(id: string): MenuItem {
  return { id, name: '', description: '', image: '', category: 'main', tags: [] };
}

/**
 * Convert a server menuItem into the editor's local shape, tolerating the
 * `desc` alias the server also accepts and defaulting an unknown category.
 */
export function fromServerItem(raw: Record<string, unknown>, id: string): MenuItem {
  const rawCategory = typeof raw.category === 'string' ? raw.category : 'main';
  return {
    id,
    name: typeof raw.name === 'string' ? raw.name : '',
    description:
      typeof raw.description === 'string'
        ? raw.description
        : typeof raw.desc === 'string'
          ? raw.desc
          : '',
    image: typeof raw.image === 'string' ? raw.image : '',
    category: isDishCategory(rawCategory) ? rawCategory : 'main',
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => String(t).trim()).filter(Boolean) : [],
  };
}

/** Strip local fields and trim, matching the server's own sanitization. */
export function toPayload(items: MenuItem[]): MenuItemPayload[] {
  return items.map((item) => ({
    name: item.name.trim(),
    description: item.description.trim(),
    image: item.image,
    category: item.category,
    tags: item.tags.map((t) => t.trim()).filter(Boolean),
  }));
}

export interface MenuValidationResult {
  valid: boolean;
  /** 1-based positions of dishes missing a name, for a readable message. */
  invalidPositions: number[];
  message?: string;
}

/**
 * Validate before a batch save. The server rejects the ENTIRE array if any one
 * dish is missing a name, so catching it here avoids losing the partner's work.
 */
export function validateMenuItems(items: MenuItem[]): MenuValidationResult {
  const invalidPositions = items
    .map((item, idx) => (item.name.trim() ? -1 : idx + 1))
    .filter((pos) => pos > 0);

  if (invalidPositions.length === 0) return { valid: true, invalidPositions: [] };

  const list = invalidPositions.join(', ');
  return {
    valid: false,
    invalidPositions,
    message:
      invalidPositions.length === 1
        ? `Dish ${list} needs a name before you can save.`
        : `Dishes ${list} need names before you can save.`,
  };
}

/** Move a dish within the list, used for reordering. Returns a new array. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
