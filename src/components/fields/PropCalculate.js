import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import FieldHeader from '@components/fields/FieldHeader';
import { fieldCls } from '@components/tools/utils';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import { toBool } from '@utils/pureUtils';
import {
  buildLayerFormula,
  evalFormulaText,
  resolveFormulaDecimals,
} from '@utils/formulaUtils';

function PropCalculate(opt) {
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
  let { canAdjust = false, decimal = 5 } = fObj;
  canAdjust = toBool(canAdjust);
  decimal = resolveFormulaDecimals(decimal);

  const fields = layer?.fields || [];
  let showTxt = null;

  const newFormula = buildLayerFormula(formula, fields);

  if (type === FieldTypes.F_FORMULA_FIELD) {
    showTxt = evalFormulaText(newFormula, decimal);
  }

  const comp = (
    <Form.Control
      type="text"
      value={showTxt}
      className="text-end"
      readOnly
      disabled
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
          {comp}
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
            className="text-end"
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
}

export default PropCalculate;
