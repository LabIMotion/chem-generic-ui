import React, { useEffect, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import GenInterface from '@components/details/GenInterface';

const LayerGridView = ({ _layer }) => {
  const { generic, ext } = _layer;
  const { name, label, description } = ext;
  const [layer, setLayer] = useState(generic);

  useEffect(() => {
    setLayer(generic);
  }, [generic]);

  const handleChanged = (el) => {
    if (el.changed) {
      setLayer(cloneDeep(el));
    }
  };

  return (
    <div
      style={{
        height: '600px',
        width: '100%',
        overflow: 'auto',
        padding: '0px 20px',
        maxHeight: '600px',
      }}
    >
      <div className="gu-mb-2">
        <h4>
          <b>Standard Layer : </b> {name} {label && `(${label})`}
        </h4>
        <div style={{ display: 'flex', gap: '5px' }}>
          <div>
            <b>Description : </b>
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{description}</div>
        </div>
      </div>
      <GenInterface
        generic={layer || {}}
        fnChange={handleChanged}
        genId={0}
        isPreview
        isActiveWF={false}
      />
    </div>
  );
};

export default LayerGridView;
