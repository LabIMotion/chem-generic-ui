/* eslint-disable react/prop-types */
import React from 'react';
import { sortBy } from 'lodash';
import DraggableNodes from './DraggableNodes';

const DraggableSideBar = props => {
  const { element } = props;

  const sortedLayers =
    element.properties_template &&
    element.properties_template.layers &&
    sortBy(element.properties_template.layers, l => l.position);
  if (element.properties_template == null) {
    return null;
  }

  return (
    <aside>
      <div className="description">
        You can drag the nodes listed below to the pane on the left to design
        your flow.
      </div>
      <div className="description">
        To remove the node from the pane, click on the node and press
        &apos;Del&apos; button.
      </div>
      <DraggableNodes nodes={sortedLayers} />
    </aside>
  );
};

export default DraggableSideBar;
