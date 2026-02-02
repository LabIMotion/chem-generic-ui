import cloneDeep from 'lodash/cloneDeep';
import Constants from '@components/tools/Constants';

/**
 * Factory function to create a Generic Dataset class with injected dependency
 */
export function createDataset(Element) {
  return class GenDataset extends Element {
    static buildEmpty(klass, containerId) {
      const metadata = klass && klass.metadata ? cloneDeep(klass.metadata) : {};
      const template =
        klass && klass.properties_release
          ? cloneDeep(klass.properties_release)
          : {};
      return new GenDataset({
        dataset_klass_id: this.dataset_klass_id || (klass && klass.id),
        element_type: Constants.MODEL_TYPES.CONTAINER,
        element_id: containerId,
        metadata,
        properties: template,
        properties_release: template,
        klass_ols: klass?.ols_term_id,
        klass_label: klass?.label,
        changed: false,
      });
    }

    serialize() {
      return super.serialize({
        dataset_klass_id: this.dataset_klass_id,
        element_type: Constants.MODEL_TYPES.CONTAINER,
        element_id: this.element_id,
        metadata: this.metadata,
        properties: this.properties,
        properties_release: this.properties_release,
      });
    }

    get datasetKlassId() {
      return this.dataset_klass_id;
    }

    set datasetKlassId(datasetKlassId) {
      this.dataset_klass_id = datasetKlassId;
    }

    get klassOls() {
      return this.klass_ols;
    }

    set klassOls(klassOls) {
      this.klass_ols = klassOls;
    }

    get klassLabel() {
      return this.klass_label;
    }

    set klassLabel(klassLabel) {
      this.klass_label = klassLabel;
    }
  };
}

export default createDataset;
