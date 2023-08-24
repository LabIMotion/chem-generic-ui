import { cloneDeep, sortBy } from 'lodash';
import { v4 as uuid } from 'uuid';
import splitFlowElements from '../../utils/flow/split-flow-elements';


const getWFNode = (_flow, nodeId) => _flow.nodes?.filter(e => e.id === nodeId)[0];

// full-flow, node id
const getFlowLayer = (templateFlow, nodeId, sourceLayer, sIdx) => {
  const { nodes, edges, viewport } = templateFlow;
  // const flow = cloneDeep(templateFlow);

  const nd = nodes?.filter(e => e.id === nodeId); // fetch node
  if (nd.length < 1) return null;
  const { layer } = nd[0].data;
  const ls = edges || []; // lines
  const ns = nodes?.filter(e => e.type === 'default' && e.data) || []; // nodes - Start - End
  const ndNs = ls.filter(e => e.source === nodeId).map(e => e.target) || []; // next nodes' id
  const wfOpts = ns.filter(n => ndNs.includes(n.id))?.map(e => ({ key: e.id, label: `${e.data.layer.label}(${e.data.layer.key})` })) || []; // next nodes
  if (wfOpts.length > 0) {
    const position = (layer.fields || []).length + 1;
    layer.fields.push({
      type: 'wf-next', default: '', field: '_wf_next', label: 'Next', required: false, sub_fields: [], text_sub_fields: [], position, wf_options: wfOpts
    });
  }
  layer.wf_info = { node_id: nodeId, source_layer: sourceLayer };
  layer.wf_position = sIdx + 1;
  return layer;
};

const orgLayerObject = (_layers = []) => {
  const layers = _layers;
  return layers.reduce((alles, name) => {
    const all = alles;
    const ok = Object.keys(all);
    if (ok.includes(name.key)) {
      const cnt = ok.filter(e => e === name.key || e.startsWith(`${name.key}.`)).length;
      const nName = `${name.key}.${cnt}`;
      name.key = nName;
      all[nName] = name;
    } else {
      all[name.key] = name;
    }
    return all;
  }, {});
};

const reformCondFields = (_layer, _oKey) => {
  const layer = _layer;
  layer.fields.map(_f => {
    const f = _f;
    let conds = f.cond_fields;
    // no cond_fields
    if (!conds || conds.length < 1 || conds.filter(o => !o.field || o.field === '').length === conds.length) return f;
    conds = conds.filter(o => o.layer === _oKey);
    // no same layer, remove cond_fields
    if (conds.length < 1) {
      delete f.cond_fields;
      return f;
    }
    // rename layer
    conds = conds.map(o => {
      const n = o;
      n.layer = layer.key;
      return n;
    });
    f.cond_fields = conds;
    return f;
  });
  return layer.fields;
};

const addToObject = (obj, key, addAfter) => {
  const temp = {};
  const ok = Object.keys(obj);
  Object.keys(obj).forEach(e => {
    if (Object.prototype.hasOwnProperty.call(obj, e)) {
      temp[e] = obj[e];
      if (e === key) {
        const srcPosition = temp[e].position;
        const cnt = ok.filter(o => o === addAfter.key || o.startsWith(`${addAfter.key}.`)).length;
        if (cnt === 0) {
          temp[addAfter.key] = addAfter;
          temp[addAfter.key].position = srcPosition;
        } else {
          const oKey = addAfter.key;
          temp[`${addAfter.key}.${cnt}`] = addAfter;
          temp[`${addAfter.key}.${cnt}`].position = srcPosition;
          temp[`${addAfter.key}.${cnt}`].key = `${addAfter.key}.${cnt}`;
          temp[addAfter.key].fields = reformCondFields(addAfter, oKey);
        }
      }
    }
  });
  if (Object.keys(obj).length === 0) temp[addAfter.key] = addAfter;
  return temp;
};

const traverseToRemove = (layers, rmKey) => {
  let rms = [];
  Object.keys(layers).forEach(e => {
    if (Object.prototype.hasOwnProperty.call(layers, e)) {
      if (layers[e].key === rmKey) rms = rms.concat(rmKey);
      else if (layers[e].wf_info && (layers[e].wf_info.source_layer === rmKey)) {
        rms = rms.concat(traverseToRemove(layers, layers[e].key));
      }
    }
  });
  return rms;
};

const removeFromObject = (_propertiesLayers = {}, srcLayer = '', rmNode = {}) => {
  const layers = _propertiesLayers;
  const rmLayer = rmNode.data && rmNode.data.layer ? rmNode.data.layer.key : null;
  if (!rmLayer) return [];
  let rms = [];
  Object.keys(layers).forEach(e => {
    if (Object.prototype.hasOwnProperty.call(layers, e)) {
      const wf = layers[e].wf_info;
      if (wf && (wf.source_layer === srcLayer) && (wf.node_id === rmNode.id)) {
        rms = rms.concat(traverseToRemove(layers, layers[e].key));
      }
    }
  });
  rms.forEach(e => delete layers[e]);
  return layers;
};

const buildInitWF = (template) => {
  const orig = cloneDeep(template);
  const { layers, flow, flowObject } = orig;

  const { nodes, edges, viewport } = flowObject
  ? cloneDeep(flowObject)
  : splitFlowElements(flow);

  const sortedLayers = sortBy(layers, l => l.position);
  if (nodes?.filter(e => !['input', 'output'].includes(e.type).length > 0)) {
    // id = 1 Start, id = 2 End
    const nls = nodes; // nodes
    const ls = edges;  // lines
    const ns = nls.filter(e => e.type === 'default' && e.data); // nodes - Start - End
    const nNs = ls.filter(e => e.source === '1').map(e => e.target); // get target ids from Start
    const nextNodes = ns.filter(n => nNs.includes(n.id)); // target nodes
    const result = [];
    sortedLayers.forEach((sortedLayer) => {
      const fLayer = sortedLayer;
      if (fLayer.wf) {
        const position = (fLayer.fields || []).length + 1;
        const passen = nextNodes.filter(n => n.data.layer.key === fLayer.key);
        passen.forEach((pas) => {
          const nextOptions = ls.filter(e => e.source === pas.id && e.source !== e.target).map(e => e.target);
          const wfOpts = ns.filter(n => nextOptions.includes(n.id)).map(e => ({ key: e.id, label: `${e.data.layer.label}(${e.data.layer.key})` })); // next nodes
          if (wfOpts.length > 0) {
            fLayer.fields.push({
              type: 'wf-next', default: '', field: '_wf_next', label: 'Next', required: false, sub_fields: [], text_sub_fields: [], position, wf_options: wfOpts
            });
          }
          fLayer.wf_info = { node_id: pas.id };
          fLayer.wf_position = 1;
          fLayer.wf_uuid = uuid();
          result.push(fLayer);
        });
      } else {
        result.push(fLayer);
      }
    });
    const ll = orgLayerObject(result);
    orig.layers = ll;
  } else {
    orig.layers = layers;
  }
  return orig;
};

export {
  getWFNode, getFlowLayer, orgLayerObject,
  addToObject, removeFromObject, reformCondFields, buildInitWF
};
