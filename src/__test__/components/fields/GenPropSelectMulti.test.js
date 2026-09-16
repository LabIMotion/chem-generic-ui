import React from 'react';
import { render, screen, act, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import GenPropSelectMulti from '@components/fields/GenPropSelectMulti';

vi.mock('@utils/apiManager', () => ({
  default: { getUser: vi.fn(), getUsers: vi.fn() },
}));

// jsdom has no layout engine, so chip widths are synthesised from the label
// text: width = len * CHAR_W + CHIP_PAD. The component adds CHIP_MARGIN (4).
const CHAR_W = 8;
const CHIP_PAD = 24;
const chipWidth = (label) => label.length * CHAR_W + CHIP_PAD + 4;

const OPTIONS = [
  { key: 'bf', label: 'Bright-field' }, // 124
  { key: 'hrtem', label: 'HRTEM' }, //      68
  { key: 'saed', label: 'SAED' }, //        60
  { key: 'cbed', label: 'CBED' }, //        60
  { key: 'edx', label: 'EDX' }, //          52
];
const ALL_CHIPS_WIDTH = OPTIONS.reduce((s, o) => s + chipWidth(o.label), 0); // 364

let containerWidth = 0;
let resizeCallbacks = [];
let originalRect;
let originalClientWidth;

// The value container is the only element with the measuring ghost as a direct
// child; everything else reports 0 so it never masquerades as the container.
const isValueContainer = (el) =>
  !!el.querySelector(':scope > [aria-hidden="true"][style*="-9999px"]');

const triggerResize = (width) => {
  containerWidth = width;
  act(() => {
    resizeCallbacks.forEach((cb) => cb([]));
  });
};

beforeAll(() => {
  originalRect = HTMLElement.prototype.getBoundingClientRect;
  HTMLElement.prototype.getBoundingClientRect = function fakeRect() {
    const width = (this.textContent || '').length * CHAR_W + CHIP_PAD;
    return { width, height: 20, top: 0, left: 0, right: width, bottom: 20 };
  };

  originalClientWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'clientWidth',
  );
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return isValueContainer(this) ? containerWidth : 0;
    },
  });

  global.ResizeObserver = class {
    constructor(cb) {
      this.cb = cb;
      resizeCallbacks.push(cb);
    }

    // eslint-disable-next-line class-methods-use-this
    observe() {}

    disconnect() {
      resizeCallbacks = resizeCallbacks.filter((cb) => cb !== this.cb);
    }
  };
});

afterAll(() => {
  HTMLElement.prototype.getBoundingClientRect = originalRect;
  if (originalClientWidth) {
    Object.defineProperty(
      HTMLElement.prototype,
      'clientWidth',
      originalClientWidth,
    );
  }
  delete global.ResizeObserver;
});

beforeEach(() => {
  resizeCallbacks = [];
});

const renderField = ({
  selected = OPTIONS,
  width,
  onChange = vi.fn(),
} = {}) => {
  containerWidth = width;
  const utils = render(
    <GenPropSelectMulti
      field="acquisition_techniques"
      label="acquisition_techniques"
      options={OPTIONS}
      f_obj={{ sub_fields: selected.map((o) => ({ value: o.key })) }}
      onChange={onChange}
      isEditable
    />,
  );
  return { ...utils, onChange };
};

// Visible chips live outside the aria-hidden ghost, so role queries (which skip
// aria-hidden subtrees) see exactly what the user sees.
const badge = () =>
  screen.queryByRole('button', { name: /more selected item/ });
const visibleChipLabels = () =>
  screen
    .queryAllByText(/^(Bright-field|HRTEM|SAED|CBED|EDX)$/)
    .filter((el) => !el.closest('[aria-hidden="true"]'))
    .map((el) => el.textContent);

describe('GenPropSelectMulti chip overflow', () => {
  test('shows every chip when they all fit the row', () => {
    // 500 - padding(<=16) - input reserve(24) = 460+ >= 364
    renderField({ width: 500 });

    expect(ALL_CHIPS_WIDTH).toBe(364);
    expect(visibleChipLabels()).toEqual([
      'Bright-field',
      'HRTEM',
      'SAED',
      'CBED',
      'EDX',
    ]);
    expect(badge()).not.toBeInTheDocument();
  });

  test('collapses only the chips that do not fit', () => {
    // 300 - padding - 24 - badge(44) leaves room for 124 + 68 only.
    renderField({ width: 300 });

    expect(visibleChipLabels()).toEqual(['Bright-field', 'HRTEM']);
    expect(badge()).toHaveTextContent('+3');
  });

  test('fits more chips as the container grows, and fewer as it shrinks', () => {
    renderField({ width: 300 });
    expect(visibleChipLabels()).toHaveLength(2);

    triggerResize(500);
    expect(visibleChipLabels()).toHaveLength(5);
    expect(badge()).not.toBeInTheDocument();

    triggerResize(160);
    expect(visibleChipLabels()).toEqual(['Bright-field']);
    expect(badge()).toHaveTextContent('+4');
  });

  test('keeps one chip visible when even a single chip overflows', () => {
    renderField({ width: 40 });

    expect(visibleChipLabels()).toEqual(['Bright-field']);
    expect(badge()).toHaveTextContent('+4');
  });

  // fireEvent, not userEvent: userEvent's act-batched pointer sequence commits
  // the popover before its click reaches document, so OverlayTrigger's rootClose
  // treats the opening click as an outside click and closes it again. A real
  // browser commits after the event, so the popover stays open.
  test('badge popover lists the hidden items and removes them', async () => {
    const { onChange } = renderField({ width: 300 });

    fireEvent.click(badge());

    const popover = await screen.findByRole('tooltip');
    expect(within(popover).getByText('SAED')).toBeInTheDocument();
    expect(within(popover).getByText('CBED')).toBeInTheDocument();
    expect(within(popover).getByText('EDX')).toBeInTheDocument();
    expect(within(popover).queryByText('HRTEM')).not.toBeInTheDocument();

    fireEvent.click(
      within(popover).getByRole('button', { name: 'Remove SAED' }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    const [newValue, meta] = onChange.mock.calls[0];
    expect(newValue.map((o) => o.value)).toEqual([
      'bf',
      'hrtem',
      'cbed',
      'edx',
    ]);
    expect(meta.action).toBe('remove-value');
  });

  test('renders the placeholder with no selection', () => {
    renderField({ selected: [], width: 500 });

    expect(visibleChipLabels()).toHaveLength(0);
    expect(badge()).not.toBeInTheDocument();
  });
});
