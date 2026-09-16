import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FieldTypes } from 'generic-ui-core';
import ProgressOverview from '@components/flow/ProgressOverview';
import Constants from '@components/tools/Constants';

const SYS_KEY = `${Constants.SYS_REACTION}1712345678901`;

const analysisLayer = {
  key: 'analysis',
  label: 'Analysis',
  position: 1,
  cols: 1,
  fields: [
    {
      type: FieldTypes.F_TEXT,
      field: 'note',
      label: 'Note',
      value: 'done',
      position: 1,
    },
  ],
};

// What handler.addLayer() synthesises when a reaction is attached: no label,
// one empty sys field, so it scores 0% completion.
const sysReactionLayer = {
  key: SYS_KEY,
  label: '',
  position: 2,
  cols: 1,
  fields: [
    {
      type: FieldTypes.F_SYS_REACTION,
      field: 'reaction',
      label: '',
      value: '',
      position: 1,
    },
  ],
};

const buildGeneric = (metadata = {}) => ({
  properties: {
    layers: {
      [analysisLayer.key]: analysisLayer,
      [sysReactionLayer.key]: sysReactionLayer,
    },
  },
  metadata,
});

const renderOverview = (generic) =>
  render(<ProgressOverview generic={generic} onNodeJump={jest.fn()} />);

describe('ProgressOverview', () => {
  describe('system-added reaction layers', () => {
    it('renders no card for an ungrouped sys layer', () => {
      renderOverview(buildGeneric());

      expect(screen.queryByText(/^REACTION-/)).not.toBeInTheDocument();
      expect(screen.getByText('Analysis')).toBeInTheDocument();
    });

    it('renders no card for a sys layer nested in a group', async () => {
      const generic = buildGeneric({
        groups: [
          {
            id: 'g1',
            label: 'Sample Group',
            position: 1,
            layers: [analysisLayer.key, SYS_KEY],
          },
        ],
      });
      renderOverview(generic);

      expect(screen.getByText('Sample Group')).toBeInTheDocument();

      screen.getByTitle('Expand').click();

      expect(await screen.findByText('Analysis')).toBeInTheDocument();
      expect(screen.queryByText(/^REACTION-/)).not.toBeInTheDocument();
    });

    it('excludes a sys layer from its group completion', () => {
      const generic = buildGeneric({
        groups: [
          {
            id: 'g1',
            label: 'Sample Group',
            position: 1,
            layers: [analysisLayer.key, SYS_KEY],
          },
        ],
      });
      renderOverview(generic);

      // Averaging in the 0% sys layer would report 50%.
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });
  });
});
