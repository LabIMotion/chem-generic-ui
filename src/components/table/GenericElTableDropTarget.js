/* eslint-disable no-unused-vars */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { useDrop } from 'react-dnd';
import { Tooltip, OverlayTrigger, Popover, Button } from 'react-bootstrap';
import Constants from '../tools/Constants';
import { KlzIcon } from '../tools/utils';
import buildTableSource from '../../utils/table/build-table-source';
import FIcons from '../icons/FIcons';

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
    const asShown = path =>
      path === Constants.IMG_NOT_AVAILABLE_SVG ? (
        KlzIcon(`icon-${iconClass}`, { width: '4vw', fontSize: 'x-large' })
      ) : (
        <OverlayTrigger
          delayShow={1000}
          trigger={['hover']}
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
            <OverlayTrigger
              delayShow={1000}
              placement="top"
              overlay={<Tooltip id={uuid()}>remove this molecule</Tooltip>}
            >
              <Button
                className="btn_del btn-gxs"
                onClick={() => onDrop({}, params)}
              >
                {FIcons.faTrashCan}
              </Button>
            </OverlayTrigger>
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
  if (opt.type === 'table') {
    const sField = opt.sField || {};
    const subVal = opt.data[sField.id];
    const { data } = opt;
    return base(subVal, iconClass, onDrop, { sField, data });
  }
  return base(opt, iconClass);
};

const GenericElTableDropTarget = props => {
  const { opt, onDrop } = props;
  const [{ isOver, isOverValidTarget }, drop] = useDrop({
    accept: opt.dndItems,
    drop: (targetProps, monitor) => {
      const sourceProps = monitor.getItem().element;
      const type = opt.sField.type.split('_')[1];
      const { id } = opt;
      const sourceTag = buildTableSource(type, sourceProps, id);
      onDrop(sourceTag, opt);
    },
    collect: monitor => {
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
