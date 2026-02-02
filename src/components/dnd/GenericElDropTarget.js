/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { useDrop } from 'react-dnd';
import { Tooltip, OverlayTrigger, Popover } from 'react-bootstrap';
import Constants from '@components/tools/Constants';
import { KlzIcon, searchTargets } from '@components/tools/utils';
import FIcons from '@components/icons/FIcons';
import buildSourceFromElement from '@components/tools/build-source-form';
import iconFinder from '@components/tools/icon-finder';

const show = (opt, iconClass, onNavi) => {
  if (opt.value?.el_id) {
    const elementLabel = opt.value?.el_label || opt.value?.el_name;
    let elSvg = opt.value.el_svg;
    if (opt.value.el_type === Constants.PERMIT_TARGET.SAMPLE) {
      if (elSvg && !elSvg.endsWith('.svg') && opt.value.el_decoupled) {
        elSvg = Constants.IMG_NOT_AVAILABLE_SVG;
      }
    }
    if (elSvg && !elSvg.endsWith('.svg'))
      elSvg = Constants.IMG_NOT_AVAILABLE_SVG;
    const tips = opt.value.el_tip && opt.value.el_tip.split(Constants.SEPARATOR_TAG);
    const tip1 = (tips && tips.length >= 1 && tips[0]) || '';
    const tip2 = (tips && tips.length >= 2 && tips[1]) || '';
    const tit = (
      <div>
        {tip1}
        <br />
        {tip2}
      </div>
    );
    const pop = (
      <Popover
        id="popover-svg"
        title={tit}
        style={{ maxWidth: 'none', maxHeight: 'none' }}
      >
        <img src={elSvg} style={{ height: '26vh', width: '26vh' }} alt="" />
      </Popover>
    );
    let label = elementLabel;
    const asShown = path =>
      path === Constants.IMG_NOT_AVAILABLE_SVG ? null : (
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
    const simg = (path, tip, txt) =>
      path && path !== '' ? (
        <div className="s-img">
          {asShown(path)}
          <span className="data">{txt}</span>
        </div>
      ) : (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={uuid()}>
              {tip1}
              <br />
              {tip2}
            </Tooltip>
          }
        >
          <div className="data">{txt}</div>
        </OverlayTrigger>
      );
    if (opt.value.el_type === Constants.PERMIT_TARGET.SAMPLE) {
      if (opt.value.is_new !== true) {
        label = (
          <a
            role="link"
            onClick={() => onNavi(opt.value.el_type, opt.value.el_id)}
            className="lu-link"
          >
            <span className="reaction-material-link">{elementLabel}</span>
          </a>
        );
      }
    }
    if (opt.value.el_type === Constants.PERMIT_TARGET.ELEMENT) {
      const iconName = iconFinder[opt.value.el_klass] || opt.value.icon_name;
      label = (
        <a
          role="link"
          onClick={() => onNavi(opt.value.el_klass, opt.value.el_id)}
          className="lu-link"
        >
          <i className={iconName} />{' '}
          <span className="reaction-material-link">{elementLabel}</span>
        </a>
      );
    }
    return simg(elSvg, opt.value.el_tip, label);
  }
  if (iconClass === Constants.PERMIT_TARGET.ELEMENT) {
    return <span className="indicator">{FIcons.faLink}</span>;
  }
  return KlzIcon(`icon-${iconClass} indicator`, { width: '4vw' });
};

const source = (type, props, id, classStr) => {
  return buildSourceFromElement(type, props, id, classStr);
};

const GenericElDropTarget = (props) => {
  const { opt, onDrop, readOnly } = props;
  const { onNavi } = opt;
  const [{ isOver, isOverValidTarget }, drop] = useDrop({
    // accept: opt.dndItems,
    accept: searchTargets(opt.dndItems),
    canDrop: (item) => {
      return !readOnly;
    },
    drop: item => {
      const sourceProps = item.element;
      const sourceTag = source(opt.type.split('_')[1], sourceProps, opt.id, opt.classStr); // opt.type: drag_sample, drag_molecule, drag_element
      onDrop(sourceTag);
    },
    collect: monitor => {
      return {
        isOver: monitor.isOver(),
        isOverValidTarget: monitor.canDrop(),
      };
    },
  });

  const iconClass =
    opt.dndItems && opt.dndItems[0] === Constants.PERMIT_TARGET.MOLECULE ? Constants.PERMIT_TARGET.SAMPLE : opt.dndItems[0];
  const className = `target${isOver ? ' is-over' : ''}${
    isOverValidTarget ? ' can-drop' : ''
  }`;

  return (
    <div ref={drop} className={className}>
      {show(opt, iconClass, onNavi)}
    </div>
  );
};

GenericElDropTarget.propTypes = {
  opt: PropTypes.object.isRequired,
  onDrop: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default GenericElDropTarget;
