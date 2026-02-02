import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { GenPropertiesDate } from '@components/fields/GenPropertiesFields';
import Constants from '@components/tools/Constants';
import FIcons from '@components/icons/FIcons';
import { LWf } from '@components/shared/LCom';
import fbc from '@components/tools/ui-styles';

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
    editMode,
    grouped,
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

  const { style, label, wf = false, key, timeRecord } = layer;
  const isSys = key.startsWith(Constants.SYS_REACTION);

  const dndKlz = wf ? `dnd-none` : `dnd`;

  const klz = style || 'panel_generic_heading';

  const createButton = (icon, tooltip, tooltipId, handleClick) => {
    return (
      <OverlayTrigger
        key={`${layer.key}-${tooltipId}`}
        delayShow={1000}
        placement="top"
        overlay={<Tooltip id={`tooltip-${layer.key}-${tooltipId}`}>{tooltip}</Tooltip>}
      >
        <Button key={`btn-${layer.key}-${tooltipId}`} variant="light" size="sm" onClick={handleClick}>
          {icon}
        </Button>
      </OverlayTrigger>
    );
  };

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
    isSys ? 'Remove this reaction' : 'Remove layer',
    '_tooltip_remove_layer',
    (event) => handleChange(event, id, layer, 'layer-remove')
  );

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

  const layerHeader = () => {
    const splitKey = key.split('.');
    return (
      splitKey.length > 1 ? <span>{`Repetition ${splitKey[1]}`}</span> : null
    )
  }

  const layerWithButton = () => {
    const dateButton = (
      <ButtonGroup key={`${layer.key}-group1`}>
        {GenPropertiesDate({
          isSpCall: false,
          isAtLayer: true,
          label: undefined,
          value: timeRecord || '',
          onChange: onAttrChange,
          readOnly: !editMode,
        })}
      </ButtonGroup>
    );
    if (!editMode) return dateButton;
    const shouldEnableRemove = !wf && (/\.\d+$/.test(key) || isSys);
    return (
      <>
        {isSys ? null : dateButton}
        <ButtonGroup className="me-2" key={`${layer.key}-group2`}>
          {btnReaction}
          {btnLinkAna}
          {isSys ? null : btnAdd}
          {shouldEnableRemove ? btnRemove : null}
        </ButtonGroup>
      </>
    );
  };

  const accordionDiv = (
    <div className={fbc}>
      <LWf wf={wf} />
      {layerHeader()}
      {layerWithButton()}
    </div>
  );

  return <div>{accordionDiv}</div>;
};

export default PanelDnD;
