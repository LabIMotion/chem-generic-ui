import filter from 'lodash/filter';
import { evaluate } from 'mathjs';
import { FieldTypes, genUnits } from 'generic-ui-core';
import { toBaseUnit } from '@utils/unitNormalization';

// Field types usable as operands in layer-level formulas.
export const CAL_FIELD_TYPES = [
  FieldTypes.F_INTEGER,
  FieldTypes.F_NUMBER,
  FieldTypes.F_SYSTEM_DEFINED,
];

// Column types usable as operands in table formula columns.
export const TABLE_OPERAND_TYPES = [
  FieldTypes.F_NUMBER,
  FieldTypes.F_SYSTEM_DEFINED,
];

// Abbreviations must be identifiers so they tokenize unambiguously.
export const ABBR_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Resolves a formula decimal setting: unset/invalid defaults to 5, negatives
 * clamp to 0, and 0 is preserved (0-decimal columns are configurable).
 */
export const resolveFormulaDecimals = (decimal) => {
  const d = parseInt(decimal, 10);
  if (Number.isNaN(d)) return 5;
  return d < 0 ? 0 : d;
};

/**
 * Resolves a field-like operand ({ type, value, option_layers, value_system })
 * to a number. System-defined operands are normalized to their base unit so
 * the formula result is invariant under unit-switches in the source fields;
 * falls back to the raw value when unit metadata is absent (legacy data).
 *
 * `baseUnit` is the designer's pinned default unit (the field's
 * `value_system_base`, or a table column's `value_system`). When given, the
 * result is expressed in that unit; otherwise normalization falls back to the
 * `nm === 1` base.
 */
export const operandValue = (field, baseUnit) => {
  if (field.type === FieldTypes.F_SYSTEM_DEFINED) {
    const raw = field.value;
    if (raw === '' || raw === undefined || raw === null) return 0;
    if (!field.option_layers || !field.value_system) {
      return parseFloat(raw) || 0;
    }
    return toBaseUnit(field.option_layers, field.value_system, raw, baseUnit);
  }
  return parseFloat(field.value || 0);
};

/**
 * Reconciles a system-defined table cell with its column definition after the
 * column's default unit (or quantity) changes. Returns a new cell
 * `{ value, value_system }`:
 *  - same-quantity unit change -> keep the typed magnitude and adopt the new
 *    default unit (relabel, NOT convert). The formula base IS the column's
 *    default unit (see `cellOperandValue`), so relabeling keeps both the
 *    entered value and the formula result unchanged — matching the independent
 *    and Input-Group system-defined fields, whose default-unit change never
 *    touches the entered value.
 *  - quantity change (the cell's unit is no longer a unit of `quantity`)
 *    -> drop the now-meaningless value
 *  - otherwise -> keep the value, adopt the column's current default unit
 */
export const reconcileSystemCell = (cell, columnUnit, quantity) => {
  const units = genUnits(quantity) || [];
  const newUnit = columnUnit || units[0]?.key || '';
  const next =
    cell && typeof cell === 'object' && !Array.isArray(cell)
      ? { ...cell }
      : { value: '', value_system: '' };
  if (next.value == null) next.value = '';

  const from = units.find((u) => u.key === next.value_system);
  if (!from && next.value !== '') {
    // the cell's unit is not a unit of this quantity (the quantity changed),
    // so the stored magnitude is meaningless under the new unit
    next.value = '';
  }
  // same-quantity unit change: fall through with the value untouched and only
  // relabel value_system below — the formula base moves with the column unit.
  next.value_system = newUnit;
  return next;
};

/**
 * Substitutes layer-field operands into a formula string. Operands are
 * referenced by field name; unknown names resolve to 0.
 */
export const buildLayerFormula = (formula, fields) => {
  const calFields = filter(fields, (o) => CAL_FIELD_TYPES.includes(o.type));

  const regF = /[a-zA-Z0-9_]+/gm;
  const varFields =
    formula && formula.match(regF)
      ? formula.match(regF).sort((a, b) => b.length - a.length)
      : [];

  let newFormula = formula?.replace(/\*\*/g, '^');

  varFields.forEach((fi) => {
    if (!isNaN(fi)) return;

    const tmpField = calFields.find((e) => e.field === fi);
    if (typeof tmpField === 'undefined' || tmpField == null) {
      newFormula = newFormula?.replace(fi, 0);
    } else {
      newFormula = newFormula?.replace(
        fi,
        operandValue(tmpField, tmpField.value_system_base),
      );
    }
  });
  return newFormula;
};

