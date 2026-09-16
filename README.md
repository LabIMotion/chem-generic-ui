# chem-generic-ui
[![npm version](https://img.shields.io/npm/v/chem-generic-ui)](https://www.npmjs.com/package/chem-generic-ui)
[![Downloads](https://img.shields.io/npm/dm/chem-generic-ui)](https://www.npmjs.com/package/chem-generic-ui)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.8305319.svg)](https://doi.org/10.5281/zenodo.8305319)

**chem-generic-ui** is a React component library for building schema-driven scientific and laboratory applications. It provides dynamic form and table builders for complex data-driven interfaces.

It is used in the Chemotion LabIMotion ecosystem for constructing structured datasets, element forms, and table-based layouts.

## Project Showcase

### [LabIMotion](https://www.chemotion.net/docs/labimotion)

<img src="https://labimotion.github.io/assets/images/labimotion_logo.png" alt="LabIMotion Logo" width="300" />

A scientific data management application built using chem-generic-ui.

#### Flexible Layout Designs

- [Rich UI Components](https://www.chemotion.net/docs/labimotion/designer/components/fields/types)
- Different Layout Designs
  - Element Details: [Text fields, checkboxes, selection inputs and drag-and-drop](https://www.chemotion.net/docs/labimotion/user/elements/details)
  - Segment Details: [Table-Based layout, for multiple records with drag-and-drop functionality inside tables](https://www.chemotion.net/docs/labimotion/user/segments/details)
  - Dataset Details: [Styling and unit conversion](https://www.chemotion.net/docs/labimotion/user/datasets/details)

- Layer grouping to manage multiple layers

## Installation

The chem-generic-ui library is available as an NPM package. Install it either with NPM:

```
npm install --save chem-generic-ui
```

or Yarn:

```
yarn add chem-generic-ui
```

## Host application setup

### AG Grid module registration

`ag-grid-community` and `ag-grid-react` (`>=33.0.0 <34.0.0`) are peer dependencies — the host application provides them. Since version 2.3.0, chem-generic-ui no longer registers AG Grid modules itself. Register them once in your application entry point, before rendering any chem-generic-ui component that contains a grid:

```js
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
```

Without this, AG Grid throws error #200 ("unable to use … as the module is not registered") when a grid component mounts.

## Support and Community

If you have questions, comments, or suggestions, the best place to share them is in the [Discussions](https://github.com/LabIMotion/chem-generic-ui/discussions) section. We welcome your feedback and participation!
