# Chem-Generic-UI Changelog

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
