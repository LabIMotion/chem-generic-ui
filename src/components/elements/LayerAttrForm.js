/* eslint-disable react/forbid-prop-types */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup } from 'react-bootstrap';
import LFormGroup from '../shared/LFormGroup';

const LayerAttrForm = forwardRef(({ layer, isAttrOnWF }, ref) => {
  const attLayerKey = useRef();
  const attLabel = useRef();
  const attCols = useRef();
  const attPosition = useRef();
  const attColor = useRef();
  const attStyle = useRef();
  const attWf = useRef();

  useImperativeHandle(ref, () => ({
    attLayerKey: attLayerKey.current,
    attLabel: attLabel.current,
    attCols: attCols.current,
    attPosition: attPosition.current,
    attColor: attColor.current,
    attStyle: attStyle.current,
    attWf: attWf.current,
  }));

  return (
    <Form className="row input-form">
      <LFormGroup controlId="formControlLayerKey">
        <InputGroup>
          <InputGroup.Text>Name</InputGroup.Text>
          <Form.Control
            type="text"
            defaultValue={layer.key}
            ref={attLayerKey}
            readOnly={!!layer.key}
          />
        </InputGroup>
        <div className="help">
          Layer name is unique in the template, at least 3 characters
          <br />
          Layer name must contain only lowercase letters and underscores,
          underscores can not be the first/last one character
          <br />
          Layer name should not contain special characters like $, !, %, etc.
        </div>
      </LFormGroup>
      <LFormGroup controlId="formControlLayerLabel">
        <InputGroup>
          <InputGroup.Text>Display name</InputGroup.Text>
          <Form.Control type="text" defaultValue={layer.label} ref={attLabel} />
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formControlLayerCols">
        <InputGroup>
          <InputGroup.Text>Columns per row</InputGroup.Text>
          <Form.Select defaultValue={layer.cols || 1} ref={attCols}>
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Form.Select>
          {/* <Form.Control
            as="select"
            defaultValue={layer.cols || 1}
            ref={attCols}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </Form.Control> */}
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formControlLayerPosition">
        <InputGroup>
          <InputGroup.Text>Sequential position</InputGroup.Text>
          <Form.Control
            type="number"
            defaultValue={layer.position}
            ref={attPosition}
            min={1}
          />
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formControlLayerColor">
        <InputGroup>
          <InputGroup.Text>Header color</InputGroup.Text>
          <Form.Control as="select" defaultValue={layer.color} ref={attColor}>
            <option value="none">none</option>
            <option value="primary">Blue</option>
            <option value="info">Blue - Light</option>
            <option value="success">Green</option>
            <option value="default">Grey</option>
            <option value="danger">Red</option>
            <option value="warning">Yellow</option>
          </Form.Control>
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formCtlHeaderStyle">
        <InputGroup>
          <InputGroup.Text>Style Option</InputGroup.Text>
          <Form.Control as="select" defaultValue={layer.style} ref={attStyle}>
            <option value="panel_generic_heading">bold</option>
            <option value="panel_generic_heading_bu">bold + underline</option>
            <option value="panel_generic_heading_bui">
              bold + underline + italic
            </option>
          </Form.Control>
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formCtlWF" hidden={!isAttrOnWF}>
        <InputGroup>
          <InputGroup.Text>used in Workflow?</InputGroup.Text>
          <Form.Control as="select" defaultValue={layer?.wf} ref={attWf}>
            <option value={false}>No</option>
            <option value>Yes</option>
          </Form.Control>
        </InputGroup>
      </LFormGroup>
    </Form>
  );
});

LayerAttrForm.propTypes = {
  layer: PropTypes.object.isRequired,
  isAttrOnWF: PropTypes.bool.isRequired,
};

LayerAttrForm.displayName = 'LayerAttrForm';

export default LayerAttrForm;
