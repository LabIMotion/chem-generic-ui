import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TooltipButton from '@ui/common/TooltipButton';

describe('TooltipButton', () => {
  it('renders tooltip content when hovering disabled button wrapper', async () => {
    const user = userEvent.setup();

    render(
      <TooltipButton tooltip="Disabled tooltip" delay={0} disabled>
        Click me
      </TooltipButton>,
    );

    const wrapper = screen.getByText('Click me').parentElement;

    await act(async () => {
      await user.hover(wrapper);
    });

    expect(await screen.findByText('Disabled tooltip')).toBeInTheDocument();
  });

  it('invokes click handler when enabled', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <TooltipButton tooltip="Click" delay={0} onClick={handleClick}>
        Action
      </TooltipButton>,
    );

    const button = screen.getByRole('button', { name: 'Action' });

    await act(async () => {
      await user.click(button);
    });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
