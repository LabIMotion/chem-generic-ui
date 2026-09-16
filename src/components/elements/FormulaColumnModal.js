/* eslint-disable react/forbid-prop-types */
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Form, Table } from 'react-bootstrap';
import findTypeLabel from '@components/tools/field-utils';
import {
  ABBR_PATTERN,
  TABLE_OPERAND_TYPES,
  resolveFormulaDecimals,
} from '@utils/formulaUtils';
import GModal from '@ui/modals/GModal';

// Derive an identifier-safe abbreviation from a column heading.
const suggestAbbr = (colName, idx) => {
  const sanitized = String(colName || '')
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^[0-9]/, '_$&');
  return sanitized || `c${idx + 1}`;
};

const isEligible = (col) => TABLE_OPERAND_TYPES.includes(col.type);

/**
 * Modal to configure a Formula-Field table column. Lists the sibling
 * columns with an editable abbreviation per eligible column (Number /
 * System-Defined); the formula references columns by abbreviation.
 * Abbreviations are pure authoring aliases — they are persisted as
 * refs: [{ abbr, id }] and resolved back to the real column at calculation
 * time. Refs to retyped (non-eligible but existing) columns are kept so
 * they reconnect when the column type is switched back; only refs to
 * deleted columns are dropped.
 */
function FormulaColumnModal({ show, onHide, columns, initial, onSave }) {
  const [formula, setFormula] = useState(initial.formula || '');
  const [decimal, setDecimal] = useState(
    String(resolveFormulaDecimals(initial.decimal)),
  );
  const [abbrs, setAbbrs] = useState(() => {
    const existing = {};
    (initial.refs || []).forEach((r) => {
      existing[r.id] = r.abbr;
    });
    const taken = new Set(Object.values(existing));
    const next = {};
    columns.forEach((col, idx) => {
      if (existing[col.id] !== undefined) {
        next[col.id] = existing[col.id];
        return;
      }
      if (!isEligible(col)) {
        next[col.id] = '';
        return;
      }
      let abbr = suggestAbbr(col.col_name, idx);
      while (taken.has(abbr)) abbr = `${abbr}_`;
      taken.add(abbr);
      next[col.id] = abbr;
    });
    return next;
  });

  const errors = useMemo(() => {
    const msgs = [];
    const seen = new Map();
    columns.forEach((col) => {
      const abbr = (abbrs[col.id] || '').trim();
      if (abbr === '') return;
      if (!ABBR_PATTERN.test(abbr)) {
        msgs.push(
          `Abbr. "${abbr}" is invalid — use letters, digits and underscore; it must not start with a digit.`,
        );
      }
      if (seen.has(abbr)) {
        msgs.push(`Abbr. "${abbr}" is used more than once.`);
      }
      seen.set(abbr, col.id);
    });
    return msgs;
  }, [abbrs, columns]);

  const hints = useMemo(() => {
    const msgs = [];
    const abbrFor = (predicate) =>
      new Set(
        columns
          .filter(predicate)
          .map((col) => (abbrs[col.id] || '').trim())
          .filter(Boolean),
      );
    const eligibleAbbrs = abbrFor(isEligible);
    const retypedAbbrs = abbrFor((col) => !isEligible(col));
    // \b keeps exponents of numeric literals (1e3) from matching as tokens
    const tokens = [
      ...new Set(formula.match(/\b[a-zA-Z_][a-zA-Z0-9_]*/g) || []),
    ];
    const retyped = tokens.filter((t) => retypedAbbrs.has(t));
    if (retyped.length) {
      msgs.push(
        `Referencing column(s) that are not Number/System-Defined (count as 0 until the type is switched back): ${retyped.join(', ')}.`,
      );
    }
    const unknown = tokens.filter(
      (t) => !eligibleAbbrs.has(t) && !retypedAbbrs.has(t),
    );
    if (unknown.length) {
      msgs.push(`Unknown in formula (treated as 0): ${unknown.join(', ')}.`);
    }
    const colIds = new Set(columns.map((col) => col.id));
    const deleted = (initial.refs || []).filter((r) => !colIds.has(r.id));
    if (deleted.length) {
      msgs.push(
        `Reference(s) to deleted column(s) will be dropped: ${deleted
          .map((r) => r.abbr)
          .join(', ')}.`,
      );
    }
    return msgs;
  }, [formula, abbrs, columns, initial.refs]);

  const hasEligible = columns.some(isEligible);

  const save = () => {
    const refs = columns
      .map((col) => ({ abbr: (abbrs[col.id] || '').trim(), id: col.id }))
      .filter((r) => r.abbr !== '');
    onSave({
      formula,
      decimal: resolveFormulaDecimals(decimal),
      refs,
    });
  };

  return (
    <GModal show={show} onHide={onHide} dialogClassName="gu_modal-68w">
      <GModal.Header>
        <GModal.Title>Formula</GModal.Title>
      </GModal.Header>
      <GModal.Body>
        {!hasEligible && (
          <Alert variant="info" className="py-1">
            No eligible columns. Add a Number or System-Defined column first.
          </Alert>
        )}
        {columns.length > 0 && (
          <Table size="sm" bordered>
            <thead>
              <tr>
                <th>Id</th>
                <th>Column Heading</th>
                <th>Column Type</th>
                <th style={{ width: '30%' }}>Abbr. (use in formula)</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col) => {
                const eligible = isEligible(col);
                return (
                  <tr key={col.id} className={eligible ? '' : 'text-muted'}>
                    <td>{col.id}</td>
                    <td>{col.col_name}</td>
                    <td>
                      {findTypeLabel(col.type)}
                      {eligible ? '' : ' (not eligible — counts as 0)'}
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={abbrs[col.id] || ''}
                        disabled={!eligible}
                        aria-label={`abbr for ${col.col_name || col.id}`}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAbbrs((prev) => ({ ...prev, [col.id]: v }));
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <Form.Group className="mb-2">
          <Form.Label>
            Formula{' '}
            <span className="text-muted small">
              — reference columns by their Abbr. above, e.g. a * b
            </span>
          </Form.Label>
          <Form.Control
            type="text"
            value={formula}
            aria-label="formula"
            placeholder="e.g. a * b"
            onChange={(e) => setFormula(e.target.value)}
          />
          <Form.Text muted>
            System-Defined values are calculated in their base unit, independent
            of the displayed unit.
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Decimal</Form.Label>
          <Form.Control
            type="text"
            value={decimal}
            aria-label="decimal"
            className="text-end"
            style={{ maxWidth: 100 }}
            onChange={(e) => setDecimal(e.target.value)}
          />
        </Form.Group>
        {errors.map((msg) => (
          <Alert key={msg} variant="danger" className="py-1">
            {msg}
          </Alert>
        ))}
        {hints.map((msg) => (
          <Alert key={msg} variant="warning" className="py-1">
            {msg}
          </Alert>
        ))}
      </GModal.Body>
      <GModal.Footer>
        <Button variant="success" onClick={save} disabled={errors.length > 0}>
          Save
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
      </GModal.Footer>
    </GModal>
  );
}

FormulaColumnModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  initial: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default FormulaColumnModal;
