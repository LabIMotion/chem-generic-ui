import cloneDeep from 'lodash/cloneDeep';
import { resetProperties } from 'generic-ui-core';
import Constants from '@components/tools/Constants';
import { buildInitWF } from '@components/tools/orten';

/**
 * Factory function to create a Generic Segment class with injected dependency
 */
export function createSegment(Element) {
  return class GenSegment extends Element {
    /**
     * Creates an empty Segment instance from a class template
     */
    static buildEmpty(klass) {
      const metadata = klass && klass.metadata ? cloneDeep(klass.metadata) : {};
      const template =
        klass && klass.properties_release
          ? cloneDeep(klass.properties_release)
          : {};
      return new GenSegment({
        segment_klass_id: this.segment_klass_id || (klass && klass.id),
        metadata,
        properties: buildInitWF(template),
        select_options: template.select_options || {},
        segment_klass: klass,
        properties_release: template,
        files: [],
        wfLayers: template,
      });
    }

    /**
     * Creates copies of segments with reset properties
     */
    static buildCopy(segments) {
      const clonedSegments = cloneDeep(segments);
      clonedSegments.map((segmentData) => {
        // eslint-disable-next-line no-param-reassign
        segmentData.properties = resetProperties(segmentData.properties);
        return segmentData;
      });
      return clonedSegments;
    }

    serialize() {
      return super.serialize({
        klassType: Constants.MODEL_TYPES.SEGMENT,
        segment_klass: this.segment_klass,
        segment_klass_id: this.segment_klass_id,
        metadata: this.metadata,
        properties: this.properties,
        properties_release: this.properties_release,
        files: this.files,
      });
    }
  };
}

export default createSegment;
