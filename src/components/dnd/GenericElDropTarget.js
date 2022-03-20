/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable react/prop-types */
/* eslint-disable no-restricted-globals */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { DropTarget } from 'react-dnd';
// import Aviator from 'aviator';
import { Tooltip, OverlayTrigger, Popover } from 'react-bootstrap';
// import UIStore from '../stores/UIStore';

// const handleSampleClick = (type, id) => {
//   const { currentCollection, isSync } = UIStore.getState();
//   if (!isNaN(id)) type += `/${id}`;
//   const collectionUrl = `${currentCollection.id}/${type}`;
//   Aviator.navigate(isSync ? `/scollection/${collectionUrl}` : `/collection/${collectionUrl}`);
// };

// const handleElementClick = (type, id) => {
//   const { currentCollection, isSync } = UIStore.getState();
//   if (!isNaN(id)) type += `/${id}`;
//   const collectionUrl = `${currentCollection.id}/${type}`;
//   Aviator.navigate(isSync ? `/scollection/${collectionUrl}` : `/collection/${collectionUrl}`);
// };

const show = (opt, iconClass, onLink) => {
  if (opt.value && opt.value.el_id) {
    const tips = opt.value.el_tip && opt.value.el_tip.split('@@');
    const tip1 = (tips && tips.length >= 1 && tips[0]) || '';
    const tip2 = (tips && tips.length >= 2 && tips[1]) || '';
    const tit = (<div>{tip1}<br />{tip2}</div>);
    const pop = (
      <Popover id="popover-svg" title={tit} style={{ maxWidth: 'none', maxHeight: 'none' }}>
        <img src={opt.value.el_svg} style={{ height: '26vh', width: '26vh' }} alt="" />
      </Popover>
    );
    let label = opt.value.el_label;
    const simg = (path, tip, txt) => ((path && path !== '') ? (
      <div className="s-img">
        <OverlayTrigger trigger={['hover']} placement="left" rootClose onHide={null} overlay={pop}>
          <img src={path} alt="" />
        </OverlayTrigger>&nbsp;<span className="data">{txt}</span>
      </div>
    ) : (<OverlayTrigger placement="top" overlay={<Tooltip id={uuid()}>{tip1}<br />{tip2}</Tooltip>}><div className="data">{txt}</div></OverlayTrigger>));
    if (opt.value.el_type === 'sample') {
      if (opt.value.is_new !== true) {
        label = (
          // <a role="link"
          // onClick={() => handleSampleClick(opt.value.el_type, opt.value.el_id)}
          // style={{ cursor: 'pointer' }}>
          <a role="link" onClick={() => onLink(opt.value.el_type, opt.value.el_id)} style={{ cursor: 'pointer' }}>
            <span className="reaction-material-link">{label}</span>
          </a>
        );
      }
    }
    if (opt.value.el_type === 'element') {
      label = (
        // <a role="link"
        // onClick={() => handleElementClick(opt.value.el_klass, opt.value.el_id)}
        // style={{ cursor: 'pointer' }}>
        <a role="link" onClick={() => onLink(opt.value.el_klass, opt.value.el_id)} style={{ cursor: 'pointer' }}>
          <i className={opt.value.icon_name} />&nbsp;
          <span className="reaction-material-link">{label}</span>
        </a>
      );
    }
    return simg(opt.value.el_svg, opt.value.el_tip, label);
  }
  if (iconClass === 'element') {
    return (<span className="fa fa-link icon_generic_nav indicator" />);
  }
  return (<span className={`icon-${iconClass} indicator`} />);
};

const source = (type, props, id) => {
  let isAssoc = false;
  const taggable = (props && props.tag && props.tag.taggable_data) || {};
  if (taggable.element && taggable.element.id === id) {
    isAssoc = false;
  } else {
    isAssoc = !!(taggable.reaction_id || taggable.wellplate_id || taggable.element);
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
        cr_opt: isAssoc === true ? 1 : 0,
        isAssoc,
        el_type: 'sample',
        el_label: props.short_label,
        el_tip: props.short_label
      };
    case 'element':
      return {
        el_id: props.id,
        el_type: 'element',
        icon_name: (props.element_klass && props.element_klass.icon_name) || '',
        el_klass: props.type,
        el_label: props.short_label,
        el_tip: `${props.label}@@${props.name}`
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

const dropTarget = {
  drop(targetProps, monitor) {
    const sourceProps = monitor.getItem().element;
    const sourceTag = source(targetProps.opt.type.split('_')[1], sourceProps, targetProps.opt.id);
    targetProps.onDrop(sourceTag);
  },
  canDrop(_targetProps, _monitor) {
    return true;
  },
};

const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
});

class GenericElDropTarget extends Component {
  render() {
    const {
      connectDropTarget, isOver, canDrop, opt, onLink
    } = this.props;
    const iconClass = (opt.dndItems && opt.dndItems[0] === 'molecule' ? 'sample' : opt.dndItems[0]);
    const className = `target${isOver ? ' is-over' : ''}${canDrop ? ' can-drop' : ''}`;
    return connectDropTarget(<div className={className}>{show(opt, iconClass, onLink)}</div>);
  }
}

export default
DropTarget(props => props.opt.dndItems, dropTarget, dropCollect)(GenericElDropTarget);

GenericElDropTarget.propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
};
