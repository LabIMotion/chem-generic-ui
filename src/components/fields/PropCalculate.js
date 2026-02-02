import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import filter from 'lodash/filter';
import { FieldTypes } from 'generic-ui-core';
import FieldHeader from '@components/fields/FieldHeader';
import { fieldCls } from '@components/tools/utils';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import { toBool, toNullOrInt } from '@utils/pureUtils';

const PropCalculate = (opt) => {
  const {
    f_obj: fObj,
    formula,
    isSpCall,
    layer,
    onChange,
    placeholder,
    type,
    value,
    isEditable,
  } = opt;
  let { canAdjust, decimal } = fObj;
  canAdjust = toBool(canAdjust);
  decimal = toNullOrInt(decimal) || 5;

  const fields = layer?.fields || [];
  let showVal = 0;
  let showTxt = null;
  let newFormula = formula;

  const calFields = filter(fields, (o) =>
    [FieldTypes.F_INTEGER, FieldTypes.F_SYSTEM_DEFINED].includes(o.type)
  );

  const regF = /[a-zA-Z0-9_]+/gm;
  const varFields =
    formula && formula.match(regF)
      ? formula.match(regF).sort((a, b) => b.length - a.length)
      : [];

  varFields.forEach((fi) => {
    if (!isNaN(fi)) return;

    const tmpField = calFields.find((e) => e.field === fi);
    if (typeof tmpField === 'undefined' || tmpField == null) {
      newFormula = newFormula?.replace(fi, 0);
    } else {
      newFormula = newFormula?.replace(fi, parseFloat(tmpField.value || 0));
    }
  });

  if (type === FieldTypes.F_FORMULA_FIELD) {
    try {
      showVal = eval(newFormula);
      showTxt = !isNaN(showVal) ? parseFloat(showVal.toFixed(decimal)) : 0;
    } catch (e) {
      if (e instanceof SyntaxError) {
        showTxt = e.message;
      }
    }
  }

  const comp = (
    <Form.Control
      type="text"
      value={showTxt}
      onChange={onChange}
      className="readonly"
      readOnly={!isEditable}
      required={false}
      placeholder={placeholder}
      min={0}
    />
  );

  const klz = fieldCls(isSpCall);
  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      {!canAdjust ? (
        comp
      ) : (
        <InputGroup className={klz[1]}>
          <Form.Control
            type="text"
            value={showTxt}
            onChange={onChange}
            className="readonly"
            readOnly={!isEditable}
            required={false}
            placeholder={placeholder}
            min={0}
          />
          <LTooltip idf="adjust_calculation">
            <Button
              variant="light"
              className="clipboardBtn"
              onClick={() => onChange(showTxt)}
              disabled={!isEditable}
            >
              {FIcons.faArrowRight}
            </Button>
          </LTooltip>
          <Form.Control
            type="text"
            value={value}
            onChange={onChange}
            required={false}
            placeholder={placeholder}
            min={0}
            readOnly={!isEditable}
          />
        </InputGroup>
      )}
    </Form.Group>
  );
};

export default PropCalculate;
