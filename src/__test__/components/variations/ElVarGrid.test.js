import React from 'react';
import { render, screen } from '@testing-library/react';
import GenericElementVariations from '@components/variations/ElVar';

// Expose the props the real grid would receive so we can assert the theme
// contract without booting ag-grid itself.
vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ theme }) => (
    <div data-testid="ag-grid" data-theme={String(theme)} />
  ),
}));

const fetcher = {
  fetchByElementId: () => Promise.resolve({}),
  update: () => Promise.resolve({}),
  exportXlsx: () => Promise.resolve({}),
  importXlsx: () => Promise.resolve({}),
};

const genericEl = {
  id: 1,
  isNew: false,
  type: 'animal_test',
  short_label: 'AT-1',
  element_klass: { label: 'Animal Test', properties_release: { layers: {} } },
  properties: { layers: {} },
};

describe('GenericElementVariations grid theming', () => {
  // The repo runs THEME_MODE = 'legacy' and imports CSS file themes in
  // entry.js. Leaving ag-grid v33 on its Theming API default while a CSS theme
  // is loaded raises ag-grid error #239 and the grid renders unstyled, so every
  // grid must go through resolveGridTheme rather than hard-coding the class.
  it('passes the resolved theme through to AgGridReact', async () => {
    render(
      <GenericElementVariations
        genericEl={genericEl}
        fetcher={fetcher}
        segmentKlasses={[]}
        userId="1"
      />,
    );

    expect(await screen.findByTestId('ag-grid')).toHaveAttribute(
      'data-theme',
      'legacy',
    );
  });

  // Quartz is the repo default and the only theme entry.js imports the CSS for.
  it('wraps the grid in the repo default theme class', async () => {
    const { container } = render(
      <GenericElementVariations
        genericEl={genericEl}
        fetcher={fetcher}
        segmentKlasses={[]}
        userId="1"
      />,
    );

    await screen.findByTestId('ag-grid');
    const wrapper = container.querySelector('.generic-element-variations-grid');
    expect(wrapper).toHaveClass('ag-theme-quartz');
  });
});
