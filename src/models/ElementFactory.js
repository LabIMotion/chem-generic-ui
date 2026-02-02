/* eslint-disable no-underscore-dangle */
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { resetProperties, showProperties, FieldTypes } from 'generic-ui-core';
import Constants from '@components/tools/Constants';
import { buildInitWF } from '@components/tools/orten';
import { organizeLayersForDisplay } from '@utils/template/group-handler';
import {
  isFieldEffectivelyVisible,
  isItemEffectivelyVisible,
} from '@utils/template/visibility-handler';

/**
 * Factory function to create a Generic Element class with injected dependencies
 */
export function createElement(Element, Container, Segment) {
  return class GenElement extends Element {
    static buildEmpty(collectionId, klass, currentUser) {
      const metadata = klass && klass.metadata ? cloneDeep(klass.metadata) : {};
      const template =
        klass && klass.properties_release
          ? cloneDeep(klass.properties_release)
          : {};
      return new GenElement({
        collection_id: collectionId,
        type: klass.name,
        element_klass_id: this.element_klass_id || (klass && klass.id),
        short_label: GenElement.buildNewShortLabel(klass, currentUser),
        name: `New ${klass.label}`,
        container: Container.init(),
        metadata,
        properties: buildInitWF(template),
        properties_release: template,
        element_klass: klass,
        can_copy: false,
        attachments: [],
        files: [],
        segments: [],
        wfLayers: template,
      });
    }

    serialize() {
      return super.serialize({
        name: this.name,
        can_copy: true,
        klassType: Constants.MODEL_TYPES.GENERICEL,
        element_klass: this.element_klass,
        element_klass_id: this.element_klass_id, // this._element_klass_id,
        metadata: this.metadata,
        properties: this.properties,
        properties_release: this.properties_release,
        container: this.container,
        attachments: this.attachments,
        files: this.files,
        user_labels: this.user_labels || [],
        segments: this.segments.map((s) => s.serialize()),
      });
    }

    analysesContainers() {
      const TYPE = 'analyses';
      if (this.container.children.length === 0) {
        const analyses = Container.buildEmpty();
        analyses.container_type = TYPE;
        this.container.children.push(analyses);
      }
      return this.container.children.filter(
        (el) => ~el.container_type.indexOf(TYPE),
      );
    }

    analysisContainers() {
      const TYPE = 'analysis';
      let target = [];
      this.analysesContainers().forEach((aec) => {
        const aics = aec.children.filter(
          (el) => ~el.container_type.indexOf(TYPE),
        );
        target = [...target, ...aics];
      });
      return target;
    }

    datasetContainers() {
      const TYPE = 'dataset';
      let target = [];
      this.analysisContainers().forEach((aic) => {
        const dts = aic.children.filter(
          (el) => ~el.container_type.indexOf(TYPE),
        );
        target = [...target, ...dts];
      });
      return target;
    }

    static buildNewShortLabel(klass, currentUser) {
      if (!currentUser) {
        return `new_${klass.label}`;
      }
      return `${currentUser.initials}-${klass.klass_prefix}${
        parseInt(currentUser.counters[klass.name] || 0, 10) + 1
      }`;
    }

    buildCopy(currentUser, params = {}) {
      const copy = super.buildCopy();
      const newEl = Object.assign(copy, params);
      newEl.short_label = GenElement.buildNewShortLabel(
        newEl.element_klass,
        currentUser,
      );
      newEl.container = Container.init();
      newEl.can_update = true;
      newEl.can_copy = false;
      return newEl;
    }

    static copyFromCollectionId(element, collectionId, currentUser) {
      const target = cloneDeep(element.properties);
      const params = {
        collection_id: collectionId,
        properties: resetProperties(target),
      };
      const copy = element.buildCopy(currentUser, params);
      copy.origin = { id: element.id, short_label: element.short_label };
      return copy;
    }

    get klassType() {
      return Constants.MODEL_TYPES.GENERICEL;
    }

    get name() {
      return this._name;
    }

    set name(name) {
      this._name = name;
    }

    get label() {
      return (this.element_klass && this.element_klass.label) || '';
    }

    get desc() {
      return (this.element_klass && this.element_klass.desc) || '';
    }

    get element_klass() {
      return this._element_klass;
    }

    set element_klass(klass) {
      this._element_klass = klass;
    }

    get klassName() {
      return this._klass_name;
    }

    set klassName(klassName) {
      this._klass_name = klassName;
    }

    get metadata() {
      return this._metadata;
    }

    set metadata(metadata) {
      this._metadata = metadata || {};
    }

    get properties() {
      return this._properties;
    }

    set properties(properties) {
      this._properties = properties;
    }

    get element_klass_id() {
      return this._element_klass_id;
    }

    set element_klass_id(elementKlassId) {
      this._element_klass_id = elementKlassId;
    }

    set segments(segments) {
      this._segments = (segments && segments.map((s) => new Segment(s))) || [];
    }

    get segments() {
      return this._segments || [];
    }

    set klass_uuid(klassUuid) {
      this._klass_uuid = klassUuid;
    }

    get klass_uuid() {
      return this._klass_uuid;
    }

    get uuid() {
      return this._uuid;
    }

    set uuid(uuid) {
      this._uuid = uuid;
    }

    title() {
      return `${this.short_label}     ${this.name}`;
    }

    userLabels() {
      return this.user_labels;
    }

    setUserLabels(userLabels) {
      this.user_labels = userLabels;
    }

    get isPendingToSave() {
      return !isEmpty(this) && (this.isNew || this.changed);
    }

    isValidated() {
      const validName = !!(this.name && this.name.trim() !== '');
      if (!validName) return false;

      const layers = this.properties?.layers || {};
      const metadata = this.metadata || {};
      const groups = metadata.groups || [];
      const restrictions = metadata.restrict || {};

      // Get organized display items matching UI structure
      const displayItems = organizeLayersForDisplay(layers, groups);

      // Validate all display items
      for (const item of displayItems) {
        if (item.type === 'group') {
          const groupRestriction = restrictions[item.id];
          if (groupRestriction && groupRestriction.cond?.length > 0) {
            const [isVisible] = isItemEffectivelyVisible(groupRestriction, layers);
            if (!isVisible) continue;
          }

          for (const layerItem of item.layers) {
            const layer = layerItem.data;
            if (layer.cond_fields?.length > 0) {
              const [isVisible] = isItemEffectivelyVisible(layer, layers);
              if (!isVisible) continue;
            }

            if (
              !this.validateFields(
                layer.fields,
                layer,
                (f, l) => {
                  const [visible] = isFieldEffectivelyVisible(f, l, layers);
                  return visible;
                },
              )
            ) {
              return false;
            }
          }
        } else {
          const layer = item.data;
          if (layer.cond_fields?.length > 0) {
            const [isVisible] = isItemEffectivelyVisible(layer, layers);
            if (!isVisible) continue;
          }

          if (
            !this.validateFields(
              layer.fields,
              layer,
              (f, l) => {
                const [visible] = isFieldEffectivelyVisible(f, l, layers);
                return visible;
              },
            )
          ) {
            return false;
          }
        }
      }

      return true;
    }

    validateFields(fields, layer, visibilityCheck) {
      for (const f of fields || []) {
        if (
          (f.required === true || f.required === 'true') &&
          [FieldTypes.F_TEXT, FieldTypes.F_INTEGER].includes(f.type)
        ) {
          // Only validate if field is effectively visible
          if (visibilityCheck(f, layer)) {
            const value = f.value;
            const isEmptyStr =
              value === null ||
              value === undefined ||
              value.toString().trim() === '';
            if (isEmptyStr) return false;
          }
        }
      }
      return true;
    }
  };
}

export default createElement;
