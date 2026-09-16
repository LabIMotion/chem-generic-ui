import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LBadge from '@components/shared/LBadge';

describe('LBadge', () => {
  describe('rendering', () => {
    it('renders solid badge with text prop', () => {
      render(<LBadge variant="solid" color="primary" text="Active" />);
      const badge = screen.getByText('Active');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('ms-1');
    });

    it('renders outline badge with text prop', () => {
      render(<LBadge variant="outline" color="warning" text="workflow" />);
      const badge = screen.getByText('workflow');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('lbg-outline-warning');
    });

    it('renders children over text prop', () => {
      render(
        <LBadge variant="solid" color="dark" text="ignored">
          Child Content
        </LBadge>,
      );
      expect(screen.getByText('Child Content')).toBeInTheDocument();
      expect(screen.queryByText('ignored')).not.toBeInTheDocument();
    });

    it('renders numeric 0 content', () => {
      render(<LBadge variant="solid" color="dark" text={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('empty content', () => {
    it('returns null for empty string text', () => {
      const { container } = render(
        <LBadge variant="solid" color="dark" text="" />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('returns null for null children and no text', () => {
      const { container } = render(<LBadge variant="solid" color="dark" />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('margin behavior', () => {
    it('adds ms-1 class by default', () => {
      render(<LBadge variant="solid" color="primary" text="test" />);
      expect(screen.getByText('test')).toHaveClass('ms-1');
    });

    it('omits ms-1 class when noMargin is true', () => {
      render(<LBadge variant="solid" color="primary" text="test" noMargin />);
      expect(screen.getByText('test')).not.toHaveClass('ms-1');
    });
  });

  describe('className passthrough', () => {
    it('appends custom className', () => {
      render(
        <LBadge
          variant="solid"
          color="dark"
          text="test"
          className="custom-cls"
        />,
      );
      expect(screen.getByText('test')).toHaveClass('custom-cls');
    });
  });

  describe('variant rendering', () => {
    it('solid variant does not add outline class', () => {
      render(<LBadge variant="solid" color="primary" text="solid" />);
      expect(screen.getByText('solid')).not.toHaveClass('lbg-outline-primary');
    });

    it('outline variant adds outline class', () => {
      render(<LBadge variant="outline" color="default" text="outline" />);
      expect(screen.getByText('outline')).toHaveClass('lbg-outline-default');
    });

    it('defaults to solid variant', () => {
      render(<LBadge color="dark" text="default" />);
      expect(screen.getByText('default')).not.toHaveClass('lbg-outline-dark');
    });
  });
});
