import React from 'react';
import ButtonTooltip from '@components/fields/ButtonTooltip';

const VocabularyRenderer = (params) => {
  const { data, fnApi, node } = params;
  const fa = ['fa fa-laptop'];

  const onCall = (e) => {
    node.setSelected(true, true);
    fnApi(e);
  };

  return (
    <span>
      <ButtonTooltip
        tip="add vocabulary to the template"
        fa="faPlus"
        element={data}
        fnClick={onCall}
      />
    </span>
  );
};

export default VocabularyRenderer;
