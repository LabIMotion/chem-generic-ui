import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FieldTypes } from 'generic-ui-core';
import FieldBadge from '@components/fields/FieldBadge';
import findTypeLabel from '@components/tools/field-utils';
import { S_USRS_SRC_OPTION } from '@utils/userSelectUtils';

const SELECT = findTypeLabel(FieldTypes.F_SELECT);
const SELECT_MULTI = findTypeLabel(FieldTypes.F_SELECT_MULTI);

describe('FieldBadge', () => {
  describe('prop: type', () => {
    it('renders plain type label for a non-select field', () => {
      render(<FieldBadge prop="type" fieldObj={{ type: FieldTypes.F_TEXT }} />);
      expect(
        screen.getByText(findTypeLabel(FieldTypes.F_TEXT)),
      ).toBeInTheDocument();
    });

    it('appends the option layer for a select field', () => {
      render(
        <FieldBadge
          prop="type"
          fieldObj={{ type: FieldTypes.F_SELECT, option_layers: 'colors' }}
        />,
      );
      expect(screen.getByText(`${SELECT}: colors`)).toBeInTheDocument();
    });

    it('appends the option layer for a select-multi field', () => {
      render(
        <FieldBadge
          prop="type"
          fieldObj={{
            type: FieldTypes.F_SELECT_MULTI,
            option_layers: 'colors',
          }}
        />,
      );
      expect(screen.getByText(`${SELECT_MULTI}: colors`)).toBeInTheDocument();
    });

    it('maps the system-user token to its friendly label', () => {
      render(
        <FieldBadge
          prop="type"
          fieldObj={{
            type: FieldTypes.F_SELECT_MULTI,
            option_layers: S_USRS_SRC_OPTION.value,
          }}
        />,
      );
      expect(
        screen.getByText(`${SELECT_MULTI}: ${S_USRS_SRC_OPTION.label}`),
      ).toBeInTheDocument();
    });

    it('omits the suffix when a select has no option layer (no "undefined")', () => {
      render(
        <FieldBadge prop="type" fieldObj={{ type: FieldTypes.F_SELECT }} />,
      );
      expect(screen.getByText(SELECT)).toBeInTheDocument();
      expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
    });
  });

  describe('prop: field', () => {
    it('renders the field value', () => {
      render(<FieldBadge prop="field" fieldObj={{ field: 'my_field' }} />);
      expect(screen.getByText('my_field')).toBeInTheDocument();
    });

    it('renders nothing when the field value is empty', () => {
      const { container } = render(
        <FieldBadge prop="field" fieldObj={{ field: '' }} />,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('prop: cols', () => {
    it('renders the column-width text when set', () => {
      render(<FieldBadge prop="cols" fieldObj={{ cols: 3 }} />);
      expect(screen.getByText('column width division: 3')).toBeInTheDocument();
    });

    it('renders nothing when cols is falsy', () => {
      const { container } = render(
        <FieldBadge prop="cols" fieldObj={{ cols: 0 }} />,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });
});
