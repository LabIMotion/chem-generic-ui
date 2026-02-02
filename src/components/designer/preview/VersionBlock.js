/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonConfirm from '@components/fields/ButtonConfirm';
import ButtonTooltip from '@components/fields/ButtonTooltip';
import RevisionSelector from '@components/designer/preview/RevisionSelector';
import { buildString } from '@utils/pureUtils';

const formatDate = (date) => {
  return moment(date, 'DD.MM.YYYY, HH:mm').format('YYYY-MM-DD HH:mm');
};

const VersionBlock = ({
  download,
  idxSelect,
  rev,
  src,
  fnDelete,
  fnRetrieve,
  fnView,
  isSelected,
  onSelectionChange,
}) => {
  const {
    id,
    uuid,
    released_at: releasedAt,
    created_at: createdAt,
    properties,
    properties_release: propertiesRelease,
    version,
  } = rev;

  const { canDL, fnDownload } = download;
  const [idxStr, compareUUID] = idxSelect.split(':');
  const parsedIdx = parseInt(idxStr, 10);
  const idx = !isNaN(parsedIdx) ? parsedIdx : 0;
  const selectedClass =
    buildString([uuid, id]) === compareUUID
      ? 'border-info border-3'
      : 'border-1';

  let at = '';
  let verBase = '';
  let verID = '';
  if (src === 'properties_release') {
    at = releasedAt ? `Released at: ${formatDate(releasedAt)} (UTC)` : '(In Progress)';
    verBase = version && (releasedAt ? `v${version}` : '');
    verID = `ID: ${uuid || ''}`;
  }
  if (src === 'properties') {
    at = `Saved at: ${formatDate(createdAt)} (UTC)`;
    verBase = `v${properties.version}`;
    verID = `Template ID: ${properties.klass_uuid || ''}`;
  }

  const del =
    releasedAt && idx > 1 ? (
      <ButtonConfirm
        msg="Delete this version permanently?"
        fnClick={fnDelete}
        fnParams={{ id }}
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
    />
  ) : null;

  const handleSelectionChange = (e) => {
    if (onSelectionChange) {
      onSelectionChange(rev, e.target.checked, { verID, verBase });
    }
  };

  return (
    <div className={`d-block p-2 m-1 fs-5 border ${selectedClass}`} key={uuid}>
      <div className="d-flex flex-nowrap gap-2 align-items-center">
        <RevisionSelector
          isSelected={isSelected}
          onChange={handleSelectionChange}
        />
        <div className="flex-grow-1">{verID}</div>
        <div className="fs-6 fw-bold text-primary">
          {verBase}
        </div>
        <div className="fs-6"> #{idx + 1}</div>
      </div>
      <div className="d-flex flex-nowrap gap-2">
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
  isSelected: PropTypes.bool,
  onSelectionChange: PropTypes.func,
};

VersionBlock.defaultProps = {
  fnRetrieve: () => {},
  fnDelete: () => {},
  src: 'properties_release',
  isSelected: false,
  onSelectionChange: null,
};
export default VersionBlock;
