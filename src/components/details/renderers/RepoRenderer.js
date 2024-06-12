import React from 'react';
import ButtonTooltip from '../../fields/ButtonTooltip';

const RepoRenderer = params => {
  const { data, fnApi, node } = params;
  const fa = ['faArrowsRotate'];

  const onCall = e => {
    node.setSelected(true, true);
    fnApi(e);
  };

  return (
    <span>
      <ButtonTooltip
        tip="create a new node from Chemotion Repository"
        fa={fa[0]}
        element={data}
        fnClick={onCall}
        size="sm"
      />
    </span>
  );
};

export default RepoRenderer;
