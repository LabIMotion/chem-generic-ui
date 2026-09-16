import regCompConfig from '@/config/regComps.json';
import regCompRegistry from '@components/regComps';
import resolveRegKey from '@components/regComps/resolveRegKey';

const regCompStatus = (regComp, generic) => {
  const comp = regComp?.comp;
  const regKey = generic?.metadata?.registries?.[0];
  if (!comp || !regKey) return { ok: false, reason: 'missing' };

  const resolvedRegKey = resolveRegKey(regKey);
  if (!resolvedRegKey) return { ok: false, reason: 'unauthorized', regKey };

  const registryEntry = regCompRegistry[resolvedRegKey];
  if (!registryEntry)
    return { ok: false, reason: 'no-registry', resolvedRegKey };

  const configEntry = regCompConfig[resolvedRegKey];
  if (!configEntry?.enabled)
    return { ok: false, reason: 'disabled', resolvedRegKey };

  // Sibling slot key where extras for this registry live on metadata.
  const encKey = regKey.split(':')[1];

  const data = registryEntry.extract(
    generic.properties,
    generic.metadata,
    encKey,
  );
  if (data == null) return { ok: false, reason: 'not-renderable' };

  return { ok: true, comp, registryEntry, configEntry, data, encKey };
};

export default regCompStatus;
