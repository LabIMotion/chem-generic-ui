import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import SystemSelect from '@components/elements/SystemSelect';
import InputUnit from '@components/fields/InputUnit';
import FormulaColumnModal from '@components/elements/FormulaColumnModal';
import { molOptions, samOptions } from '@components/tools/utils';
import AttrChk from '@components/elements/AttrChk';
import { resolveDecimals } from '@utils/numberUtils';

function NumberColumnProps({ node, setNumeric }) {
  const numeric = node.data.numeric || {};
  const [decimals, setDecimals] = useState(
    String(resolveDecimals(numeric.decimals)),
  );
  const [min, setMin] = useState(numeric.min ?? '');
  const [max, setMax] = useState(numeric.max ?? '');
  const focusedRef = useRef(null);

  useEffect(() => {
    if (focusedRef.current !== 'decimals')
      setDecimals(String(resolveDecimals(numeric.decimals)));
    if (focusedRef.current !== 'min') setMin(numeric.min ?? '');
    if (focusedRef.current !== 'max') setMax(numeric.max ?? '');
  }, [numeric.decimals, numeric.min, numeric.max]);

  const commit = (key, v) => {
    setNumeric(key, v === '' ? '' : v, node);
  };

  return (
    <InputGroup size="sm">
      <InputGroup.Text>dec</InputGroup.Text>
      <Form.Control
        type="text"
        value={decimals}
        onChange={(e) => setDecimals(e.target.value)}
        onFocus={() => {
          focusedRef.current = 'decimals';
        }}
        onBlur={() => {
          focusedRef.current = null;
          commit('decimals', decimals);
        }}
        aria-label="decimals"
        className="text-end"
        style={{ maxWidth: 70 }}
      />
      <InputGroup.Text>min</InputGroup.Text>
      <Form.Control
        type="text"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        onFocus={() => {
          focusedRef.current = 'min';
        }}
        onBlur={() => {
          focusedRef.current = null;
          commit('min', min);
        }}
        aria-label="min"
        className="text-end"
        style={{ maxWidth: 80 }}
      />
      <InputGroup.Text>max</InputGroup.Text>
      <Form.Control
        type="text"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        onFocus={() => {
          focusedRef.current = 'max';
        }}
        onBlur={() => {
          focusedRef.current = null;
          commit('max', max);
        }}
        aria-label="max"
        className="text-end"
        style={{ maxWidth: 80 }}
      />
    </InputGroup>
  );
}

function FormulaColumnProps({ node, setFormulaProps, getSiblingColumns }) {
  const [show, setShow] = useState(false);
  const { formula = '' } = node.data;
  return (
    <>
      <Button
        variant={formula ? 'primary' : 'light'}
        size="sm"
        title={formula || undefined}
        onClick={() => setShow(true)}
      >
        Formula
      </Button>
      {show && (
        <FormulaColumnModal
          show={show}
          onHide={() => setShow(false)}
          columns={getSiblingColumns(node)}
          initial={{
            formula: node.data.formula,
            decimal: node.data.decimal,
            refs: node.data.refs,
          }}
          onSave={(payload) => {
            setFormulaProps(payload, node);
            setShow(false);
          }}
        />
      )}
    </>
  );
}

// System-Defined column: quantity selector + a Default Unit button so the
// designer can pin the column's default unit (the formula base unit), mirroring
// the layer-level System-Defined field editor.
function SystemDefinedColumn({ unitConfig, selDefined, selUnit, node }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <SystemSelect
        unitConfig={unitConfig}
        selDefined={selDefined}
        node={node}
      />
      <InputUnit
        compact
        fObj={{
          option_layers: node.data.option_layers,
          value_system: node.data.value_system,
        }}
        fnUnitChange={(params) => selUnit(params.data, node)}
      />
    </div>
  );
}

function DefinedRenderer(props) {
  const {
    unitConfig,
    node,
    selDefined,
    selUnit,
    chkAttr,
    selectOptions,
    setNumeric,
    setFormulaProps,
    getSiblingColumns,
  } = props;
  if (
    node.data.type === FieldTypes.F_SELECT ||
    node.data.type === FieldTypes.F_SELECT_MULTI
  ) {
    if (selectOptions.length > 0) {
      return (
        <SystemSelect
          unitConfig={selectOptions}
          selDefined={selDefined}
          node={node}
        />
      );
    }
    return null;
  }
  if (node.data.type === FieldTypes.F_SYSTEM_DEFINED)
    return (
      <SystemDefinedColumn
        unitConfig={unitConfig}
        selDefined={selDefined}
        selUnit={selUnit}
        node={node}
      />
    );
  if (node.data.type === FieldTypes.F_DRAG_MOLECULE)
    return <AttrChk chkAttr={chkAttr} node={node} attrOpts={molOptions} />;
  if (node.data.type === FieldTypes.F_DRAG_SAMPLE)
    return <AttrChk chkAttr={chkAttr} node={node} attrOpts={samOptions} />;
  if (node.data.type === FieldTypes.F_NUMBER && setNumeric)
    return <NumberColumnProps node={node} setNumeric={setNumeric} />;
  if (node.data.type === FieldTypes.F_FORMULA_FIELD && setFormulaProps)
    return (
      <FormulaColumnProps
        node={node}
        setFormulaProps={setFormulaProps}
        getSiblingColumns={getSiblingColumns}
      />
    );
  const v = node.data.value;
  return v === null || v === undefined || v === '' ? null : v;
}

export default DefinedRenderer;
