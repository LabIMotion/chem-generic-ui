import React from 'react';
import {
  Button,
  FormControl,
  FormGroup,
  InputGroup,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { filter } from 'lodash';
import { FieldTypes } from 'generic-ui-core';
import FieldHeader from './FieldHeader';
import { fieldCls, toBool, toNullOrInt } from '../tools/utils';
import FIcons from '../icons/FIcons';

const PropCalculate = opt => {
  const {
    f_obj: fObj,
    formula,
    isSpCall,
    layer,
    onChange,
    placeholder,
    type,
    value,
  } = opt;
  let { canAdjust, decimal } = fObj;
  canAdjust = toBool(canAdjust);
  decimal = toNullOrInt(decimal) || 5;

  const fields = layer?.fields || [];
  let showVal = 0;
  let showTxt = null;
  let newFormula = formula;

  const calFields = filter(fields, o =>
    [FieldTypes.F_INTEGER, FieldTypes.F_SYSTEM_DEFINED].includes(o.type)
  );

  const regF = /[a-zA-Z0-9_]+/gm;
  const varFields =
    formula && formula.match(regF)
      ? formula.match(regF).sort((a, b) => b.length - a.length)
      : [];

  varFields.forEach(fi => {
    if (!isNaN(fi)) return;

    const tmpField = calFields.find(e => e.field === fi);
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
    <FormControl
      type="text"
      value={showTxt}
      onChange={onChange}
      className="readonly"
      readOnly="readonly"
      required={false}
      placeholder={placeholder}
      min={0}
    />
  );

  const klz = fieldCls(isSpCall);
  return (
    <FormGroup className={klz[0]}>
      {FieldHeader(opt)}
      {!canAdjust ? (
        comp
      ) : (
        <InputGroup className={klz[1]}>
          <FormControl
            type="text"
            value={showTxt}
            onChange={onChange}
            className="readonly"
            readOnly="readonly"
            required={false}
            placeholder={placeholder}
            min={0}
          />
          <InputGroup.Button>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="update_calculation_field">adjust</Tooltip>}
            >
              <Button
                active
                className="clipboardBtn"
                onClick={() => onChange(showTxt)}
              >
                {FIcons.faArrowRight}
              </Button>
            </OverlayTrigger>
          </InputGroup.Button>
          <FormControl
            type="text"
            value={value}
            onChange={onChange}
            required={false}
            placeholder={placeholder}
            min={0}
          />
        </InputGroup>
      )}
    </FormGroup>
  );
};

export default PropCalculate;
