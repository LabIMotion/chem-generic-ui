/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Constants from '@components/tools/Constants';
import FIcons from '@components/icons/FIcons';
import TooltipButton from '@ui/common/TooltipButton';
import ExternalManager from '@utils/extMgr';
import { downloadResponseAsFile } from '@utils/fileUtils';

/**
 * FileExportButton - A button component that exports a generic object as a file
 */
const FileExportButton = ({ generic, variant, size }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (generic?.is_new) return null;
  if (
    ![
      Constants.GENERIC_TYPES.ELEMENT,
      Constants.GENERIC_TYPES.SEGMENT,
      Constants.GENERIC_TYPES.DATASET,
    ].includes(generic.properties?.klass)
  )
    return null;

  const handleExport = async () => {
    try {
      setIsLoading(true);

      const response = await ExternalManager.exportAsFile({
        id: generic.id,
        klass: generic.properties?.klass,
        export_format: 'docx',
      });

      await downloadResponseAsFile(response);
    } catch (error) {
      console.error('Error exporting file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipButton
      tooltipId="export_docx"
      size={size}
      variant={variant}
      onClick={handleExport}
      disabled={isLoading}
    >
      {isLoading ? FIcons.faSpinner : FIcons.faFileWord} Export
    </TooltipButton>
  );
};

FileExportButton.propTypes = {
  generic: PropTypes.object,
  variant: PropTypes.string,
  size: PropTypes.string,
};

FileExportButton.defaultProps = {
  generic: {},
  variant: 'primary',
  size: 'sm',
};

export default FileExportButton;
