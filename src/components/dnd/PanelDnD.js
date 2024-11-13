import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ButtonGroup, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { GenPropertiesDate } from '../fields/GenPropertiesFields';
import Constants from '../tools/Constants';
import FIcons from '../icons/FIcons';

const orderSource = {
  canDrag(props) {
    return !props.layer.wf;
  },
  beginDrag(props) {
    return props;
  },
};

const PanelDnD = (props) => {
  const {
    type,
    layer,
    field,
    handleMove,
    id,
    handleChange,
    onAttrChange,
    // bs,
    hasAi,
  } = props;

  const [{ isDraggingSource }, drag] = useDrag(() => {
    return {
      type,
      canDrag: () => orderSource.canDrag(props),
      item: () => orderSource.beginDrag(props),
      collect: (monitor) => {
        return {
          isDraggingSource: monitor.isDragging(),
        };
      },
    };
  });

  const [{ isOver, isOverValidTarget }, drop] = useDrop(() => {
    return {
      accept: type,
      canDrop: (item) => !layer.wf || !item.layer.wf,
      drop: (item) => {
        if (field === item.field && layer.key !== item.layer.key)
          handleMove(item.layer.key, layer.key);
      },
      collect: (monitor) => {
        return {
          isOver: monitor.isOver(),
          isOverValidTarget: monitor.canDrop(),
        };
      },
    };
  });

  const className = `generic_grid_dnd${isOver ? ' is-over' : ''}${
    isOverValidTarget ? ' can-drop' : ''
  }${isDraggingSource ? ' is-dragging' : ''}`;

  const { style, label, wf, key, timeRecord } = layer;
  const dndKlz = wf ? `dnd-none` : `dnd`;

  const klz = style || 'panel_generic_heading';

  const createButton = (icon, tooltip, tooltipId, handleClick) => (
    <OverlayTrigger
      delayShow={1000}
      placement="top"
      overlay={<Tooltip id={tooltipId}>{tooltip}</Tooltip>}
    >
      <Button variant="light" size="sm" onClick={handleClick}>
        {icon}
      </Button>
    </OverlayTrigger>
  );

  const btnLinkAna = hasAi
    ? createButton(
        FIcons.faPaperclip,
        'link analysis',
        '_tooltip_link_ana',
        (event) => handleChange(event, id, layer, 'ana-modal')
      )
    : null;

  const btnReaction = createButton(
    FIcons.faFlask,
    'Add reaction',
    '_tooltip_layer_add_reaction',
    (event) => handleChange(event, id, layer, 'layer-add-reaction')
  );

  const btnAdd = createButton(
    FIcons.faPlus,
    'Add layer',
    '_tooltip_add_layer',
    (event) => handleChange(event, id, layer, 'layer-modal')
  );

  const btnRemove = createButton(
    FIcons.faMinus,
    'Remove layer',
    '_tooltip_remove_layer',
    (event) => handleChange(event, id, layer, 'layer-remove')
  );

  const wfIcon = wf ? <span>{FIcons.faDiagramProject}</span> : null;

  const moveIcon = (
    <div className={dndKlz}>
      <div className="text-black">
        <span>{FIcons.faArrowsUpDownLeftRight}</span>
      </div>
    </div>
  );
  const moveDiv = (
    <div
      className={`p-2 m-2 ${className}`}
      ref={(node) => drag(drop(node))}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {moveIcon}
    </div>
  );

  const splitKey = key.split('.');
  const isSys = key.startsWith(Constants.SYS_REACTION);

  const extHead =
    splitKey.length > 1 ? (
      <span>
        {`Repetition ${splitKey[1]}`}
        &nbsp;
        {wfIcon}
      </span>
    ) : null;

  const btnLayer = wf ? (
    <>
      {isSys ? null : (
        <ButtonGroup>
          {GenPropertiesDate({
            isSpCall: false,
            isAtLayer: true,
            label: undefined,
            value: timeRecord || '',
            onChange: onAttrChange,
          })}
        </ButtonGroup>
      )}
      <ButtonGroup className="me-2">
        {btnReaction}
        {btnLinkAna}
        {isSys ? null : btnAdd}
      </ButtonGroup>
    </>
  ) : (
    <>
      {isSys ? null : (
        <ButtonGroup>
          {GenPropertiesDate({
            isSpCall: false,
            isAtLayer: true,
            label: undefined,
            value: timeRecord || '',
            onChange: onAttrChange,
          })}
        </ButtonGroup>
      )}
      <ButtonGroup className="me-1">
        {btnReaction}
        {btnLinkAna}
        {isSys ? null : btnAdd}
        {btnRemove}
      </ButtonGroup>
      {/* {moveDiv} */}
      {/* <ButtonGroup className={className}>{moveIcon}</ButtonGroup> */}
    </>
  );

  const accordionDiv = (
    <div className="py-2 d-flex justify-content-between align-items-center">
      {extHead}
      {btnLayer}
    </div>
  );

  return <div>{accordionDiv}</div>;
};

export default PanelDnD;
