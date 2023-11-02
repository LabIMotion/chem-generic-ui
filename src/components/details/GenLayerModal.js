import React, { Component } from 'react';
import LayerModal from '../layers/LayerModal';

const GenLayerModal = props => {
  const {
    generic, fnChange, extLayers, genId, isPreview, isActiveWF, isSearch
  } = props;

  const addLayerModal = (
    <LayerModal
      show={showViewLayer}
      layers={cloneDeep(segment.properties_release.layers) || {}}
      fnClose={this.setViewLayer}
      fnAdd={this.handleAddLayer}
    />
  );

  return (addLayerModal);
};

GenLayerModal.defaultProps = {
  // fnSubInput: () => {},
  // fnUnit: () => {},
  extLayers: [],
  genId: 0
};

export default GenLayerModal;
