const buildTableSource = (type, props, id) => {
  const { molecule, tag } = props;
  const taggable = tag?.taggable_data || {};

  let isAssoc = false;
  if (taggable?.element?.id === id) {
    isAssoc = false;
  } else {
    isAssoc = !!(
      taggable.reaction_id ||
      taggable.wellplate_id ||
      taggable.element
    );
  }

  switch (type) {
    case 'molecule': {
      return {
        el_id: molecule.id,
        el_type: 'molecule',
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
    case 'sample': {
      return {
        el_id: props.id,
        is_new: true,
        cr_opt: 1,
        isAssoc,
        el_type: 'sample',
        el_label: props.short_label,
        el_short_label: props.short_label,
        el_name: props.name,
        el_external_label: props.external_label,
        el_molecular_weight: props.molecule_molecular_weight,
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
      };
    }
  }
};

export default buildTableSource;
