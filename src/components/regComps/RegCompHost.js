import React from 'react';
import PropTypes from 'prop-types';
import FIcons from '@components/icons/FIcons';
import regCompStatus from '@components/regComps/regCompStatus';

function RegCompHost({ regComp, generic, fnChange, prepared }) {
  const status = prepared || regCompStatus(regComp, generic);
  if (!status.ok) return null;

  const { comp: RegComp, registryEntry, configEntry, data, encKey } = status;
  const cbFn =
    configEntry.mode === 'write'
      ? (updatedData) => {
          const result = registryEntry.merge(
            generic.properties,
            updatedData,
            generic.metadata,
            encKey,
          );
          const notify = result?.notify;
          if (notify?.isSuccess) {
            generic.properties = result.properties;
            if (result.metadata) generic.metadata = result.metadata;
            generic.changed = true;
            fnChange(generic);
          }
          return notify;
        }
      : undefined;

  return (
    <div
      className="p-3 border border-0 mb-4"
      style={{ position: 'relative', isolation: 'isolate' }}
    >
      <div
        className="d-flex align-items-center mb-3 bg-white"
        style={{ lineHeight: 1 }}
      >
        <span
          className="me-2 d-flex align-items-center"
          style={{ fontSize: '1.1rem', transform: 'translateY(-1px)' }}
        >
          {FIcons.faCubesStacked}
        </span>
        <div
          className="fw-bold uppercase tracking-wider"
          style={{ fontSize: '0.85rem', letterSpacing: '0.05rem' }}
        >
          LAYER STACK
        </div>
      </div>
      <RegComp data={data} cbFn={cbFn} />
    </div>
  );
}

RegCompHost.propTypes = {
  regComp: PropTypes.shape({
    comp: PropTypes.elementType,
  }),
  generic: PropTypes.object.isRequired,
  fnChange: PropTypes.func.isRequired,
  prepared: PropTypes.shape({
    ok: PropTypes.bool,
  }),
};

RegCompHost.defaultProps = {
  regComp: null,
  prepared: null,
};

export default RegCompHost;
