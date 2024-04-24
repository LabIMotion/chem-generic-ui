import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  Panel,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
  Button,
} from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
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

const PanelDnD = props => {
  const {
    type,
    layer,
    field,
    handleMove,
    id,
    handleChange,
    onAttrChange,
    bs,
    hasAi,
  } = props;

  const [{ isDraggingSource }, drag] = useDrag(() => {
    return {
      type,
      canDrag: () => orderSource.canDrag(props),
      item: () => orderSource.beginDrag(props),
      collect: monitor => {
        return {
          isDraggingSource: monitor.isDragging(),
        };
      },
    };
  });

  const [{ isOver, isOverValidTarget }, drop] = useDrop(() => {
    return {
      accept: type,
      canDrop: item => !layer.wf || !item.layer.wf,
      drop: item => {
        if (field === item.field && layer.key !== item.layer.key)
          handleMove(item.layer.key, layer.key);
      },
      collect: monitor => {
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

  const klz = (style || 'panel_generic_heading').replace(
    'panel_generic_heading',
    'panel_generic_heading_slim'
  );

  const createButton = (icon, tooltip, tooltipId, handleClick) => (
    <OverlayTrigger
      delayShow={1000}
      placement="top"
      overlay={<Tooltip id={tooltipId}>{tooltip}</Tooltip>}
    >
      <Button className="btn-gxs" onClick={handleClick}>
        {icon}
      </Button>
    </OverlayTrigger>
  );

  const btnLinkAna = hasAi
    ? createButton(
        FIcons.faPaperclip,
        'link analysis',
        '_tooltip_link_ana',
        event => handleChange(event, id, layer, 'ana-modal')
      )
    : null;

  const btnReaction = createButton(
    FIcons.faFlask,
    'Add reaction',
    '_tooltip_layer_add_reaction',
    event => handleChange(event, id, layer, 'layer-add-reaction')
  );

  const btnAdd = createButton(
    FIcons.faPlus,
    'Add layer',
    '_tooltip_add_layer',
    event => handleChange(event, id, layer, 'layer-modal')
  );

  const btnRemove = createButton(
    FIcons.faMinus,
    'Remove layer',
    '_tooltip_remove_layer',
    event => handleChange(event, id, layer, 'layer-remove')
  );

  const wfIcon = wf ? <span>{FIcons.faDiagramProject}</span> : null;

  const moveIcon = (
    <OverlayTrigger
      delayShow={1000}
      placement="top"
      overlay={<Tooltip id={uuid()}>Change position via drag and drop</Tooltip>}
    >
      <Button onClick={() => {}} bsSize="xsmall">
        {FIcons.faArrowsUpDownLeftRight}
      </Button>
    </OverlayTrigger>
  );

  const splitKey = key.split('.');
  const isSys = key.startsWith(Constants.SYS_REACTION);

  const extHead =
    splitKey.length > 1 ? (
      <span style={{ float: 'right' }}>
        {`Repetition ${splitKey[1]}`}
        &nbsp;
        {wfIcon}
      </span>
    ) : null;

  const btnLayer = wf ? (
    <ButtonGroup className="pull-right gu_btn_broup_layer">
      {isSys
        ? null
        : GenPropertiesDate({
            isSpCall: false,
            isAtLayer: true,
            label: '',
            value: timeRecord || '',
            onChange: onAttrChange,
          })}
      {btnReaction}
      {btnLinkAna}
      {isSys ? null : btnAdd}
    </ButtonGroup>
  ) : (
    <ButtonGroup className="pull-right gu_btn_broup_layer">
      <div className="pull-right btn-group">
        {isSys
          ? null
          : GenPropertiesDate({
              isSpCall: false,
              isAtLayer: true,
              label: '',
              value: timeRecord || '',
              onChange: onAttrChange,
            })}
        {btnReaction}
        {btnLinkAna}
        {isSys ? null : btnAdd}
        {btnRemove}
        {moveIcon}
      </div>
    </ButtonGroup>
  );

  const panelHeader = (
    <Panel.Heading
      className={klz}
      style={{ display: 'flow', verticalAlign: 'middle' }}
    >
      <Panel.Title toggle style={{ float: 'left' }}>
        {label}&nbsp;
      </Panel.Title>
      {btnLayer}
      {extHead}
      <div className="clearfix" />
    </Panel.Heading>
  );

  const panelHColor = bs !== 'none' ? `panel-${bs}` : '';
  const dndKlz = wf ? `dnd-none ${panelHColor}` : `dnd ${panelHColor}`;

  return (
    <div className={className}>
      <div className={dndKlz} ref={node => drag(drop(node))}>
        {panelHeader}
      </div>
    </div>
  );
};

export default PanelDnD;
