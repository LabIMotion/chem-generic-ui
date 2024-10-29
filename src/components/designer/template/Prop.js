/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, useAccordionButton } from 'react-bootstrap';
import Constants from '../../tools/Constants';

const customToggleClass =
  'd-flex justify-content-between align-items-center p-2 rounded';

const CustomToggleContent = ({
  dnd,
  eventKey,
  callback,
  extClass,
  children,
  isSys,
}) => {
  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey)
  );
  return (
    <div className={`${customToggleClass} ${extClass || 'bg-light'}`}>
      <div
        className="flex-grow-1 d-flex justify-content-between align-items-center"
        onClick={isSys ? undefined : decoratedOnClick}
        style={{ cursor: isSys ? 'default' : 'pointer' }}
        aria-label="Toggle Accordion"
        role="button"
      >
        {children}
      </div>
      {dnd}
    </div>
  );
};

const Prop = ({
  dnd = undefined,
  extClass = '',
  layerKey,
  propHeader,
  toggleExpand,
  children,
}) => {
  // console.log('Prop layer.key=', layerKey);
  const isSys = layerKey.startsWith(Constants.SYS_REACTION);
  return (
    <Accordion
      key={`_accordion_design_props_${layerKey}`}
      id={`accordion_design_props_${layerKey}`}
      defaultActiveKey={isSys ? '1' : undefined}
    >
      <Accordion.Item className="panel_generic_properties" eventKey="1">
        <CustomToggleContent
          dnd={dnd}
          eventKey="1"
          callback={() => toggleExpand(layerKey)}
          extClass={extClass}
          isSys={isSys}
        >
          {propHeader}
        </CustomToggleContent>
        <Accordion.Body>{children}</Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

Prop.propTypes = {
  dnd: PropTypes.node,
  extClass: PropTypes.string,
  layerKey: PropTypes.string.isRequired,
  propHeader: PropTypes.node.isRequired,
  toggleExpand: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

Prop.defaultProps = {
  dnd: undefined,
  extClass: '',
};

export default Prop;
