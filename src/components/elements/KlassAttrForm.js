/* eslint-disable react/forbid-prop-types */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup, Button } from 'react-bootstrap';
import LFormGroup from '@components/shared/LFormGroup';

const KlassAttrForm = forwardRef(({ element, editable }, ref) => {
  const kName = useRef();
  const kPrefix = useRef();
  const kLabel = useRef();
  const kIconname = useRef();
  const kDesc = useRef();

  useImperativeHandle(ref, () => ({
    k_name: kName.current,
    k_prefix: kPrefix.current,
    k_label: kLabel.current,
    k_iconname: kIconname.current,
    k_desc: kDesc.current,
  }));

  return (
    <Form className="row input-form">
      <LFormGroup controlId="formControlKlass">
        <InputGroup>
          <InputGroup.Text>Element</InputGroup.Text>
          <Form.Control
            type="text"
            defaultValue={element.name}
            ref={kName}
            disabled={!editable}
          />
        </InputGroup>
        <div className="help">
          Element must be at least 3 characters long and can not be longer than
          10 characters
          <br />
          Element is only lowercase letters allowed
          <br />
          Element should not contain special characters like $, !, %, etc.
        </div>
      </LFormGroup>
      <LFormGroup controlId="formControlPrefix">
        <InputGroup>
          <InputGroup.Text>Prefix</InputGroup.Text>
          <Form.Control
            type="text"
            defaultValue={element.klass_prefix}
            ref={kPrefix}
          />
        </InputGroup>
        <div className="help">
          Prefix is used to define the prefix of Element label
          <br />
          Prefix should not contain special characters like $, !, %, etc.
        </div>
      </LFormGroup>
      <LFormGroup controlId="formControlLabel">
        <InputGroup>
          <InputGroup.Text>Element Label</InputGroup.Text>
          <Form.Control type="text" defaultValue={element.label} ref={kLabel} />
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formControlIcon">
        <InputGroup>
          <InputGroup.Text>Icon</InputGroup.Text>
          {element.icon_name ? (
            <InputGroup.Text>
              <i className={element.icon_name} />
            </InputGroup.Text>
          ) : null}
          <Form.Control
            type="text"
            defaultValue={element.icon_name}
            ref={kIconname}
          />
        </InputGroup>
        <div className="help">
          Icon is used to represent a particular element. Please use the icon
          code from
          <Button
            variant="link"
            size="sm"
            href="https://fontawesome.com/v4.7/icons/"
            target="_blank"
          >
            Font Awesome 4
          </Button>
          . The icon code format is like &lsquo; fa fa-abc &rsquo;.
        </div>
      </LFormGroup>
      <LFormGroup controlId="formControlDescription">
        <InputGroup>
          <InputGroup.Text>Description</InputGroup.Text>
          <Form.Control type="text" defaultValue={element.desc} ref={kDesc} />
        </InputGroup>
      </LFormGroup>
    </Form>
  );
});

KlassAttrForm.displayName = 'KlassAttrForm';

KlassAttrForm.propTypes = {
  element: PropTypes.object.isRequired,
  editable: PropTypes.bool.isRequired,
};

export default KlassAttrForm;
