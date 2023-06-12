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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsAlt,
  faPlus,
  faMinus,
  faSitemap,
} from '@fortawesome/free-solid-svg-icons';
import { GenPropertiesDate } from '../fields/GenPropertiesFields';

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
    const { layer, field, rowValue, handleMove } = props;
    const tar = { wf: layer.wf, fid: field, rId: rowValue.id };
    const src = monitor.getItem();
    if (tar.fid === src.fid && tar.rId !== src.rId)
      handleMove(src.rId, tar.rId);
  },
};

const PanelDnD = ({
  // isDragging,
  // isOver,
  // canDrop,
  layer,
  id,
  handleChange,
  bs,
  hasAi,
  onAttrChange,
}) => {
  const [{ isDraggingSource }, drag] = useDrag(() => {
    return {
      type: 'type', // Specify the drag type here
      canDrag: orderSource.canDrag,
      item: orderSource.beginDrag,
      collect: monitor => {
        return {
          isDraggingSource: monitor.isDragging(),
        };
      },
    };
  });

  const [{ isOver, isOverValidTarget }, drop] = useDrop(() => {
    // Drop configuration
    return {
      accept: 'type', // Specify the drop type here
      canDrop: orderTarget.canDrop,
      drop: orderTarget.drop,
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

  const btnLinkAna = hasAi ? (
    <OverlayTrigger
      delayShow={1000}
      placement="top"
      overlay={<Tooltip id="_tooltip_link_ana">link analysis</Tooltip>}
    >
      <Button
        bsSize="xsmall"
        onClick={event => handleChange(event, id, layer, 'ana-modal')}
      >
        <i className="fa fa-paperclip" aria-hidden="true" />
      </Button>
    </OverlayTrigger>
  ) : null;

  const btnAdd = (
    <OverlayTrigger
      delayShow={1000}
      placement="top"
      overlay={<Tooltip id="_tooltip_add_layer">add layer</Tooltip>}
    >
      <Button
        bsSize="xsmall"
        onClick={event => handleChange(event, id, layer, 'layer-modal')}
      >
        <FontAwesomeIcon icon={faPlus} />
      </Button>
    </OverlayTrigger>
  );

  const btnRemove = (
    <OverlayTrigger
      delayShow={1000}
      placement="top"
      overlay={<Tooltip id="_tooltip_remove_layer">remove layer</Tooltip>}
    >
      <Button
        bsSize="xsmall"
        onClick={event => handleChange(event, id, layer, 'layer-remove')}
      >
        <FontAwesomeIcon icon={faMinus} />
      </Button>
    </OverlayTrigger>
  );

  const wfIcon = wf ? (
    <span>
      <FontAwesomeIcon icon={faSitemap} />
    </span>
  ) : null;

  const moveIcon = (
    <OverlayTrigger
      delayShow={1000}
      placement="top"
      overlay={<Tooltip id={uuid()}>drag and drop to move position</Tooltip>}
    >
      <Button onClick={() => {}} bsSize="xsmall">
        <FontAwesomeIcon icon={faArrowsAlt} />
      </Button>
    </OverlayTrigger>
  );

  const splitKey = key.split('.');

  const extHead =
    splitKey.length > 1 ? (
      <span style={{ float: 'right' }}>
        {`Repetition ${splitKey[1]}`}
        &nbsp;
        {wfIcon}
      </span>
    ) : null;

  const btnLayer = wf ? (
    <ButtonGroup className="pull-right">
      {btnLinkAna}
      {btnAdd}
    </ButtonGroup>
  ) : (
    <ButtonGroup className="pull-right gu_btn_broup_layer">
      <div className="pull-right btn-group">
        {GenPropertiesDate({
          isSpCall: false,
          isAtLayer: true,
          label: '',
          value: timeRecord || '',
          onChange: onAttrChange,
        })}
        {btnLinkAna}
        {btnAdd}
        {btnRemove}
        {moveIcon}
      </div>
    </ButtonGroup>
  );

  const panelHeader = (
    <Panel.Heading
      className={klz}
      style={{ display: 'table-cell', verticalAlign: 'middle' }}
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
      <div className={dndKlz} ref={drop}>
        <div ref={drag}>{panelHeader}</div>
      </div>
    </div>
  );
};

export default PanelDnD;
