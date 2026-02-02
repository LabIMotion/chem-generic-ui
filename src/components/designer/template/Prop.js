/* eslint-disable react/forbid-prop-types */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Accordion, useAccordionButton } from 'react-bootstrap';
import Constants from '@components/tools/Constants';
import FLEX_BETWEEN_CENTER from '@components/tools/ui-styles';
import { isFirstLayer } from '@components/details/handler';

const ACCORDION_EVENT_KEY = '1';
const ACCORDION_PREFIX = 'accordion_design_props_';
const CUSTOM_TOGGLE_CLASS = `py-1 ${FLEX_BETWEEN_CENTER} rounded`;

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
    <div className={`${CUSTOM_TOGGLE_CLASS} ${extClass || 'lu-bg-light'}`}>
      <div
        className={`flex-grow-1 ${FLEX_BETWEEN_CENTER}`}
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

CustomToggleContent.propTypes = {
  dnd: PropTypes.node,
  eventKey: PropTypes.string.isRequired,
  callback: PropTypes.func,
  extClass: PropTypes.string,
  children: PropTypes.node.isRequired,
  isSys: PropTypes.bool.isRequired,
};

CustomToggleContent.defaultProps = {
  dnd: undefined,
  callback: undefined,
  extClass: '',
};

const Prop = ({
  dnd = undefined,
  extClass = '',
  layerKey,
  propHeader,
  layers,
  expandAll,
  children,
}) => {
  const [initialized, setInitialized] = useState(true);
  const isSys = layerKey.startsWith(Constants.SYS_REACTION);
  const isFirst = isFirstLayer(layers, layerKey);
  const [expand, setExpand] = useState(() => {
    if (initialized && isFirst) {
      return true;
    }
    if (expandAll != null) {
      return expandAll;
    }
    return false;
  });

  useEffect(() => {
    if (expandAll != null) {
      setExpand(expandAll);
      setInitialized(false);
    }
  }, [expandAll]);

  const handleToggle = () => {
    if (!isSys) {
      setExpand(!expand);
      setInitialized(false);
    }
  };

  let isExpanded = expand;
  if (isSys) {
    isExpanded = true;
  }
  return (
    <Accordion
      key={`${ACCORDION_PREFIX}${layerKey}`}
      id={`_${ACCORDION_PREFIX}${layerKey}`}
      activeKey={isExpanded ? ACCORDION_EVENT_KEY : undefined}
    >
      <Accordion.Item
        key={`_${ACCORDION_PREFIX}item_${layerKey}`}
        className="panel_generic_properties pb-3"
        eventKey={ACCORDION_EVENT_KEY}
      >
        <CustomToggleContent
          dnd={dnd}
          eventKey={ACCORDION_EVENT_KEY}
          callback={handleToggle}
          extClass={extClass}
          isSys={isSys}
        >
          {propHeader}
        </CustomToggleContent>
        <Accordion.Body className="py-0 px-3">{children}</Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

Prop.propTypes = {
  dnd: PropTypes.node,
  extClass: PropTypes.string,
  layerKey: PropTypes.string.isRequired,
  propHeader: PropTypes.node.isRequired,
  layers: PropTypes.object,
  expandAll: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

Prop.defaultProps = {
  dnd: undefined,
  extClass: '',
  layers: {},
  expandAll: undefined,
};

export default Prop;
