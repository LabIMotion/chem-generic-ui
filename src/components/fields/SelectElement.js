import React from 'react';
import { Button, Form } from 'react-bootstrap';
import Constants from '@components/tools/Constants';
import ElementSelectButton from '@components/shared/ElementSelectButton';
import FieldHeader from '@components/fields/FieldHeader';
import FIcons from '@components/icons/FIcons';
import { fnToggle } from '@ui/common/fnToggle';
import { FN_ID } from '@ui/common/fnConstants';

const DUMMY_BUTTON = (
  <Button variant="success" size="xsm" disabled>
    Link Element
  </Button>
);

const SelectElement = (props) => {
  const { onChange, readOnly, isEditable, isPreview, onNavi, type, value } =
    props;
  const {
    el_id: elId,
    el_label: elLabel,
    el_name: elName,
    el_type: elType,
    el_klass: elKlass,
    icon_name: iconName,
    el_tip: elTip,
  } = value || {};

  const handleElementSelect = (element) => {
    if (!element || !element.id) return;
    const newValue = {
      el_id: element.id,
      el_type: Constants.PERMIT_TARGET.ELEMENT,
      icon_name: element.klass_icon || '',
      el_klass: element.klass_name,
      el_label: element.short_label,
      el_name: element.name || '',
      el_tip: `${element.klass_label}${Constants.SEPARATOR_TAG}${element.name}`,
    };
    onChange(newValue);
  };

  const ElementLink = () => {
    if (!elId) return <span />;
    const [, eName] = (elTip || '').split(Constants.SEPARATOR_TAG);
    return (
      <span className="d-flex align-items-center gap-3">
        <a
          role="link"
          onClick={() => onNavi(elKlass, elId)}
          className="lu-link"
        >
          <i className={iconName} />{' '}
          <span className="reaction-material-link">{elLabel || eName}</span>{' '}
          {FIcons.faArrowUpRightFromSquare}
        </a>
        <Button
          size="sm"
          variant="danger"
          onClick={() => onChange({})}
          disabled={!isEditable}
        >
          {FIcons.faTrashCan}
        </Button>
      </span>
    );
  };

  if (isPreview) {
    return (
      <Form.Group>
        {FieldHeader(props)}
        <div>{DUMMY_BUTTON}</div>
      </Form.Group>
    );
  }

  return (
    <Form.Group>
      {FieldHeader(props)}
      <div>
        {elId ? (
          <ElementLink />
        ) : (
          <ElementSelectButton onSelect={handleElementSelect} />
        )}
      </div>
    </Form.Group>
  );
};

SelectElement.fnId = FN_ID.FN_DRAG_EL_CHEMOTION;

export default fnToggle(SelectElement);
