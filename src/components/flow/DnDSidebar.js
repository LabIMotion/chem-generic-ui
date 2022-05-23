/* eslint-disable no-param-reassign */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';

const onDragStart = (ev, node) => {
  ev.dataTransfer.setData('application/generic', node);
  ev.dataTransfer.effectAllowed = 'move';
};

const DnDSidebar = (props) => {
  const { element } = props;
  const sortedLayers = element.properties_template && element.properties_template.layers
    && sortBy(element.properties_template.layers, l => l.position);
  if (element.properties_template == null) {
    return null;
  }
  return (
    <aside>
      <div className="description">
        You can drag the nodes listed below to the pane on the left to design your flow.
      </div>
      <div className="description">
        To remove the node from the pane, click on the node and press &apos;Del&apos; button.
      </div>
      {
        (sortedLayers.filter(e => e.wf) || []).map(l => (
          <div
            key={l.key}
            className="react-flow__node-default"
            onDragStart={event => onDragStart(event, l.key)}
            draggable="true"
          >
            <div className="gu_flow_dnd_sidebar">
              <b>{l.label}</b>
            </div>
            <div>
              (
              {l.key}
              )
            </div>
          </div>
        ))
      }
    </aside>
  );
};

DnDSidebar.propTypes = { element: PropTypes.object.isRequired };

export default DnDSidebar;
