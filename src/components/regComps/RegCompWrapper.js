import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';
import { useGenUIContext } from '@components/details/GenUIContext';
import RegCompHost from '@components/regComps/RegCompHost';
import RegCompErrorBoundary from '@components/regComps/RegCompErrorBoundary';
import regCompStatus from '@components/regComps/regCompStatus';

const reasonMessage = (status) => {
  switch (status.reason) {
    case 'missing':
      return 'Component is not wired for this document.';
    case 'unauthorized':
      return `Registration key "${status.regKey}" is not authorized.`;
    case 'no-registry':
      return `No registered component named "${status.resolvedRegKey}".`;
    case 'disabled':
      return `This component "${status.resolvedRegKey}" is disabled.`;
    case 'not-renderable':
      return 'Current document state is not supported by this component.';
    default:
      return 'Component cannot be displayed.';
  }
};

// not-renderable is a normal, transient state (document not filled in yet).
// All other reasons are misconfiguration and deserve a warning.
const alertVariant = (status) =>
  status.reason === 'not-renderable' ? 'info' : 'warning';

function RegCompWrapper({ regComp, generic, fnChange }) {
  const { showConsumer, isProviderPresent } = useGenUIContext();
  if (isProviderPresent && !showConsumer) return null;

  const status = regCompStatus(regComp, generic);

  if (!status.ok) {
    // console.log('RegComp unavailable:', status);
    return null;
    // return (
    //   <Alert variant={alertVariant(status)} className="mb-4">
    //     <div>This function is unavailable.</div>
    //     <div className="text-muted small fst-italic">
    //       System message: {reasonMessage(status)}
    //     </div>
    //   </Alert>
    // );
  }

  return (
    <div>
      <RegCompErrorBoundary>
        <RegCompHost
          regComp={regComp}
          generic={generic}
          fnChange={fnChange}
          prepared={status}
        />
      </RegCompErrorBoundary>
    </div>
  );
}

RegCompWrapper.propTypes = {
  regComp: PropTypes.shape({
    comp: PropTypes.elementType,
  }),
  generic: PropTypes.object.isRequired,
  fnChange: PropTypes.func.isRequired,
};

RegCompWrapper.defaultProps = {
  regComp: null,
};

export default RegCompWrapper;
