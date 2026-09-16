/**
 * Central portal for registered consumer components.
 * Library-owned — not exposed to consumers.
 *
 * Each entry defines:
 *   extract(properties, metadata, encKey) -> data
 *     Derive consumer-friendly data. Predefined fields (e.g. layer_name) are
 *     read from properties; consumer-authored extras are read from the
 *     per-registry slot at metadata[encKey] (an array keyed by layer key).
 *     Return null when the document is not renderable by this consumer.
 *
 *   merge(properties, updatedData, metadata, encKey) -> { properties, metadata, notify }
 *     Write updatedData back, splitting predefined fields onto the template
 *     (properties) and non-predefined fields into metadata[encKey]. The
 *     returned metadata should preserve unrelated sibling fields. RegCompHost
 *     only commits and calls fnChange when notify.isSuccess is true.
 *
 * encKey is the base64-encoded segment from the document's
 * metadata.registries entry ("ns:encoded"). It is the sibling slot key on
 * metadata where consumer extras live (e.g. metadata["bGF5ZXJTdGFjawo="]).
 *
 * To add a new registered component:
 *   1. Create src/components/regComps/<name>.js exporting { extract, merge }.
 *   2. Import + register below.
 *   3. Add the corresponding key to src/config/regComps.json with enabled: true.
 */
import layerStack from '@components/regComps/layerStack';

const regCompRegistry = {
  layerStack,
};

export default regCompRegistry;
