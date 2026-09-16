/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, OverlayTrigger, Popover } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import { genUnit, getUnitSystem } from 'generic-ui-core';
import { getFieldProps, genUnitSup } from '@components/tools/utils';
import LLabel from '@components/shared/LLabel';

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

function PopUnits(si = []) {
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
}

function InputUnit(props) {
  const { fObj, fnUnitChange, compact } = props;
  const { option_layers: si, value_system: valueSystem } = fObj;
  const sis = getUnitSystem();
  const fSi = sis.filter((e) => e.field === si)[0];
  if (!fSi || Object.keys(fSi).length === 0) return null; // return if SI is not found

  const defaultUnit = fSi?.units[0];
  const unit = genUnit(fSi.field, valueSystem || defaultUnit?.key);
  if (!unit || Object.keys(unit).length === 0) return null; // return if unit is not found

  const onClick = () => {
    const nextUnit = getNextUnit(unit.key, fSi.units);
    fnUnitChange({ data: nextUnit.key });
  };

  const unitButton = (
    <OverlayTrigger
      animation
      placement="top"
      root
      trigger={['hover', 'focus']}
      overlay={PopUnits(fSi)}
    >
      <Button
        onClick={onClick}
        variant="success"
        size="sm"
        title="Set default unit"
      >
        {genUnitSup(unit.label) || ''}
      </Button>
    </OverlayTrigger>
  );

  // compact: just the button, sized to fit inline (e.g. inside a grid cell)
  if (compact) return unitButton;

  return (
    <Form.Group as={Col}>
      <LLabel>
        <>
          {getFieldProps('supportedUnits').label}&nbsp;
          {getFieldProps('supportedUnits').fieldTooltip}
        </>
      </LLabel>
      <div className="d-flex align-items-center">{unitButton}</div>
    </Form.Group>
  );
}

InputUnit.propTypes = {
  fObj: PropTypes.object.isRequired,
  fnUnitChange: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};

InputUnit.defaultProps = {
  compact: false,
};

export default InputUnit;
