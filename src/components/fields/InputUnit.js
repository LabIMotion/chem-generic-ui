/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, OverlayTrigger, Popover } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import { genUnit, getUnitSystem } from 'generic-ui-core';
import { getFieldProps, genUnitSup } from '../tools/utils';
import LLabel from '../shared/LLabel';
import mergeExt from '../../utils/ext-utils';

const getNextUnit = (currentUnit, units) => {
  // Find the index of the current unit in the units array
  const currentIndex = units.findIndex((unit) => unit.key === currentUnit);

  // If the unit is not found, throw an error
  if (currentIndex === -1) return null;

  // Get the next index, wrapping around to 0 if we're at the end of the array
  const nextIndex = (currentIndex + 1) % units.length;

  // Return the object of the next unit
  return units[nextIndex];
};

const convertUnits = (fromUnit, toUnit, value, units) => {
  // Find the 'from' and 'to' units in the units array
  const from = units.find((unit) => unit.key === fromUnit);
  const to = units.find((unit) => unit.key === toUnit);

  // If either unit is not found, throw an error
  if (!from || !to) return null;

  // Convert the value from the 'from' unit to the 'to' unit
  const result = value * (from.nm / to.nm);
  return parseFloat(result.toFixed(5));
};

const PopUnits = (si = []) => {
  const tbl = si.units.map((e) => (
    <div key={uuid()}>
      {genUnitSup(e.label)}
      <br />
    </div>
  ));
  return (
    <Popover id="popover-positioned-scrolling-left">
      <Popover.Header as="h3">Available units</Popover.Header>
      <Popover.Body>{tbl}</Popover.Body>
    </Popover>
  );
};

const InputUnit = (props) => {
  const { fObj, fnUnitChange } = props;
  const { option_layers: si, value_system: valueSystem } = fObj;
  let ext = mergeExt(false);
  const sis = getUnitSystem(ext);
  const fSi = sis.filter((e) => e.field === si)[0];
  if (!fSi || Object.keys(fSi).length === 0) return null; // return if SI is not found

  const defaultUnit = fSi?.units[0];
  ext = mergeExt();
  const unit = genUnit(fSi.field, (valueSystem || defaultUnit?.key), ext);
  if (!unit || Object.keys(unit).length === 0) return null; // return if unit is not found

  const onClick = () => {
    const nextUnit = getNextUnit(unit.key, fSi.units);
    fnUnitChange({ data: nextUnit.key });
  };

  return (
    <Form.Group as={Col}>
      <LLabel>
        <>
          {getFieldProps('supportedUnits').label}&nbsp;
          {getFieldProps('supportedUnits').fieldTooltip}
        </>
      </LLabel>
      <div className="d-flex align-items-center">
        <OverlayTrigger
          animation
          placement="top"
          root
          trigger={['hover', 'focus']}
          overlay={PopUnits(fSi)}
        >
          <Button onClick={onClick} variant="success" size="sm">
            {genUnitSup(unit.label) || ''}
          </Button>
        </OverlayTrigger>
      </div>
    </Form.Group>
  );
};

InputUnit.propTypes = {
  fObj: PropTypes.object.isRequired,
  fnUnitChange: PropTypes.func.isRequired,
};

export default InputUnit;
