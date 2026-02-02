/* eslint-disable no-unused-vars */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import Constants from '@components/tools/Constants';
import { KlzIcon, searchTargets } from '@components/tools/utils';
import buildTableSource from '@utils/table/build-table-source';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

const base = (opt, iconClass, onDrop = () => {}, params = {}) => {
  if (opt.value && opt.value.el_id) {
    const label = opt.value.el_label;
    let elSvg = opt.value.el_svg;
    if (opt.value.el_type === 'sample') {
      if (elSvg && !elSvg.endsWith('.svg') && opt.value.el_decoupled) {
        elSvg = Constants.IMG_NOT_AVAILABLE_SVG;
      }
    }
    if (elSvg && !elSvg.endsWith('.svg'))
      elSvg = Constants.IMG_NOT_AVAILABLE_SVG;
    const pop = (
      <Popover
        id="popover-svg"
        title={label}
        style={{ maxWidth: 'none', maxHeight: 'none' }}
      >
        <img src={elSvg} style={{ height: '26vh', width: '26vh' }} alt="" />
      </Popover>
    );
    const asShown = (path) =>
      path === Constants.IMG_NOT_AVAILABLE_SVG ? (
        KlzIcon(`icon-${iconClass}`, { width: '4vw', fontSize: 'x-large' })
      ) : (
        <OverlayTrigger
          delayShow={1000}
          trigger={['hover', 'focus']}
          placement="top"
          rootClose
          onHide={null}
          overlay={pop}
        >
          <img className="generic_grid_img" src={path} alt="" />
        </OverlayTrigger>
      );
    const simg = (path, txt) =>
      path && path !== '' ? (
        <div className="s-img">
          {asShown(path)}
          <div className="del_btn">
            <LTooltip idf="remove_molecule">
              <Button
                variant="danger"
                size="xsm"
                className="btn_del"
                onClick={() => onDrop({}, params)}
              >
                {FIcons.faTrashCan}
              </Button>
            </LTooltip>
          </div>
        </div>
      ) : (
        <div className="data" style={{ width: '4vw' }}>
          {txt}
        </div>
      );
    return simg(elSvg, label);
  }
  return KlzIcon(`icon-${iconClass} indicator`, {
    width: '4vw',
    fontSize: 'x-large',
  });
};

const show = (opt, iconClass, onDrop) => {
  if (opt.type === FieldTypes.F_TABLE) {
    const sField = opt.sField || {};
    const subVal = opt.data[sField.id];
    const { data } = opt;
    return base(subVal, iconClass, onDrop, { sField, data });
  }
  return base(opt, iconClass);
};

const GenericElTableDropTarget = (props) => {
  const { opt, onDrop, genericType } = props;
  const [{ isOver, isOverValidTarget }, drop] = useDrop({
    accept: searchTargets(opt.dndItems),
    drop: (targetProps, monitor) => {
      const sourceProps = monitor.getItem().element;
      const type = opt.sField.type.split('_')[1];
      const { id } = opt;
      const sourceTag = buildTableSource(type, sourceProps, id, genericType);
      onDrop(sourceTag, opt);
    },
    collect: (monitor) => {
      return {
        isOver: monitor.isOver(),
        isOverValidTarget: monitor.canDrop(),
      };
    },
  });
  const className = `target${isOver ? ' is-over' : ''}${
    isOverValidTarget ? ' can-drop' : ''
  }`;
  return (
    <div
      className={className}
      ref={drop}
      style={{ display: 'inline-flex', justifyContent: 'center' }}
    >
      {show(opt, 'sample', onDrop)}
    </div>
  );
};

GenericElTableDropTarget.propTypes = {
  opt: PropTypes.object.isRequired,
  onDrop: PropTypes.func,
};

GenericElTableDropTarget.defaultProps = { onDrop: () => {} };

export default GenericElTableDropTarget;
