import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Prop from '@components/designer/template/Prop';

const renderProp = (props = {}) =>
  render(
    <Prop layerKey="layer_a" propHeader={<span>Header</span>} {...props}>
      <input name="inner" />
    </Prop>,
  );

const inner = (container) => container.querySelector('input[name="inner"]');

describe('Prop accordion body', () => {
  it('keeps a collapsed body mounted by default', () => {
    const { container } = renderProp({ expandAll: false });
    expect(inner(container)).not.toBeNull();
  });

  it('keeps a collapsed body out of the DOM when asked to', () => {
    const { container } = renderProp({
      expandAll: false,
      unmountCollapsed: true,
    });
    expect(inner(container)).toBeNull();
  });

  it('renders an expanded body', () => {
    const { container } = renderProp({
      expandAll: true,
      unmountCollapsed: true,
    });
    expect(inner(container)).not.toBeNull();
  });

  it('mounts the body when the header is toggled open', () => {
    const { container } = renderProp({
      expandAll: false,
      unmountCollapsed: true,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Accordion' }));
    expect(inner(container)).not.toBeNull();
  });
});
