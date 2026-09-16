import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import RestrictionFormCard from '@ui/groups/RestrictionFormCard';
import { DesignerProvider } from '@components/designer/DesignerContext';
import Api from '@utils/apiManager';
import { S_USRS_SRC, S_USRS_SEARCH_HINT } from '@utils/userSelectUtils';

vi.mock('@utils/apiManager', () => ({
  default: { getUser: vi.fn(), getUsers: vi.fn() },
}));

// GenPropertiesOlsSelect hits the ontology API on mount; stub it out so the
// ontology-select value input can render offline.
vi.mock('@utils/ontologyApi', () => ({
  parseOntologyTerm: vi.fn(() => ({ ontologyId: null, termIri: null })),
  loadOntologyTerm: vi.fn(),
  loadTermChildren: vi.fn(),
  loadAllChildren: vi.fn(),
  cacheOntologyTree: vi.fn(),
  clearOntologyCache: vi.fn(),
  isTreeComplete: vi.fn(() => false),
}));

const layers = [
  {
    key: 'l1',
    label: 'Layer 1',
    fields: [
      {
        field: 'owner',
        label: 'Owner',
        type: 'select',
        option_layers: S_USRS_SRC,
      },
    ],
  },
];

const baseProps = {
  selectedLayer: 'l1',
  selectedField: 'owner',
  fieldValue: '',
  availableFields: layers[0].fields,
  selectedOp: 1,
  availableLayers: layers,
  selectOptions: {},
  onClose: () => {},
  onLayerChange: () => {},
  onFieldChange: () => {},
  onValueChange: () => {},
  onAddCondition: () => {},
  onRemoveCondition: () => {},
  onOpChange: () => {},
};

const renderCard = (props) =>
  render(
    <DesignerProvider value={{ klasses: [], genericType: undefined }}>
      <RestrictionFormCard {...baseProps} {...props} />
    </DesignerProvider>,
  );

describe('RestrictionFormCard — system-user select', () => {
  beforeEach(() => vi.clearAllMocks());

  test('renders the async user picker for a system-user select field', () => {
    renderCard({ conditions: [] });
    // The SystemUserValueSelect renders its search hint (proof it replaced the
    // static dropdown). Bootstrap <select> elements also have combobox role, so
    // the hint is the unambiguous signal.
    expect(screen.getByText(S_USRS_SEARCH_HINT)).toBeInTheDocument();
  });

  test('ontology-select condition can be added with an empty value', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ontFields = [
      { field: 'ont', label: 'Ontology', type: 'ontology-select' },
    ];
    renderCard({
      conditions: [],
      availableLayers: [{ key: 'l2', label: 'Layer 2', fields: ontFields }],
      selectedLayer: 'l2',
      selectedField: 'ont',
      availableFields: ontFields,
      fieldValue: '',
    });

    expect(screen.getByTitle('Add condition')).toBeEnabled();
    console.warn.mockRestore();
  });

  test('existing system-user condition row displays the resolved user name', async () => {
    Api.getUser.mockResolvedValue({
      mc: 'ss00',
      data: { id: 70010, first_name: 'Grace', last_name: 'Hopper' },
    });

    renderCard({
      conditions: [{ id: 'c1', layer: 'l1', field: 'owner', value: '70010' }],
    });

    expect(await screen.findByText(/Grace Hopper/)).toBeInTheDocument();
    expect(Api.getUser).toHaveBeenCalledWith('70010');
  });
});
