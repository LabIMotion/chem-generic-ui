# Chem-Generic-UI Changelog

## [2.1.0]
> 2025-03-04

* Features and enhancements:
  * Introduced multiple selections feature.
  * Elimiated the JavaScript warning related to two children with the same key.
  * Provided template version data for users.
  * Introduced the `Quick Filter` feature for all grids.

## [2.0.0]
> 2025-01-04

This is a major release and includes a breaking change.

* Features and enhancements:
  * Upgraded the main UI component - a breaking change of `react-bootstrap` and is not compatible with the previous ELN version.
  * Introduced a new form layout for designers.
  * Introduced the `Arrange Layers` and `Arrange Fields` feature for reordering the layers and fields.
  * Expanded the `LabIMotion Vocabulary (Lab-Vocab)`, more vocabularies are added.
  * Introduced a new toggle button for designers to switch between `Work Area` and `Preview` modes.

* Bug fixes:
  * Fixed a JavaScript warning related to the missing key prop for unique elements.

* Chores:
  * Bumped react-bootstrap from 0.33.1 to 2.10.2.
  * Bumped cross-spawn from 7.0.3 to 7.0.6.
  * Bumped sass from 1.49.10 to 1.80.4.
  * Bumped sass from 12.6.0 to 16.0.2.

## [1.5.0]
> 2024-11-30

* Features and enhancements:
  * LabIMotion Vocabulary (Lab-Vocab)
    * [Concept of LabIMotion Vocabulary (Lab-Vocab)](https://doi.org/10.5281/zenodo.13881070)
  * Generic Layer
  * User Interface Foundation
  * Extract "other solvent" for dataset.

* Bug fixes:
  * Fixed an issue where an unexpected page was dislayed when no dataset existed for the CV case.

* Chores:
  * Bumped express from 4.19.2 to 4.21.0.

## [1.4.9]
> 2024-11-11

* Features and enhancements:
  * Introduced the `Workflow for Segement` feature.
  * Given the default wording 'Learn more' for the Designer Helper.

* Bug fixes:
  * Fixed an issue where an extra line was created in the CV template.
  * Resolved a page-breaking error that occurred when reloading the template.
  * Fixed an incorrect layout with the "datetime-range" type field.
  * Corrected the layout problem for columns with the "hasOwnLine" attribute enabled.

* Chores:
  * Bumped webpack from 5.86.0 to 5.94.0.
  * Bumped micromatch from 4.0.5 to 4.0.8.

## [1.4.0]
> 2024-08-22

* Features and enhancements:
  * Added image preview feature for the "Upload" type field when the uploaded file is an image.
  * Introduced the `Drag Reaction to Element` feature for users.
  * Introduced the feature to use the drag-and-drop functionality to arrange the layer or field order.
  * Auto-mapping CV dataset data to reaction description.
  * Added the ability for users to record their work steps and visualize them as a flow diagram.
  * Refactored the "Date-Time" component in the layer header.
  * Style: Better view size for template hub.
  * Style: Aligned field styles for better consistency.
  * Style: Selection options style to be vertically aligned.

* Chores:
  * Bumped ejs from 3.1.9 to 3.1.10
  * Bumped ws from 7.5.9 to 7.5.10
  * Bumped braces from 3.0.2 to 3.0.3
  * Upgraded ag-grid to 32.0.1
  * Upgraded nodejs to 18.20.3
  * Upgraded yarn to 1.22.22

## [1.3.0]
> 2024-04-24

* Features and enhancements:
  * Introduce new options to restriction setting for designer
  * Introduce the customized field name based on certain conditions for designer
  * Introduce the default unit feature for designer
  * Introduce the element export function in docx format for user
  * Dynamic field columns for designer
  * Export and import klass and its template within the same instance or across instances for designer
  * Add error handling on export and import klass and its template function
  * Add helpers for designer

* Bug fixes:
  * Fix missing options for drag sample
  * Fix dynamic column width issue
  * Re-label datetime range
  * Rename button title

* Chores:
  * Upgrade generic-ui-core
  * Bump follow-redirects from 1.15.4 to 1.15.6
  * Bump webpack-dev-middleware from 5.3.3 to 5.3.4
  * Upgrade node
  * Bump express from 4.18.2 to 4.19.2
  * Upgrade yarn 1.22.19

## [1.1.2]
> 2024-02-29

* Features and enhancements:
  * Introduced the feature to set the match option on the restriction setting.

* Bug fixes:
  * Fixed the issue with the restriction is not functioning properly in the initial view of template.

## [1.1.1]
> 2024-01-30

* Features and enhancements:
  * Introduced read-only attribute to text field
  * Introduced the feature to drag an element sample to a segment

* Bug fixes:
  * Encoding the service URL
  * Missing "Assign to Element" when copying a segment

* Chores:
  * Prototype Pollution in Lodash
  * Updated README
  * Bump follow-redirects from 1.15.2 to 1.15.4
  * Upgraded puma from 5.6.8 to 5.6.9
  * Upgraded follow-redirects from 1.15.5 to 1.16.0

## [1.1.0]

* Features and enhancements:
  * Introduced the feature to associate template with Ontology Term. Check the video [here](https://youtu.be/ZJlUtO4DCao?list=PLZoVOhxCsajnl5_tveYUvtD0Y57devzdn).

## [1.0.12]
> 2024-01-09

* Bug fixes:
  * Breaking page while reload the undefined template

* Chores:
  * Bump @adobe/css-tools from 4.3.1 to 4.3.2
  * Bump @babel/traverse from 7.22.5 to 7.23.2
  * Bump follow-redirects from 1.15.2 to 1.15.4

## [1.0.11]
> 2023-11-13

* Features and enhancements:
  * Drag element sample to segment

* Chores:
  * Bump postcss from 8.4.24 to 8.4.31
