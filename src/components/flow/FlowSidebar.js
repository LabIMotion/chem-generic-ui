/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import { Button } from 'react-bootstrap';

const FlowSidebar = props => {
  const { propertiesTemplate, fnAdd } = props;
  if (!propertiesTemplate) {
    return null;
  }
  const sortedLayers =
    propertiesTemplate?.layers &&
    sortBy(propertiesTemplate.layers, l => l.position);

  const addNode = node => {
    // console.log('addNode', node);
    fnAdd(node);
  };

  return (
    <aside>
      <div className="description">
        You can click on the nodes listed below to add it into the panel on the
        left to design your flow.
      </div>
      <div className="description">
        To remove the node from the flow, click on the node and press
        &apos;Del&apos; button.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(sortedLayers.filter(e => e.wf) || []).map(layer => (
          <>
            <Button key={layer.key} onClick={() => addNode(layer.key)}>
              <div className="gu_flow_dnd_sidebar">
                <b>{layer.label}</b>
              </div>
              <div>({layer.key})</div>
            </Button>
            &nbsp;
          </>
        ))}
      </div>
    </aside>
  );
};

FlowSidebar.propTypes = {
  fnAdd: PropTypes.func.isRequired,
  propertiesTemplate: PropTypes.object.isRequired,
};

export default FlowSidebar;
