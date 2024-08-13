import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { buildTSS } from 'generic-ui-core';

const constructOption = data => {
  if (data) {
    const desc = data.description?.join('') || '';
    return {
      value: data.id,
      label: (
        <>
          {data.label}
          <span>
            <span className="gu-ontology-select-code-short badge">
              {data.short_form}
            </span>
            &nbsp;
            <span className="gu-ontology-select-code-prefix badge">
              {data.ontology_prefix}
            </span>
            {desc ? (
              <>
                <br />
                <span style={{ fontSize: '11px' }}>{desc}</span>
              </>
            ) : null}
          </span>
        </>
      ),
    };
  }
  return data;
};

const constructOptions = data => {
  if (!data) {
    return [];
  }
  return data.map(d => {
    const option = Object.assign(constructOption(d), { data: d });
    return option;
  });
};

const OntologySelect = props => {
  const { fnSelected, defaultValue } = props;
  const [, setData] = useState(null);

  const fetchData = async inputValue => {
    try {
      if (!inputValue.trim() || inputValue.length < 2) {
        return [];
      }

      const response = await fetch(buildTSS(inputValue));
      if (!response.ok) {
        throw new Error('Network request failed');
      }
      const result = await response.json();
      return constructOptions(result?.response?.docs);
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchData('').then(setData);
  }, []);

  return (
    <AsyncSelect
      backspaceRemoves
      isClearable
      value={defaultValue}
      valueKey="value"
      labelKey="label"
      loadOptions={(inputValue, callback) => {
        fetchData(inputValue).then(options => callback(options));
      }}
      onChange={selected => {
        fnSelected(selected);
      }}
      styles={{
        container: baseStyles => {
          return {
            ...baseStyles,
            width: '100%',
          };
        },
        control: base => {
          return {
            ...base,
            height: '36px',
            minHeight: '36px',
            minWidth: '200px',
            border: '1px solid #ccc',
          };
        },
      }}
    />
  );
};

export default OntologySelect;
