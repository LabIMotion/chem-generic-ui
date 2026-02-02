/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import SvgFileZoomPan from 'react-svg-file-zoom-pan';
import DroppablePanel from '@components/dnd/DroppablePanel';
import Constants from '@components/tools/Constants';
import FIcons from '@components/icons/FIcons';

const DropReaction = props => {
  const { field: fObj, onNavi, onChange, isEditable } = props;
  const { value = {} } = fObj;
  const {
    el_id: elId,
    el_label: elLabel,
    el_svg: elSvg,
    el_tip: elTip,
    el_type: elType,
  } = value;

  const svgPath = elSvg
    ? `/images/reactions/${elSvg}`
    : Constants.IMG_NOT_AVAILABLE_SVG;

  const reactionView = svgPath.endsWith('.svg') ? (
    <div style={{ width: '100%', height: 'auto' }}>
      <SvgFileZoomPan svgPath={svgPath} duration={300} resize />
    </div>
  ) : (
    <img src={svgPath} style={{ height: '26vh' }} alt="" />
  );

  const reactionError = (
    <>
      <span style={{ color: 'red' }}>{FIcons.faBan}</span>
      &nbsp; Reaction is not accessible.
    </>
  );

  const onDrop = item => {
    const { source, target } = item;
    const { element } = source;
    target.value = {
      el_id: element.id,
      el_label: element.short_label,
      el_svg: element.reaction_svg_file,
      el_type: element.type,
    };
    onChange({ target });
  };

  const showDrop = (
    <div
      className="lu-drop-zone"
      style={{ alignContent: 'center', height: 68 }}
    >
      Drop Reaction {FIcons.faFlask} Here
    </div>
  );

  const showReaction = () => {
    if (!isEditable && !elId) {
      return null;
    }
    if (!elId) {
      return showDrop;
    }
    const reactionLink = (
      <Button
        variant="link"
        style={{
          border: '1px solid #003366',
          borderRadius: '4px',
          padding: '0px 5px',
        }}
        onClick={() => onNavi(elType, elId)}
      >
        {elLabel}
      </Button>
    );

    const reactionImage = elTip === 'ERROR' ? reactionError : reactionView;

    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          {reactionLink}
        </div>
        {reactionImage}
      </div>
    );
  };

  return isEditable ? (
      <DroppablePanel
        type={["reaction"]} // rename the drop target as 'reaction' to differentiate the 'element' drop zones
        field={fObj}
        rowValue={{ key: fObj.type }}
        fnCb={onDrop}
      >
        {showReaction()}
      </DroppablePanel>
    ) : showReaction()
};

DropReaction.propTypes = {
  field: PropTypes.object.isRequired,
  onNavi: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DropReaction;
