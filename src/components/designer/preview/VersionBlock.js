/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonConfirm from '../../fields/ButtonConfirm';
import ButtonTooltip from '../../fields/ButtonTooltip';
import { buildString } from '../../tools/utils';

const VersionBlock = ({
  data,
  download,
  idxSelect,
  rev,
  src,
  fnDelete,
  fnRetrieve,
  fnView,
}) => {
  const {
    id,
    uuid,
    released_at: releasedAt,
    properties,
    properties_release: propertiesRelease,
  } = rev;
  const { canDL, fnDownload } = download;
  const [idx, compareUUID] = idxSelect.split(':');
  const s =
    buildString([uuid, id]) === compareUUID ? 'generic_block_select' : '';
  const ver = `Id: ${releasedAt ? uuid : ''}`;
  let at = releasedAt ? `Released at: ${releasedAt} (UTC)` : '(In Progress)';
  let version = src === 'properties' ? properties?.version : '';

  if (src === 'properties') {
    at = `saved at: ${releasedAt} (UTC)`;
  } else if (uuid === 'current') {
    version = '';
  } else {
    version = propertiesRelease?.version;
  }

  const del =
    releasedAt && idx > 1 ? (
      <ButtonConfirm
        msg="Delete this version permanently?"
        fnClick={fnDelete}
        fnParams={{ id, data, uuid }}
      />
    ) : null;
  const ret = releasedAt ? (
    <ButtonConfirm
      msg="Retrieve this version?"
      fnClick={fnRetrieve}
      fnParams={{ id }}
      fa="faReply"
    />
  ) : null;
  const dl = canDL ? (
    <ButtonTooltip
      idf="ver_download"
      fnClick={fnDownload}
      element={{ id }}
      fa="faDownload"
      place="top"
      bs="default"
    />
  ) : null;

  return (
    <div className={`generic_version_block ${s}`} key={uuid}>
      <div className="gap-1">
        <div className="w-100">{ver}</div>
        <div className="fw-bold text-primary">{version}</div>
        <div className="fs-6"> #{idx + 1}</div>
      </div>
      <div>
        <div className="w-100">{at}</div>
        <ButtonGroup size="sm" className="gap-1">
          {del}
          {dl}
          {ret}
          <ButtonTooltip
            idf="ver_view"
            fnClick={fnView}
            element={{ uuid, id }}
            fa="faEye"
            place="top"
          />
        </ButtonGroup>
      </div>
    </div>
  );
};

VersionBlock.propTypes = {
  data: PropTypes.object,
  download: PropTypes.shape({
    canDL: PropTypes.bool,
    fnDownload: PropTypes.func,
  }).isRequired,
  idxSelect: PropTypes.string.isRequired,
  rev: PropTypes.object.isRequired,
  src: PropTypes.oneOf(['properties_release', 'properties']),
  fnDelete: PropTypes.func,
  fnRetrieve: PropTypes.func,
  fnView: PropTypes.func.isRequired,
};

VersionBlock.defaultProps = {
  data: {},
  fnRetrieve: () => {},
  fnDelete: () => {},
  src: 'properties_release',
};
export default VersionBlock;