/**
 * Evaluates a fully substituted formula string. Returns the rounded number,
 * 0 for non-numeric results, or the mathjs error message on failure.
 */
export const evalFormulaText = (newFormula, decimal) => {
  try {
    const showVal = evaluate(newFormula);
    return !isNaN(showVal) ? parseFloat(showVal.toFixed(decimal)) : 0;
  } catch (e) {
    return e.message;
  }
};

/** Sibling table columns that may be referenced by a formula column. */
export const getEligibleOperands = (subFields) =>
  (subFields || []).filter((sf) => TABLE_OPERAND_TYPES.includes(sf.type));

const cellOperandValue = (subField, cell) =>
  operandValue(
    {
      type: subField.type,
      value: cell?.value,
      option_layers: subField.option_layers,
      // unit cycling stores the current unit on the cell; fall back to the
      // column default for rows persisted before the column existed
      value_system: cell?.value_system || subField.value_system,
    },
    // base unit = the column's designer default (stable; cell switches write
    // to the cell, never the column), so the formula result is pinned to it
    subField.value_system,
  );

/**
 * Evaluates a table formula column for one row. Abbreviations are pure
 * authoring aliases: each identifier token resolves via `refs` to a column
 * uuid, then to that row's cell value (system-defined → base unit). Unknown
 * tokens and refs to deleted/retyped columns resolve to 0 (layer parity).
 */
export const calculateRowFormula = (formula, refs, subFields, row, decimal) => {
  if (!formula) return '';
  const eligible = getEligibleOperands(subFields);
  const refList = refs || [];
  const dec = resolveFormulaDecimals(decimal);

  // \b keeps exponents of numeric literals (1e3) from matching as tokens
  const substituted = formula
    .replace(/\*\*/g, '^')
    .replace(/\b[a-zA-Z_][a-zA-Z0-9_]*/g, (token) => {
      const ref = refList.find((r) => r.abbr === token);
      if (!ref) return '0';
      const subField = eligible.find((e) => e.id === ref.id);
      if (!subField) return '0';
      return `(${cellOperandValue(subField, row?.[subField.id])})`;
    });

  return evalFormulaText(substituted, dec);
};

/**
 * Removes refs that point to columns no longer present in sub_fields.
 * Only deleted ids are pruned — refs to retyped (non-eligible but existing)
 * columns are kept so they reconnect when the column type is switched back.
 */
export const pruneFormulaRefs = (subFields) => {
  const ids = new Set((subFields || []).map((sf) => sf.id));
  (subFields || []).forEach((sf) => {
    if (sf.type !== FieldTypes.F_FORMULA_FIELD || !Array.isArray(sf.refs))
      return;
    const kept = sf.refs.filter((r) => ids.has(r.id));
    if (kept.length !== sf.refs.length) {
      // eslint-disable-next-line no-param-reassign
      sf.refs = kept;
    }
  });
  return subFields;
};

/**
 * Recomputes formula cells of a table field in place (write-through so
 * persisted sub_values match the rendered values, e.g. for export). Stores
 * an empty value when the formula does not evaluate to a number.
 * Formulas only read cells of their own row, so single-row edits may pass
 * the edited row to skip recomputing the rest of the table; omit it on
 * structural changes (column add/remove/retype, formula edit).
 */
export const recomputeFormulaCells = (fObj, row) => {
  const subFields = fObj?.sub_fields || [];
  const formulaCols = subFields.filter(
    (sf) => sf.type === FieldTypes.F_FORMULA_FIELD,
  );
  if (formulaCols.length === 0) return fObj;

  const rows = row ? [row] : fObj.sub_values || [];
  rows.forEach((r) => {
    formulaCols.forEach((col) => {
      const result = calculateRowFormula(
        col.formula,
        col.refs,
        subFields,
        r,
        col.decimal,
      );
      // eslint-disable-next-line no-param-reassign
      r[col.id] = { value: typeof result === 'number' ? result : '' };
    });
  });
  return fObj;
};
