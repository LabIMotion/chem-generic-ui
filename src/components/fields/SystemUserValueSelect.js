import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import { frmSelSty } from '@components/tools/utils';
import Api from '@utils/apiManager';
import {
  MIN_USER_SEARCH_LENGTH,
  S_USRS_SEARCH_HINT,
  userToOption,
  responseUserOptions,
  selectedUserOption,
  getCachedUserOptions,
  mergeUserOptionsIntoCache,
  fetchMissingUserOptions,
} from '@utils/userSelectUtils';

/**
 * Async picker for a single system-user value, reused wherever a restriction
 * condition needs to target a system user (option_layers === S_USRS_SRC).
 * Stores/returns the user id as a string; resolves stored ids to user names.
 *
 * Mirrors the system-user branch of GenPropertiesSelect in GenPropertiesFields.js.
 */
function SystemUserValueSelect({ value, onChange, isDisabled }) {
  const [remoteOptions, setRemoteOptions] = useState(() =>
    getCachedUserOptions(),
  );

  // Resolve the stored value id whenever it changes (incl. mount) so a value
  // the parent swaps in after mount doesn't linger as "(depr.)". The fetch is a
  // no-op when the id is already cached or known-invalid.
  useEffect(() => {
    fetchMissingUserOptions(value != null && value !== '' ? [value] : []).then(
      (fetched) => {
        if (fetched.length > 0) setRemoteOptions(getCachedUserOptions());
      },
    );
  }, [value]);

  const loadUserOptions = async (inputValue) => {
    const search = inputValue.trim();
    if (search.length < MIN_USER_SEARCH_LENGTH) return [];

    const result = await Api.getUsers({ name: search });
    const fetchedOptions = responseUserOptions(result)
      .map(userToOption)
      .filter((op) => op.value !== '');
    mergeUserOptionsIntoCache(fetchedOptions);
    setRemoteOptions((currentOptions) => {
      const optionMap = new Map(
        [...currentOptions, ...fetchedOptions].map((op) => [op.value, op]),
      );
      return Array.from(optionMap.values());
    });
    return fetchedOptions;
  };

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <AsyncSelect
        isClearable
        cacheOptions
        defaultOptions={false}
        value={selectedUserOption(value, remoteOptions)}
        isDisabled={isDisabled}
        menuPlacement="auto"
        menuPortalTarget={document.body}
        styles={frmSelSty}
        loadOptions={loadUserOptions}
        onChange={(op) => onChange(op ? String(op.value) : '')}
      />
      <Form.Text muted>{S_USRS_SEARCH_HINT}</Form.Text>
    </div>
  );
}

SystemUserValueSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

SystemUserValueSelect.defaultProps = {
  value: '',
  isDisabled: false,
};

export default SystemUserValueSelect;
