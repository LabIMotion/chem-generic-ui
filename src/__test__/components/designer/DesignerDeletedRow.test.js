import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Designer from '@components/designer/Designer';
import Constants from '@components/tools/Constants';

// A grid reduced to the one seam this test drives: it shows what it was handed
// and can open a row, the way "Edit this template" does.
vi.mock('@components/details/GenGridEl', () => {
  function GridStub({ gridData, fnShowProp }) {
    return (
      <div>
        {gridData.map((row) => (
          <button key={row.id} type="button" onClick={() => fnShowProp(row)}>
            {`open ${row.id}`}
          </button>
        ))}
      </div>
    );
  }
  return { default: GridStub };
});

vi.mock('@components/designer/template/Template', () => {
  function TemplateStub({ data }) {
    return <div data-testid="work-area">{`showing ${data.id}`}</div>;
  }
  return { default: TemplateStub };
});

const row = (id) => ({ id, properties_template: { layers: {} } });

const designer = (gridData) => (
  <Designer
    genericType={Constants.GENERIC_TYPES.ELEMENT}
    gridData={gridData}
    klasses={[]}
    fnCopy={vi.fn()}
    fnCreate={vi.fn()}
    fnUpload={vi.fn()}
    fnDelete={vi.fn()}
    fnSubmit={vi.fn()}
    fnActive={vi.fn()}
    fnDownload={vi.fn()}
    fnUpdate={vi.fn()}
    fnRefresh={vi.fn()}
  />
);

const workArea = () => screen.queryByTestId('work-area');
const open = (id) => userEvent.click(screen.getByText(`open ${id}`));

describe('Designer work area after a klass deletion', () => {
  it('closes the work area when the open klass leaves the grid list', async () => {
    const { rerender } = render(designer([row(1), row(2)]));
    await open(1);
    expect(workArea()).toBeInTheDocument();

    rerender(designer([row(2)]));

    expect(workArea()).not.toBeInTheDocument();
  });

  it('closes the work area when the last klass is deleted', async () => {
    const { rerender } = render(designer([row(1)]));
    await open(1);

    rerender(designer([]));

    expect(workArea()).not.toBeInTheDocument();
  });

  it('keeps the work area open when some other klass is deleted', async () => {
    const { rerender } = render(designer([row(1), row(2)]));
    await open(1);

    rerender(designer([row(1)]));

    expect(workArea()).toHaveTextContent('showing 1');
  });

  it('stays closed when the deleted klass is later restored to the list', async () => {
    const { rerender } = render(designer([row(1)]));
    await open(1);

    rerender(designer([]));
    rerender(designer([row(1)]));

    expect(workArea()).not.toBeInTheDocument();
  });
});
