import React from 'react';
import PropTypes from 'prop-types';
import Constants from '@components/tools/Constants';
import { LWf } from '@components/shared/LCom';
import fbc from '@components/tools/ui-styles';

// Shows repetition information for extended keys
export const extHeaderInfo = (splitKey) =>
  splitKey.length > 1 ? <span>{`Repetition ${splitKey[1]}`}</span> : null;

// Generates system header information for reaction fields
export const sysHeaderInfo = (fields) => {
  const preText = 'Reaction:';
  if (!fields || !fields.length) return preText;
  const { value = {} } = fields[0];
  return value.el_label ? `${preText} ${value.el_label}` : preText;
};

// Default content shown when no layers are available to arrange
export const defaultLayersContent = <h1>No layers to arrange</h1>;

// Default content shown when no fields are available to arrange
export const defaultFieldsContent = <h1>No fields to arrange</h1>;

// Creates a defined header for layer arrangement (legacy function)
export const definedLayerHeader = (
  className,
  label,
  key,
  fields,
  wf = null,
) => {
  const isSys = key.startsWith(Constants.SYS_REACTION);
  const content = isSys ? sysHeaderInfo(fields) : `${label}(${key})`;
  const splitKey = key.split('.');
  return (
    <span className={`${fbc} ${className}`}>
      {content}
      {extHeaderInfo(splitKey)}
      {wf && <LWf wf={wf} />}
    </span>
  );
};

// Component version of definedLayerHeader
export function DefinedLayerHeader({
  className,
  label,
  keyProp,
  fields,
  wf = null,
  children,
}) {
  const isSys = keyProp.startsWith(Constants.SYS_REACTION);
  const content = isSys ? sysHeaderInfo(fields) : `${label}(${keyProp})`;
  const splitKey = keyProp.split('.');

  return (
    <span className={`w-100 d-flex align-items-center ${className}`}>
      <span>
        {content}
        {extHeaderInfo(splitKey)}
        {wf && <LWf wf={wf} />}
      </span>
      {children}
    </span>
  );
}

DefinedLayerHeader.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  keyProp: PropTypes.string.isRequired,
  fields: PropTypes.array,
  wf: PropTypes.bool,
  children: PropTypes.node,
};

// Creates a defined header for field arrangement
export const definedFieldHeader = (label, field, type) => {
  const isDummy = type === 'dummy'; // Using string instead of FieldTypes.F_DUMMY to avoid import
  const content = isDummy ? '(dummy field)' : `${label}(${field})`;
  return <span className={`fw-bold ${fbc}`}>{content}</span>;
};
