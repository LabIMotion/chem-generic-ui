import React from 'react';
import ButtonTooltip from '@components/fields/ButtonTooltip';

const RepoRenderer = (params) => {
  const { data, fnApi, node } = params;

  const onCall = (e) => {
    node.setSelected(true, true);
    fnApi(e);
  };

  return (
    <span>
      <ButtonTooltip
        idf="tpl_fetch"
        fa="faArrowsRotate"
        element={data}
        fnClick={onCall}
      />
    </span>
  );
};

export default RepoRenderer;
