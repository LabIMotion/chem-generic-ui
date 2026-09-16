import regCompStatusPackage, {
  listRegComps,
} from '@components/regComps/regCompStatusPackage';

function Stub() {
  return null;
}

// Package-level resolver: the host passes a name-keyed map of comps; a name is
// usable only when it is whitelisted in reg.json AND enabled in regComps.json.
// No per-row gating / template extract here — the host comp self-gates.
describe('regCompStatusPackage', () => {
  it('returns ok when the name is host-provided, registered, and enabled', () => {
    const status = regCompStatusPackage({ layerStack: Stub }, 'layerStack');
    expect(status.ok).toBe(true);
    expect(status.comp).toBe(Stub);
    expect(status.name).toBe('layerStack');
    expect(status.configEntry.mode).toBe('write');
  });

  it('returns reason "missing" when the host did not provide a comp for the name', () => {
    expect(regCompStatusPackage({}, 'layerStack')).toMatchObject({
      ok: false,
      reason: 'missing',
    });
    expect(regCompStatusPackage(null, 'layerStack')).toMatchObject({
      ok: false,
      reason: 'missing',
    });
  });

  it('returns reason "unregistered" when the name is not whitelisted in reg.json', () => {
    expect(regCompStatusPackage({ phantom: Stub }, 'phantom')).toMatchObject({
      ok: false,
      reason: 'unregistered',
    });
  });

  it('returns reason "disabled" when the entry is not enabled in regComps.json', async () => {
    vi.resetModules();
    vi.doMock('@/config/regComps.json', () => ({
      default: {
        layerStack: { mode: 'write', enabled: false, label: 'Layer Stack' },
      },
    }));
    const { default: fn } =
      await import('@components/regComps/regCompStatusPackage');
    expect(fn({ layerStack: Stub }, 'layerStack')).toMatchObject({
      ok: false,
      reason: 'disabled',
    });
    vi.doUnmock('@/config/regComps.json');
    vi.resetModules();
  });

  it('listRegComps returns one entry per enabled + registered comp the host provided', () => {
    expect(listRegComps({ doi: Stub })).toEqual([
      { name: 'doi', label: 'DOI Info.', mode: 'read' },
    ]);
    // names the host did not provide are skipped
    expect(listRegComps({})).toEqual([]);
  });
});
