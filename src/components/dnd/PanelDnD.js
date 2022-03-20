/* eslint-disable max-len */
import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { compose } from 'redux';
import { Panel, ButtonGroup, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const orderSource = {
  canDrag(props) {
    return !props.layer.wf;
  },
  beginDrag(props) {
    const { layer, field, rowValue } = props;
    return { wf: layer.wf, fid: field, rId: rowValue.id };
  },
};

const orderTarget = {
  canDrop(props, monitor) {
    const src = monitor.getItem();
    return !props.layer.wf || !src.wf;
  },
  drop(props, monitor) {
    const {
      layer, field, rowValue, handleMove
    } = props;
    const tar = { wf: layer.wf, fid: field, rId: rowValue.id };
    const src = monitor.getItem();
    if (tar.fid === src.fid && tar.rId !== src.rId) handleMove(src.rId, tar.rId);
  },
};

const orderDragCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
});

const orderDropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

const PanelDnD = ({
  connectDragSource, connectDropTarget, isDragging, isOver, canDrop,
  layer, id, handleChange, bs
}) => {
  const className = `generic_grid_dnd${isOver ? ' is-over' : ''}${canDrop ? ' can-drop' : ''}${isDragging ? ' is-dragging' : ''}`;
  const {
    style, label, wf, key
  } = layer;
  const klz = (style || 'panel_generic_heading').replace('panel_generic_heading', 'panel_generic_heading_slim');
  const btnAdd = (
    <OverlayTrigger delayShow={1000} placement="top" overlay={<Tooltip id="_tooltip_add_layer">add layer</Tooltip>}>
      <Button bsSize="xsmall" onClick={event => handleChange(event, id, layer, 'layer-modal')}><FontAwesomeIcon icon="fas fa-plus" /></Button>
    </OverlayTrigger>
  );
  const btnRemove = (
    <OverlayTrigger delayShow={1000} placement="top" overlay={<Tooltip id="_tooltip_remove_layer">remove layer</Tooltip>}>
      <Button bsSize="xsmall" onClick={event => handleChange(event, id, layer, 'layer-remove')}><FontAwesomeIcon icon="fas fa-minus" /></Button>
    </OverlayTrigger>
  );
  const wfIcon = wf ? (<span>&nbsp;<FontAwesomeIcon icon="fas fa-sitemap" /></span>) : null;
  const moveIcon = (
    <OverlayTrigger delayShow={1000} placement="top" overlay={<Tooltip id={uuid()}>drag and drop to move position</Tooltip>}>
      <Button onClick={() => {}} bsSize="xsmall"><FontAwesomeIcon icon="fas fa-arrows-alt" /></Button>
    </OverlayTrigger>);
  const btnLayer = wf ? (<ButtonGroup className="pull-right" >{btnAdd}</ButtonGroup>) : (<ButtonGroup className="pull-right" >{btnAdd}{btnRemove}{moveIcon}</ButtonGroup>);
  const extHead = (/\./g.test(key)) ? <>({key}{wfIcon})</> : null;
  const panelHeader = (
    <Panel.Heading className={klz}>
      <Panel.Title toggle style={{ float: 'left', lineHeight: 'normal' }}>{label}&nbsp;{extHead}</Panel.Title>{btnLayer}
      <div className="clearfix" />
    </Panel.Heading>
  );
  const panelHColor = bs !== 'none' ? `panel-${bs}` : '';
  const dndKlz = wf ? `dnd-none ${panelHColor}` : `dnd ${panelHColor}`;
  return compose(connectDragSource, connectDropTarget)(<div className={className}><div className={dndKlz}>{panelHeader}</div></div>);
};

export default compose(
  DragSource(s => s.type, orderSource, orderDragCollect),
  DropTarget(s => s.type, orderTarget, orderDropCollect)
)(PanelDnD);
