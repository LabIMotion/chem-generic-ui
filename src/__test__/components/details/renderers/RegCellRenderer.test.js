import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RegCellRenderer from '@components/details/renderers/RegCellRenderer';
import { DesignerProvider } from '@components/designer/DesignerContext';
import regCompStatusPackage from '@components/regComps/regCompStatusPackage';

// Unit-scope the renderer: stub the package resolver so we can drive each branch
// directly without pulling its config deps.
vi.mock('@components/regComps/regCompStatusPackage', () => ({
  default: vi.fn(),
  listRegComps: vi.fn(),
}));

// The host comp receives the raw row + genericType (not extracted data) and an
// optional write-back cbFn.
function HostComp({ row, genericType, currentUser, cbFn }) {
  return (
    <button
      type="button"
      disabled={!cbFn}
      onClick={() => cbFn && cbFn({ saved: true })}
    >
      {`host:${genericType}:${row?.id ?? '-'}:${currentUser?.id ?? '-'}`}
    </button>
  );
}

// regComp (a name->comp map) + fnSave + genericType + refSource reach
// RegCellRenderer through DesignerContext; `data` (the row) and `regCompName`
// are AG Grid cell params.
const renderCell = ({
  data = {},
  regComp = { doi: HostComp },
  fnSave = () => {},
  genericType = 'Element',
  refSource = { currentUser: { id: 99 } },
  regCompName = 'doi',
} = {}) =>
  render(
    <DesignerProvider value={{ regComp, fnSave, genericType, refSource }}>
      <RegCellRenderer data={data} regCompName={regCompName} />
    </DesignerProvider>,
  );

describe('RegCellRenderer', () => {
  beforeEach(() => {
    regCompStatusPackage.mockReset();
  });

  it('renders nothing when the named comp does not resolve', () => {
    regCompStatusPackage.mockReturnValue({ ok: false, reason: 'missing' });
    const { container } = renderCell();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the host comp with row + genericType and wires cbFn -> fnSave(row, updated) in write mode', () => {
    const row = { id: 7 };
    const fnSave = jest.fn();
    regCompStatusPackage.mockReturnValue({
      ok: true,
      comp: HostComp,
      configEntry: { mode: 'write' },
      name: 'layerStack',
    });
    renderCell({
      data: row,
      fnSave,
      genericType: 'Segment',
      refSource: { currentUser: { id: 42 } },
    });
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('host:Segment:7:42');
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(fnSave).toHaveBeenCalledWith(row, { saved: true });
  });

  it('passes cbFn=undefined (read-only) when mode is not write', () => {
    const fnSave = jest.fn();
    regCompStatusPackage.mockReturnValue({
      ok: true,
      comp: HostComp,
      configEntry: { mode: 'read' },
      name: 'doi',
    });
    renderCell({ data: { id: 3 }, fnSave });
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(fnSave).not.toHaveBeenCalled();
  });
});
