import { dedupeSubFieldIds } from '@utils/template/prune-references';

describe('dedupeSubFieldIds', () => {
  test('re-mints a later duplicate id and keeps the first occurrence', () => {
    // The real Viability-klass shape: a system-defined column and a formula
    // column both carrying id "a7778a5d".
    const input = [
      {
        id: 'a7778a5d',
        col_name: 'Stock Concentration',
        type: 'system-defined',
      },
      {
        id: 'b1dee9b1',
        col_name: 'Final Concentration',
        type: 'system-defined',
      },
      { id: 'a7778a5d', col_name: 'Volume (Stock)', type: 'formula-field' },
    ];

    const out = dedupeSubFieldIds(input);

    // First occurrence keeps the id; the later duplicate is re-minted.
    expect(out[0].id).toBe('a7778a5d');
    expect(out[2].id).not.toBe('a7778a5d');
    expect(out[2].id).toBeTruthy();
    // Every non-id field is preserved on the re-minted column.
    expect(out[2].col_name).toBe('Volume (Stock)');
    expect(out[2].type).toBe('formula-field');
    // All ids are now unique.
    const ids = out.map((sf) => sf.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('leaves already-unique ids unchanged', () => {
    const input = [
      { id: 'x1', type: 'text' },
      { id: 'x2', type: 'text' },
    ];
    const out = dedupeSubFieldIds(input);
    expect(out.map((sf) => sf.id)).toEqual(['x1', 'x2']);
  });

  test('does not mutate the input array or its entries', () => {
    const dup = { id: 'dup', col_name: 'B' };
    const input = [{ id: 'dup', col_name: 'A' }, dup];
    dedupeSubFieldIds(input);
    expect(input[1]).toBe(dup);
    expect(input[1].id).toBe('dup');
  });

  test('ignores entries without an id and non-array input', () => {
    const out = dedupeSubFieldIds([{ type: 'label' }, { type: 'label' }]);
    expect(out).toHaveLength(2);
    expect(dedupeSubFieldIds(null)).toBeNull();
    expect(dedupeSubFieldIds(undefined)).toBeUndefined();
  });
});
