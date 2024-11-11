/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { useDrop } from 'react-dnd';
import { Tooltip, OverlayTrigger, Popover } from 'react-bootstrap';
import Constants from '../tools/Constants';
import { KlzIcon } from '../tools/utils';
import FIcons from '../icons/FIcons';

const show = (opt, iconClass, onNavi) => {
  if (opt.value?.el_id) {
    let elSvg = opt.value.el_svg;
    if (opt.value.el_type === 'sample') {
      if (elSvg && !elSvg.endsWith('.svg') && opt.value.el_decoupled) {
        elSvg = Constants.IMG_NOT_AVAILABLE_SVG;
      }
    }
    if (elSvg && !elSvg.endsWith('.svg'))
      elSvg = Constants.IMG_NOT_AVAILABLE_SVG;
    const tips = opt.value.el_tip && opt.value.el_tip.split('@@');
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
    let label = opt.value.el_label;
    const asShown = path =>
      path === Constants.IMG_NOT_AVAILABLE_SVG ? null : (
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
    if (opt.value.el_type === 'sample') {
      if (opt.value.is_new !== true) {
        label = (
          <a
            role="link"
            onClick={() => onNavi(opt.value.el_type, opt.value.el_id)}
            className="gu-link"
          >
            <span className="reaction-material-link">{label}</span>
          </a>
        );
      }
    }
    if (opt.value.el_type === 'element') {
      label = (
        <a
          role="link"
          onClick={() => onNavi(opt.value.el_klass, opt.value.el_id)}
          className="gu-link"
        >
          <i className={opt.value.icon_name} />{' '}
          <span className="reaction-material-link">{label}</span>
        </a>
      );
    }
    return simg(elSvg, opt.value.el_tip, label);
  }
  if (iconClass === 'element') {
    return <span className="indicator">{FIcons.faLink}</span>;
  }
  return KlzIcon(`icon-${iconClass} indicator`, { width: '4vw' });
};

const source = (type, props, id, classStr) => {
  let isAssoc = false;
  const taggable = (props && props.tag && props.tag.taggable_data) || {};
  if (taggable.element && taggable.element.id === id) {
    isAssoc = false;
  } else {
    isAssoc = !!(
      taggable.reaction_id ||
      taggable.wellplate_id ||
      taggable.element
    );
  }
  switch (type) {
    case 'molecule':
      return {
        el_id: props.molecule.id,
        el_type: 'molecule',
        el_label: props.molecule_name_label,
        el_tip: `${props.molecule.inchikey}@@${props.molecule.cano_smiles}`,
      };
    case 'sample':
      return {
        el_id: props.id,
        is_new: true,
        cr_opt: classStr && isAssoc === true ? 1 : 0,
        isAssoc,
        el_type: 'sample',
        el_label: props.short_label,
        el_tip: props.short_label,
        el_decoupled: props.decoupled || false,
      };
    case 'element':
      return {
        el_id: props.id,
        el_type: 'element',
        icon_name: (props.element_klass && props.element_klass.icon_name) || '',
        el_klass: props.type,
        el_label: props.short_label,
        el_tip: `${props.label}@@${props.name}`,
      };
    default:
      return {
        el_id: props.id,
        el_type: props.type,
        el_label: props.short_label,
        el_tip: props.short_label,
      };
  }
};

const GenericElDropTarget = (props) => {
  const { opt, onDrop } = props;
  const { onNavi } = opt;
  const [{ isOver, isOverValidTarget }, drop] = useDrop({
    accept: opt.dndItems,
    drop: item => {
      const sourceProps = item.element;
      const sourceTag = source(opt.type.split('_')[1], sourceProps, opt.id, opt.classStr);
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
    opt.dndItems && opt.dndItems[0] === 'molecule' ? 'sample' : opt.dndItems[0];
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
};

export default GenericElDropTarget;
