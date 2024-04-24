import { FieldTypes, genUnit } from 'generic-ui-core';
import si from './metadata.json';

function DatasetMetadata(dcs, idDt) {
  const metadata = {};
  const dc = dcs?.filter(e => idDt === e.id);

  if (dc?.length === 0) {
    return metadata;
  }

  const { properties, klass_ols: klassOls } = dc[0].dataset;
  const siCheck = si?.[klassOls];

  if (!siCheck) {
    return metadata;
  }

  siCheck.forEach(sio => {
    const fio = properties.layers[sio.layer]?.fields.find(
      field => field.field === sio.field
    );
    if (fio) {
      switch (fio.type) {
        case FieldTypes.F_SYSTEM_DEFINED: {
          const label =
            genUnit(fio.option_layers, fio.value_system)?.label || '';
          metadata[sio.var] = `${fio.value} ${label}`;
          break;
        }
        case FieldTypes.F_TEXT:
        case FieldTypes.F_INTEGER:
        case FieldTypes.F_SELECT:
          metadata[sio.var] = fio.value;
          break;
        default:
          metadata[sio.var] = '';
      }
    }
  });
  return metadata;
}

export default DatasetMetadata;
