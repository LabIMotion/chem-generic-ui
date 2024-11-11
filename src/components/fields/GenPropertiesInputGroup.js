import React from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { genUnit } from 'generic-ui-core';
import FieldHeader from './FieldHeader';
import { fieldCls, genUnitSup } from '../tools/utils';
import mergeExt from '../../utils/ext-utils';

const ext = mergeExt();

const GenPropertiesInputGroup = (opt) => {
  const handleSubChange = React.useCallback(
    (event, id) => {
      opt.onSubChange(event, id, opt.f_obj);
    },
    [opt.onSubChange, opt.f_obj]
  );

  const klz = fieldCls(opt.isSpCall);

  const subs = opt.f_obj?.sub_fields?.map((e) => {
    if (e.type === 'label') {
      return (
        <InputGroup.Text key={`_label_${e.id}`}>{e.value}</InputGroup.Text>
      );
    }

    if (e.type === 'system-defined') {
      return (
        <React.Fragment key={`_fra_${e.id}`}>
          <Form.Control
            type="number"
            name={e.id}
            value={e.value || ''}
            onChange={(event) => handleSubChange(event, e.id)}
            min={1}
          />
          <Button
            onClick={() => opt.onSubChange(e, e.id, opt.f_obj)}
            variant="success"
          >
            {genUnitSup(genUnit(e.option_layers, e.value_system, ext).label) || ''}
          </Button>
        </React.Fragment>
      );
    }

    return (
      <Form.Control
        key={e.id}
        type={e.type}
        name={e.id}
        value={e.value || ''}
        onChange={(event) => handleSubChange(event, e.id, opt.f_obj)}
      />
    );
  });

  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <InputGroup className={klz[1]}>{subs}</InputGroup>
    </Form.Group>
  );
};

export default GenPropertiesInputGroup;
