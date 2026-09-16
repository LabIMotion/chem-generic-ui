import React from 'react';
import RegCompErrorBoundary from '@components/regComps/RegCompErrorBoundary';
import regCompStatusPackage from '@components/regComps/regCompStatusPackage';
import { useDesignerContext } from '@components/designer/DesignerContext';

// Thin AG Grid cell renderer for a package-registered host component. Holds no
// business logic: `params.regCompName` (from the column's cellRendererParams)
// says which registered comp this column renders; it resolves that name against
// the host's regComp map + reg.json/regComps.json, then renders the host comp
// per row with the raw klass row + genericType. The host comp decides what to
// show per row (and returns null when it does not apply). `regComp` + `fnSave` +
// `genericType` come from DesignerContext; `row` is the klass from AG Grid params.
function RegCellRenderer(params) {
  const { data: row, regCompName } = params;
  const {
    regComp,
    fnSave = () => {},
    genericType,
    refSource,
  } = useDesignerContext();

  const status = regCompStatusPackage(regComp, regCompName);
  if (!status.ok) return null;

  const { comp: RegComp, configEntry } = status;
  // Optional write-back seam: only hand the host comp a callback when the
  // registry entry is in 'write' mode; otherwise leave it undefined.
  const cbFn =
    configEntry.mode === 'write'
      ? (updated) => fnSave(row, updated)
      : undefined;

  return (
    <RegCompErrorBoundary>
      <RegComp
        row={row}
        genericType={genericType}
        currentUser={refSource?.currentUser}
        cbFn={cbFn}
      />
    </RegCompErrorBoundary>
  );
}

export default RegCellRenderer;
