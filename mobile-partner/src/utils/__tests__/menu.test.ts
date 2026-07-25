import {
  DISH_CATEGORIES,
  createEmptyDish,
  fromServerItem,
  isDishCategory,
  moveItem,
  toPayload,
  validateMenuItems,
} from '../menu';

// PATCH /tiffins/:id/menu is a full replace and the server rejects the ENTIRE
// array if any one dish is missing a name. These tests pin the client-side
// guard so a partner never loses a half-built dish list to a 400.
describe('isDishCategory', () => {
  it('accepts every category in the server enum', () => {
    DISH_CATEGORIES.forEach((c) => expect(isDishCategory(c)).toBe(true));
  });

  it('rejects a category the schema would reject', () => {
    expect(isDishCategory('dessert')).toBe(false);
  });
});

describe('fromServerItem', () => {
  it('maps a well-formed server item', () => {
    const item = fromServerItem(
      { name: 'Dal Tadka', description: 'Yellow dal', image: 'u', category: 'dal', tags: ['veg'] },
      'a',
    );
    expect(item).toEqual({
      id: 'a',
      name: 'Dal Tadka',
      description: 'Yellow dal',
      image: 'u',
      category: 'dal',
      tags: ['veg'],
    });
  });

  it('tolerates the `desc` alias the server also accepts', () => {
    expect(fromServerItem({ name: 'Roti', desc: 'Wheat' }, 'a').description).toBe('Wheat');
  });

  it('defaults an unknown category to main rather than sending an invalid enum', () => {
    expect(fromServerItem({ name: 'X', category: 'dessert' }, 'a').category).toBe('main');
  });

  it('survives missing and malformed fields', () => {
    const item = fromServerItem({}, 'a');
    expect(item.name).toBe('');
    expect(item.tags).toEqual([]);
    expect(item.category).toBe('main');
  });

  it('drops empty tags', () => {
    expect(fromServerItem({ name: 'X', tags: ['veg', '', '  '] }, 'a').tags).toEqual(['veg']);
  });
});

describe('validateMenuItems', () => {
  it('passes when every dish has a name', () => {
    const items = [createEmptyDish('a'), createEmptyDish('b')].map((d, i) => ({
      ...d,
      name: `Dish ${i}`,
    }));
    expect(validateMenuItems(items).valid).toBe(true);
  });

  it('reports the 1-based position of a single unnamed dish', () => {
    const items = [{ ...createEmptyDish('a'), name: 'Rice' }, createEmptyDish('b')];
    const result = validateMenuItems(items);
    expect(result.valid).toBe(false);
    expect(result.invalidPositions).toEqual([2]);
    expect(result.message).toContain('Dish 2');
  });

  it('reports every unnamed dish, not just the first', () => {
    const items = [
      createEmptyDish('a'),
      { ...createEmptyDish('b'), name: 'X' },
      createEmptyDish('c'),
    ];
    expect(validateMenuItems(items).invalidPositions).toEqual([1, 3]);
  });

  it('treats a whitespace-only name as missing, like the server does', () => {
    const items = [{ ...createEmptyDish('a'), name: '   ' }];
    expect(validateMenuItems(items).valid).toBe(false);
  });

  it('passes for an empty menu (clearing the list is legal)', () => {
    expect(validateMenuItems([]).valid).toBe(true);
  });
});

describe('toPayload', () => {
  it('strips the local id the server does not accept', () => {
    const payload = toPayload([{ ...createEmptyDish('local-1'), name: 'Roti' }]);
    expect(payload[0]).not.toHaveProperty('id');
  });

  it('trims names and descriptions like the server sanitizer', () => {
    const payload = toPayload([
      { ...createEmptyDish('a'), name: '  Roti  ', description: '  Wheat  ' },
    ]);
    expect(payload[0].name).toBe('Roti');
    expect(payload[0].description).toBe('Wheat');
  });

  it('drops blank tags', () => {
    const payload = toPayload([{ ...createEmptyDish('a'), name: 'X', tags: ['veg', '  '] }]);
    expect(payload[0].tags).toEqual(['veg']);
  });
});

describe('moveItem', () => {
  it('reorders forwards and backwards', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('returns the list unchanged for a no-op or out-of-range move', () => {
    expect(moveItem(['a', 'b'], 1, 1)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], -1, 0)).toEqual(['a', 'b']);
  });

  it('does not mutate the input', () => {
    const input = ['a', 'b', 'c'];
    moveItem(input, 0, 2);
    expect(input).toEqual(['a', 'b', 'c']);
  });
});
