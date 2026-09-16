import Constants from '@components/tools/Constants';

// The "Wellplates" segment template is a system marker that enables the
// dedicated wellplate tab on generic elements. In the segment designer it is
// locked: only its active/inactive state may be changed, so every other row
// action (copy, edit, delete, export, template, info) is disabled for it.
export const WELLPLATE_SEGMENT_LABEL = 'Wellplates';

export const isWellplateSegment = (data, genericType) =>
  genericType === Constants.GENERIC_TYPES.SEGMENT &&
  (data?.label || '').trim() === WELLPLATE_SEGMENT_LABEL;
