import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup } from 'react-bootstrap';
import { sortBy } from 'lodash';
import LFormGroup from '@components/shared/LFormGroup';
import { useDesignerContext } from '@components/designer/DesignerContext';

// The "Wellplates" segment enables the dedicated wellplate tab, which only
// exists on generic elements, so this label may only be assigned to a generic
// element klass.
const WELLPLATE_SEGMENT_LABEL = 'Wellplates';

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

  // Controlled so the "Wellplates" restriction below can react as the user types.
  const [label, setLabel] = useState(element?.label ?? '');
  const restrictToGeneric = label.trim() === WELLPLATE_SEGMENT_LABEL;

  // Controlled so the "Wellplates" restriction below can move the selection to a
  // generic element programmatically (an uncontrolled select would not update).
  const [klassId, setKlassId] = useState(
    element?.element_klass?.id ?? sortedKlasses?.[0]?.id,
  );

  // When the label is "Wellplates", only generic elements may be assigned.
  const assignableKlasses = restrictToGeneric
    ? sortedKlasses?.filter((k) => k.is_generic === true)
    : sortedKlasses;
  const klassOptions = assignableKlasses?.map((k) => (
    <option key={k.id} value={k.id}>
      {k.label}
    </option>
  ));

  // If the label becomes "Wellplates" while a non-generic element is selected,
  // move the selection to the first generic element so a "Wellplates" segment can
  // never be assigned to a built-in element.
  useEffect(() => {
    if (!restrictToGeneric) return;
    const current = klasses?.find((k) => String(k.id) === String(klassId));
    if (!current || current.is_generic !== true) {
      setKlassId(assignableKlasses?.[0]?.id ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restrictToGeneric]);

  return (
    <Form className="row input-form">
      <LFormGroup controlId="formControlLabel">
        <InputGroup>
          <InputGroup.Text>Segment Label</InputGroup.Text>
          <Form.Control
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            ref={kLabel}
          />
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
            value={klassId}
            ref={kKlass}
            disabled={!editable}
            onChange={(e) => setKlassId(e.target.value)}
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
