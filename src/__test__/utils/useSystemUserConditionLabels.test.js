import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import {
  S_USRS_SRC,
  useSystemUserConditionLabels,
  mergeUserOptionsIntoCache,
} from '@utils/userSelectUtils';
import Api from '@utils/apiManager';

vi.mock('@utils/apiManager', () => ({
  default: { getUser: vi.fn(), getUsers: vi.fn() },
}));

// Tiny harness: @testing-library/react v12 has no renderHook, so render a
// component that calls the hook and exposes the returned label map as JSON.
function Harness({ conditions, layers }) {
  const labels = useSystemUserConditionLabels(conditions, layers);
  return <div data-testid="out">{JSON.stringify(labels)}</div>;
}

const readLabels = () => JSON.parse(screen.getByTestId('out').textContent);

const layers = [
  {
    key: 'l1',
    fields: [
      { field: 'owner', type: 'select', option_layers: S_USRS_SRC },
      { field: 'color', type: 'select', option_layers: 'colors' },
    ],
  },
];

describe('useSystemUserConditionLabels', () => {
  beforeEach(() => vi.clearAllMocks());

  test('resolves system-user condition ids to user names via Api.getUser', async () => {
    Api.getUser.mockResolvedValue({
      mc: 'ss00',
      data: { id: 90501, first_name: 'Ada', last_name: 'Lovelace' },
    });

    const conditions = [
      { id: 'c1', layer: 'l1', field: 'owner', value: 90501 },
    ];
    render(<Harness conditions={conditions} layers={layers} />);

    await waitFor(() => expect(readLabels()['90501']).toBe('Ada Lovelace'));
    expect(Api.getUser).toHaveBeenCalledWith('90501');
  });

  test('ignores conditions whose field is not a system-user select', async () => {
    const conditions = [
      { id: 'c2', layer: 'l1', field: 'color', value: 90502 },
    ];
    render(<Harness conditions={conditions} layers={layers} />);

    // give any (incorrect) effect a chance to run
    await waitFor(() => expect(screen.getByTestId('out')).toBeInTheDocument());
    expect(Api.getUser).not.toHaveBeenCalled();
    expect(readLabels()).not.toHaveProperty('90502');
  });

  test('seeds from the shared cache without a redundant fetch', async () => {
    mergeUserOptionsIntoCache([{ value: 90503, label: 'Grace Hopper' }]);

    const conditions = [
      { id: 'c3', layer: 'l1', field: 'owner', value: 90503 },
    ];
    render(<Harness conditions={conditions} layers={layers} />);

    await waitFor(() => expect(readLabels()['90503']).toBe('Grace Hopper'));
    expect(Api.getUser).not.toHaveBeenCalled();
  });
});
