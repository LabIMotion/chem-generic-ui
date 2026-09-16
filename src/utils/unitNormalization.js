import { genUnits } from 'generic-ui-core';

/**
 * Converts a value of `measurableQuantity` from `currentUnit` to its base unit.
 *
 * Convention (from chem-units): the units list returned by genUnits() carries a
 * multiplier `nm` per entry; conversion between two entries follows
 * `result = value * (toNm / fromNm)`.
 *
 * Base unit priority:
 * 1. `baseUnit` — the designer's default unit (`value_system_base`), when it
 *    resolves to an entry in the units list. This makes the formula result
 *    expressed in the unit the designer pinned.
 * 2. the entry with `nm === 1`.
 * 3. the first entry (single-unit quantities such as `degree`, `chem_distances`
 *    have no `nm` defined).
 *
 * Returns the original (parsed) value when:
 * - currentUnit equals the base unit (no conversion needed)
 * - the units list cannot be resolved (unknown quantity)
 * - the currentUnit is not in the units list
 *
 * Returns 0 for empty / nullish values (so formula evaluation stays numeric).
 *
 * Note: `unitConversion` from generic-ui-core only cycles to the previous
 * sibling unit, so it cannot be used for arbitrary base-unit normalization.
 */
export const toBaseUnit = (
  measurableQuantity,
  currentUnit,
  value,
  baseUnit,
) => {
  if (value === '' || value === undefined || value === null) return 0;
  const num = parseFloat(value);
  if (Number.isNaN(num)) return 0;
  if (!measurableQuantity) return num;

  const units = genUnits(measurableQuantity) || [];
  if (units.length <= 1) return num;

  const base =
    (baseUnit && units.find((u) => u.key === baseUnit)) ||
    units.find((u) => u.nm === 1) ||
    units[0];
  const from = units.find((u) => u.key === currentUnit);
  if (!base || !from || base.key === from.key) return num;
  if (typeof base.nm !== 'number' || typeof from.nm !== 'number') return num;

  return (num * base.nm) / from.nm;
};
