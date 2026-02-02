import { getAssociationStatus } from '@components/tools/utils';
import Constants from '@components/tools/Constants';

const getElementTip = (prop1, prop2, separator) =>
  `${prop1}${separator}${prop2}`;

const elementSource = (props, separator) => {
  const hasProperties = Object.prototype.hasOwnProperty.call(
    props,
    Constants.PROPS_RELEASE,
  );
  const result = {
    icon_name: props.element_klass?.icon_name || '',
    el_tip: hasProperties
      ? getElementTip(props.label, props.name, separator)
      : props.short_label || props.name || props.label || '',
    el_klass: hasProperties ? props.element_klass?.name : props.type,
  };
  return result;
};

// type: molecule, sample, element
// props.type: molecule, sample, element, reaction, ...
const buildSourceFromElement = (type, props, id, classStr) => {
  const taggable = props?.tag?.taggable_data || {};
  const isAssoc = getAssociationStatus(id, taggable);
  const SEPARATOR = Constants.SEPARATOR_TAG;

  const baseSource = {
    el_id: props.id,
    el_type: type,
    el_label: props.short_label,
    el_name: props.name || '',
    el_tip: props.short_label || props.name || props.label || '',
  };

  const typeConfigs = {
    [Constants.PERMIT_TARGET.MOLECULE]: {
      el_id: props.molecule?.id,
      el_label: props.molecule_name_label,
      el_tip: getElementTip(
        props.molecule?.inchikey,
        props.molecule?.cano_smiles,
        SEPARATOR,
      ),
    },
    [Constants.PERMIT_TARGET.SAMPLE]: {
      is_new: true,
      cr_opt: classStr && isAssoc ? 1 : 0,
      isAssoc,
      el_decoupled: props.decoupled || false,
      el_klass: Constants.PERMIT_TARGET.SAMPLE,
    },
    [Constants.PERMIT_TARGET.ELEMENT]: elementSource(props, SEPARATOR),
  };

  return { ...baseSource, ...(typeConfigs[type] || {}) };
};

export default buildSourceFromElement;
