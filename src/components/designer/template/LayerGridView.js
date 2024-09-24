import React, { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import GenInterface from '../../details/GenInterface';

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
        <h3>
          Standard Layer : {name} {label && `(${label})`}
        </h3>
        <div style={{ whiteSpace: 'pre-wrap' }}>{description}</div>
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
