import {
  MIN_USER_SEARCH_LENGTH,
  S_USRS_SRC,
  S_USRS_SRC_OPTION,
  getCachedUserOptions,
  mergeUserOptionsIntoCache,
  getMissingUserIds,
  userToOption,
  responseUserOptions,
  responseUserOption,
  deprecatedUserOption,
  selectedUserOption,
  selectedUserOptions,
  isSystemUserField,
  fetchMissingUserOptions,
} from '@utils/userSelectUtils';
import Api from '@utils/apiManager';

vi.mock('@utils/apiManager', () => ({
  default: { getUser: vi.fn(), getUsers: vi.fn() },
}));

describe('userSelectUtils', () => {
  describe('constants', () => {
    test('MIN_USER_SEARCH_LENGTH is 3', () => {
      expect(MIN_USER_SEARCH_LENGTH).toBe(3);
    });

    test('S_USRS_SRC token', () => {
      expect(S_USRS_SRC).toBe('-su03-');
    });

    test('S_USRS_SRC_OPTION shape', () => {
      expect(S_USRS_SRC_OPTION).toEqual({
        value: '-su03-',
        name: '-su03-',
        label: 'System user list',
      });
    });
  });

  describe('userToOption', () => {
    test('includes name_abbreviation in label when present', () => {
      const user = {
        id: 7,
        first_name: 'Ada',
        last_name: 'Lovelace',
        name_abbreviation: 'AL',
      };
      expect(userToOption(user)).toEqual({
        value: '7',
        name: '7',
        label: 'Ada Lovelace (AL)',
      });
    });

    test('omits abbreviation suffix when absent', () => {
      const user = {
        id: 8,
        first_name: 'Alan',
        last_name: 'Turing',
      };
      expect(userToOption(user)).toEqual({
        value: '8',
        name: '8',
        label: 'Alan Turing',
      });
    });
  });

  describe('responseUserOptions', () => {
    test('returns data when mc is ss00 and data is array', () => {
      const data = [{ value: 1 }, { value: 2 }];
      expect(responseUserOptions({ mc: 'ss00', data })).toBe(data);
    });

    test('returns [] for null/undefined result', () => {
      expect(responseUserOptions(null)).toEqual([]);
      expect(responseUserOptions(undefined)).toEqual([]);
    });

    test('returns [] for wrong mc', () => {
      expect(responseUserOptions({ mc: 'xx99', data: [] })).toEqual([]);
    });

    test('returns [] when data is not an array', () => {
      expect(responseUserOptions({ mc: 'ss00', data: { value: 1 } })).toEqual(
        [],
      );
      expect(responseUserOptions({ mc: 'ss00' })).toEqual([]);
    });
  });

  describe('responseUserOption', () => {
    test('returns the single user object when mc is ss00 and data is an object', () => {
      const user = { id: 12, first_name: 'Ada', last_name: 'Lovelace' };
      expect(responseUserOption({ mc: 'ss00', data: user })).toBe(user);
    });

    test('returns null for null/undefined result', () => {
      expect(responseUserOption(null)).toBeNull();
      expect(responseUserOption(undefined)).toBeNull();
    });

    test('returns null for wrong mc', () => {
      expect(responseUserOption({ mc: 'se01', data: { id: 1 } })).toBeNull();
    });

    test('returns null when data is an array (list shape, not single)', () => {
      expect(responseUserOption({ mc: 'ss00', data: [{ id: 1 }] })).toBeNull();
    });

    test('returns null when data is missing or not an object', () => {
      expect(responseUserOption({ mc: 'ss00' })).toBeNull();
      expect(responseUserOption({ mc: 'ss00', data: null })).toBeNull();
      expect(responseUserOption({ mc: 'ss00', data: 'nope' })).toBeNull();
    });
  });

  describe('deprecatedUserOption', () => {
    test('builds deprecated option shape with a string value', () => {
      expect(deprecatedUserOption(42)).toEqual({
        value: '42',
        name: '42',
        label: '42 (depr.)',
      });
    });
  });

  describe('selectedUserOption', () => {
    const sourceOptions = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ];

    test('returns null for null/undefined/empty value', () => {
      expect(selectedUserOption(null, sourceOptions)).toBeNull();
      expect(selectedUserOption(undefined, sourceOptions)).toBeNull();
      expect(selectedUserOption('', sourceOptions)).toBeNull();
    });

    test('matches via String coercion (number value vs string option)', () => {
      const opts = [{ value: '2', label: 'Two' }];
      expect(selectedUserOption(2, opts)).toEqual({ value: '2', label: 'Two' });
    });

    test('matches when value is a string and option is a number', () => {
      expect(selectedUserOption('1', sourceOptions)).toEqual({
        value: 1,
        label: 'One',
      });
    });

    test('falls back to deprecated option when not found', () => {
      expect(selectedUserOption(99, sourceOptions)).toEqual({
        value: '99',
        name: '99',
        label: '99 (depr.)',
      });
    });
  });

  describe('selectedUserOptions', () => {
    const sourceOptions = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ];

    test('returns [] for null/undefined subFields', () => {
      expect(selectedUserOptions(null, sourceOptions)).toEqual([]);
      expect(selectedUserOptions(undefined, sourceOptions)).toEqual([]);
    });

    test('resolves matched and deprecated entries', () => {
      const subFields = [{ value: 1 }, { value: 99 }];
      expect(selectedUserOptions(subFields, sourceOptions)).toEqual([
        { value: 1, label: 'One' },
        { value: '99', name: '99', label: '99 (depr.)' },
      ]);
    });

    test('filters out entries that resolve to empty value', () => {
      const subFields = [{ value: '' }, { value: 2 }];
      expect(selectedUserOptions(subFields, sourceOptions)).toEqual([
        { value: 2, label: 'Two' },
      ]);
    });
  });

  describe('isSystemUserField', () => {
    const layers = [
      {
        key: 'l1',
        fields: [
          { field: 'owner', type: 'select', option_layers: S_USRS_SRC },
          { field: 'color', type: 'select', option_layers: 'colors' },
          { field: 'note', type: 'text' },
        ],
      },
    ];

    test('true when field is a system-user select', () => {
      expect(isSystemUserField(layers, 'l1', 'owner')).toBe(true);
    });

    test('false for a static select / non-select field', () => {
      expect(isSystemUserField(layers, 'l1', 'color')).toBe(false);
      expect(isSystemUserField(layers, 'l1', 'note')).toBe(false);
    });

    test('false for unknown layer/field or empty layers', () => {
      expect(isSystemUserField(layers, 'nope', 'owner')).toBe(false);
      expect(isSystemUserField(layers, 'l1', 'nope')).toBe(false);
      expect(isSystemUserField(null, 'l1', 'owner')).toBe(false);
    });
  });

  describe('fetchMissingUserOptions', () => {
    beforeEach(() => vi.clearAllMocks());

    test('fetches missing ids concurrently, merges them, returns options', async () => {
      Api.getUser.mockImplementation((id) =>
        Promise.resolve({
          mc: 'ss00',
          data: { id: Number(id), first_name: 'U', last_name: String(id) },
        }),
      );

      const fetched = await fetchMissingUserOptions([80001, 80002]);

      expect(Api.getUser).toHaveBeenCalledTimes(2);
      expect(fetched.map((o) => String(o.value)).sort()).toEqual([
        '80001',
        '80002',
      ]);
      // merged into the shared cache → no longer missing
      expect(getMissingUserIds([80001, 80002])).toEqual([]);
    });

    test('returns [] and skips the API when nothing is missing', async () => {
      mergeUserOptionsIntoCache([{ value: 80010, label: 'Cached' }]);

      const fetched = await fetchMissingUserOptions([80010]);

      expect(fetched).toEqual([]);
      expect(Api.getUser).not.toHaveBeenCalled();
    });

    test('drops a failed lookup but keeps the rest (no batch poisoning)', async () => {
      Api.getUser.mockImplementation((id) =>
        String(id) === '80021'
          ? Promise.resolve({ mc: 'se00', msg: 'not found' })
          : Promise.resolve({
              mc: 'ss00',
              data: { id: Number(id), first_name: 'Ok', last_name: String(id) },
            }),
      );

      const fetched = await fetchMissingUserOptions([80020, 80021, 80022]);

      expect(fetched.map((o) => String(o.value)).sort()).toEqual([
        '80020',
        '80022',
      ]);
    });

    test('does not re-fetch an id that previously resolved to nothing', async () => {
      Api.getUser.mockResolvedValue({ mc: 'se00', msg: 'not found' });

      await fetchMissingUserOptions([80030]);
      expect(Api.getUser).toHaveBeenCalledTimes(1);
      // recorded as invalid → no longer reported missing
      expect(getMissingUserIds([80030])).toEqual([]);

      Api.getUser.mockClear();
      const second = await fetchMissingUserOptions([80030]);
      expect(second).toEqual([]);
      expect(Api.getUser).not.toHaveBeenCalled();
    });

    test('self-heals: a previously-invalid id recovers when it appears as a real user', async () => {
      Api.getUser.mockResolvedValue({ mc: 'se00', msg: 'not found' });

      await fetchMissingUserOptions([80031]);
      expect(getMissingUserIds([80031])).toEqual([]); // blocked as invalid

      // e.g. the author later searches and the user shows up → merged in
      mergeUserOptionsIntoCache([{ value: 80031, label: 'Recovered User' }]);

      // now resolves as a real cached user, not as invalid
      expect(getMissingUserIds([80031])).toEqual([]);
      expect(getCachedUserOptions()).toContainEqual({
        value: 80031,
        label: 'Recovered User',
      });
    });
  });

  describe('cache: merge / getCached / getMissing', () => {
    test('getMissingUserIds returns [] for null/undefined', () => {
      expect(getMissingUserIds(null)).toEqual([]);
      expect(getMissingUserIds(undefined)).toEqual([]);
    });

    test('string-coerces ids and filters empty-string', () => {
      // unique ids avoid shared module-cache bleed across tests
      expect(getMissingUserIds([9001, '9002', ''])).toEqual(['9001', '9002']);
    });

    test('merge populates cache; getMissing excludes cached; getCached returns snapshot', () => {
      const op = { value: 9100, name: 9100, label: 'Cached User' };
      mergeUserOptionsIntoCache([op]);

      // value coerced to string key on the way in
      expect(getMissingUserIds([9100])).toEqual([]);
      expect(getMissingUserIds([9100, 9101])).toEqual(['9101']);

      const snapshot = getCachedUserOptions();
      expect(Array.isArray(snapshot)).toBe(true);
      expect(snapshot).toContainEqual(op);
    });

    test('merge overwrites option for same id key', () => {
      mergeUserOptionsIntoCache([{ value: 9200, label: 'Old' }]);
      mergeUserOptionsIntoCache([{ value: 9200, label: 'New' }]);

      const snapshot = getCachedUserOptions();
      const matches = snapshot.filter((o) => String(o.value) === '9200');
      expect(matches).toEqual([{ value: 9200, label: 'New' }]);
    });
  });
});
