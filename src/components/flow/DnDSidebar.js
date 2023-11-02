/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import DnDNodes from './DnDNodes';

const DnDSidebar = props => {
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
        You can drag the nodes listed below to the left pane to design your
        flow.
      </div>
      <div className="description">
        To remove the node from the pane, click on the node and press
        &apos;Del&apos; button.
      </div>
      <DnDNodes nodes={sortedLayers} />
    </aside>
  );
};

DnDSidebar.propTypes = { element: PropTypes.object.isRequired };

export default DnDSidebar;
