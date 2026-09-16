import regCompConfig from '@/config/regComps.json';
import { encKeyForName } from '@components/regComps/resolveRegKey';

// Package-level analogue of regCompStatus. The per-document path resolves the
// registry from generic.metadata.registries[0]; here the host passes a name-keyed
// map of components — `regComp = { <name>: comp }` — and a name is usable only
// when it is whitelisted in reg.json (registered) AND enabled in regComps.json.
// There is no template extract/merge in this path: the host comp receives the raw
// row + genericType (via RegCellRenderer) and decides per row what to render.
//
//   regCompStatusPackage(regComp, name)
//     regComp : { <name>: comp } injected by the host.
//     name    : which registered component to resolve.
//
// Reasons: missing | unregistered | disabled.
const regCompStatusPackage = (regComp, name) => {
  const comp = regComp?.[name];
  if (!comp) return { ok: false, reason: 'missing', name };

  // Registration whitelist: the name must decode from a reg.json entry. Even
  // though the comp is host-supplied (trusted), it still has to be registered.
  if (!encKeyForName(name)) return { ok: false, reason: 'unregistered', name };

  const configEntry = regCompConfig[name];
  if (!configEntry?.enabled) return { ok: false, reason: 'disabled', name };

  return { ok: true, comp, configEntry, name };
};

// The registered, enabled comps the host supplied — one grid column each, in
// regComps.json declaration order. Used by the grids to build columnDefs.
export const listRegComps = (regComp) =>
  Object.keys(regCompConfig)
    .map((name) => regCompStatusPackage(regComp, name))
    .filter((status) => status.ok)
    .map((status) => ({
      name: status.name,
      label: status.configEntry.label || status.name,
      mode: status.configEntry.mode,
    }));

export default regCompStatusPackage;
