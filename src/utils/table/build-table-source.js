import Constants from '@components/tools/Constants';

const buildTableSource = (type, props, id, genericType) => {
  const { molecule, tag } = props;
  const taggable = tag?.taggable_data || {};

  let isAssoc = false;
  if (genericType !== 'Segment') {
    if (taggable?.element?.id === id) {
      isAssoc = false;
    } else {
      isAssoc = !!(
        taggable.reaction_id ||
        taggable.wellplate_id ||
        taggable.element
      );
    }
  }

  const cr_opt = genericType !== 'Segment' ? 1 : 0;

  switch (type) {
    case Constants.PERMIT_TARGET.MOLECULE: {
      return {
        el_id: molecule.id,
        el_type: Constants.PERMIT_TARGET.MOLECULE,
        el_label:
          molecule.cano_smiles ||
          props.molecule_formula ||
          props.molecule_name_label,
        el_inchikey: molecule.inchikey,
        el_smiles: molecule.cano_smiles,
        el_iupac: molecule.iupac_name,
        el_molecular_weight: molecule.molecular_weight,
        el_svg: `/images/molecules/${molecule.molecule_svg_file}`,
      };
    }
    case Constants.PERMIT_TARGET.SAMPLE: {
      return {
        el_id: props.id,
        is_new: true,
        cr_opt,
        isAssoc,
        el_type: Constants.PERMIT_TARGET.SAMPLE,
        el_label: props.short_label,
        el_short_label: props.short_label,
        el_name: props.name,
        el_external_label: props.external_label,
        el_molecular_weight: props.molecule_molecular_weight,
        el_smiles: props.molecule_cano_smiles,
        el_svg: props.sample_svg_file
          ? `/images/samples/${props.sample_svg_file}`
          : `/images/molecules/${molecule.molecule_svg_file}`,
        el_decoupled: props.decoupled || false,
      };
    }
    default: {
      return {
        el_id: props.id,
        is_new: true,
        cr_opt: 0,
        el_type: props.type,
        el_label: props.short_label,
        el_name: props.name || '',
      };
    }
  }
};

export default buildTableSource;
