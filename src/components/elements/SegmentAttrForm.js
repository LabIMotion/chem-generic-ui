/* eslint-disable react/forbid-prop-types */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup } from 'react-bootstrap';
import { sortBy } from 'lodash';
import LFormGroup from '@components/shared/LFormGroup';
import { useDesignerContext } from '@components/designer/DesignerContext';

const SegmentAttrForm = forwardRef(({ element, editable }, ref) => {
  const { klasses } = useDesignerContext();
  const kLabel = useRef();
  const kDesc = useRef();
  const kKlass = useRef();

  useImperativeHandle(ref, () => ({
    k_label: kLabel.current,
    k_desc: kDesc.current,
    k_klass: kKlass.current,
  }));

  const activeKlasses = klasses?.filter((k) => k.is_active !== false);
  const sortedKlasses = sortBy(activeKlasses, ['label']);
  const klassOptions = sortedKlasses?.map((k) => (
    <option key={k.id} value={k.id}>
      {k.label}
    </option>
  ));

  return (
    <Form className="row input-form">
      <LFormGroup controlId="formControlLabel">
        <InputGroup>
          <InputGroup.Text>Segment Label</InputGroup.Text>
          <Form.Control type="text" defaultValue={element.label} ref={kLabel} />
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formControlDescription">
        <InputGroup>
          <InputGroup.Text>Description</InputGroup.Text>
          <Form.Control type="text" defaultValue={element.desc} ref={kDesc} />
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formControlAssignKlass">
        <InputGroup>
          <InputGroup.Text>Assign to Element</InputGroup.Text>
          <Form.Control
            key={element?.element_klass?.id}
            as="select"
            defaultValue={element?.element_klass?.id}
            ref={kKlass}
            disabled={!editable}
            readOnly={!editable}
          >
            {klassOptions}
          </Form.Control>
        </InputGroup>
      </LFormGroup>
    </Form>
  );
});

SegmentAttrForm.displayName = 'SegmentAttrForm';

SegmentAttrForm.propTypes = {
  element: PropTypes.object.isRequired,
  editable: PropTypes.bool.isRequired,
};

export default SegmentAttrForm;
