import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SystemUserValueSelect from '@components/fields/SystemUserValueSelect';
import Api from '@utils/apiManager';
import { S_USRS_SEARCH_HINT } from '@utils/userSelectUtils';

vi.mock('@utils/apiManager', () => ({
  default: {
    getUser: vi.fn(),
    getUsers: vi.fn(),
  },
}));

const userResult = (user) => ({ mc: 'ss00', data: user });
const usersResult = (users) => ({ mc: 'ss00', data: users });

describe('SystemUserValueSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the search hint', () => {
    render(<SystemUserValueSelect value="" onChange={() => {}} />);
    expect(screen.getByText(S_USRS_SEARCH_HINT)).toBeInTheDocument();
  });

  test('backfills a stored id to the user name (not "(depr.)")', async () => {
    // Unique id avoids module-cache bleed from other tests.
    Api.getUser.mockResolvedValue(
      userResult({ id: 70001, first_name: 'Grace', last_name: 'Hopper' }),
    );

    render(<SystemUserValueSelect value="70001" onChange={() => {}} />);

    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(Api.getUser).toHaveBeenCalledWith('70001');
    expect(screen.queryByText(/\(depr\.\)/)).not.toBeInTheDocument();
  });

  test('typing 3+ chars loads users and selecting calls onChange with the id', async () => {
    const onChange = vi.fn();
    Api.getUsers.mockResolvedValue(
      usersResult([{ id: 70002, first_name: 'Ada', last_name: 'Lovelace' }]),
    );

    render(<SystemUserValueSelect value="" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'ada');

    const option = await screen.findByText('Ada Lovelace');
    await userEvent.click(option);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('70002'));
    expect(Api.getUsers).toHaveBeenCalledWith({ name: 'ada' });
  });

  test('does not query users below the min search length', async () => {
    const onChange = vi.fn();
    render(<SystemUserValueSelect value="" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'ad');

    expect(Api.getUsers).not.toHaveBeenCalled();
  });
});
