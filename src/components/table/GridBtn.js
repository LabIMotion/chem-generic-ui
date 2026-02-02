/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import GridDnD from '@components/dnd/GridDnD';
import FIcons from '@components/icons/FIcons';
import Constants from '@components/tools/Constants';
import LTooltip from '@components/shared/LTooltip';
import { fnToggle } from '@ui/common/fnToggle';
import { FN_ID } from '@ui/common/fnConstants';

const AddRowBtn = ({ addRow, isEditable = true }) => (
  <LTooltip idf="add_entry">
    <Button
      onClick={() => addRow()}
      size="xsm"
      variant="primary"
      disabled={!isEditable}
    >
      {FIcons.faPlus}
    </Button>
  </LTooltip>
);

AddRowBtn.propTypes = { addRow: PropTypes.func.isRequired };

const DelRowBtn = ({ delRow, node, isEditable = true }) => {
  const { data } = node;
  return (
    <LTooltip idf="remove">
      <Button
        variant="light"
        onClick={() => delRow(data)}
        size="xsm"
        disabled={!isEditable}
      >
        {FIcons.faMinus}
      </Button>
    </LTooltip>
  );
};

DelRowBtn.propTypes = {
  delRow: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
};

const NullRowBtn = () => (
  <div className="grid-btn-none">{FIcons.faArrowsUpDownLeftRight}</div>
);

const DnDRowBtn = ({ moveRow, field, type, isEditable, node }) => (
  <GridDnD
    field={field}
    type={type}
    rowValue={node.data}
    handleMove={moveRow}
    isEditable={isEditable}
  />
);

DnDRowBtn.propTypes = {
  moveRow: PropTypes.func.isRequired,
  field: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  node: PropTypes.object.isRequired,
};

const DownloadGridBtn = ({ download, opt, loading = false }) => {
  const { isEditable } = opt;

  return (
    <LTooltip idf="export_tbl_xlsx">
      <Button
        variant="success"
        onClick={download}
        size="xsm"
        disabled={!isEditable || loading}
      >
        {loading ? FIcons.faSpinner : FIcons.faDownload}
      </Button>
    </LTooltip>
  );
};

DownloadGridBtn.fnId = FN_ID.FN_TABLE_EXPORT;

DownloadGridBtn.propTypes = {
  download: PropTypes.func.isRequired,
  opt: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

const DownloadGridBtnToggled = fnToggle(DownloadGridBtn);

const DLGridBtn = (props) => {
  const { opt } = props;
  const { id, genericType } = opt || {};

  // Show NullRowBtn if id is not a number (unsaved item) or feature is disabled
  // or it is not Element or Segment
  if (
    typeof id !== 'number' ||
    ![
      Constants.GENERIC_TYPES.ELEMENT,
      Constants.GENERIC_TYPES.SEGMENT,
    ].includes(genericType)
  ) {
    return <NullRowBtn />;
  }

  // fnToggle returns null when feature is disabled, fallback to NullRowBtn
  return <DownloadGridBtnToggled {...props} /> || <NullRowBtn />;
};

DLGridBtn.propTypes = {
  download: PropTypes.func,
  opt: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export { AddRowBtn, DelRowBtn, DnDRowBtn, NullRowBtn, DLGridBtn };
