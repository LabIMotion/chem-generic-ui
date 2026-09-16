import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Form, OverlayTrigger, Popover } from 'react-bootstrap';
import Select, { components } from 'react-select';
import AsyncSelect from 'react-select/async';
import FieldHeader from '@components/fields/FieldHeader';
import { fieldCls, frmSelSty } from '@components/tools/utils';
import Api from '@utils/apiManager';
import {
  MIN_USER_SEARCH_LENGTH,
  S_USRS_SEARCH_HINT,
  S_USRS_SRC,
  userToOption,
  responseUserOptions,
  selectedUserOptions,
  getCachedUserOptions,
  mergeUserOptionsIntoCache,
  fetchMissingUserOptions,
} from '@utils/userSelectUtils';

const toOption = (op) => ({
  value: op.key,
  name: op.key,
  label: op.label,
});

// Horizontal margin react-select renders around each chip and the "+N" badge.
const CHIP_MARGIN = 4;
// Width kept free at the end of the row so the search input stays usable.
const INPUT_RESERVE = 24;
// A single chip is never collapsed, even when it is wider than the row.
const MIN_VISIBLE = 1;

// flexShrink keeps the badge at its natural width in the nowrap row, so the
// width measured off the ghost is the width the real badge will occupy.
const badgeStyle = { fontSize: '0.75em', flexShrink: 0 };

// Off-screen copy of every chip plus the badge, used to measure natural widths.
// It stays mounted while chips are hidden, which is what makes re-expanding on
// a wider container possible.
const measureStyle = {
  position: 'absolute',
  top: '-9999px',
  left: 0,
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  visibility: 'hidden',
  pointerEvents: 'none',
};

/**
 * Number of chips that fit on one row of the value container, re-evaluated
 * whenever the selection or the container width changes.
 */
function useVisibleChipCount(measureRef, total, selectionKey) {
  const [visibleCount, setVisibleCount] = useState(total);

  useLayoutEffect(() => {
    const ghost = measureRef.current;
    const container = ghost?.parentElement;
    if (!ghost || !container || total === 0) return undefined;

    const measure = () => {
      const nodes = Array.from(ghost.children);
      if (nodes.length < 2) return;
      const widthOf = (node) =>
        node.getBoundingClientRect().width + CHIP_MARGIN;
      const chipWidths = nodes.slice(0, -1).map(widthOf);
      const badgeWidth = widthOf(nodes[nodes.length - 1]);

      const style = window.getComputedStyle(container);
      const available =
        container.clientWidth -
        parseFloat(style.paddingLeft || 0) -
        parseFloat(style.paddingRight || 0) -
        INPUT_RESERVE;

      if (chipWidths.reduce((sum, w) => sum + w, 0) <= available) {
        setVisibleCount(total);
        return;
      }

      // Collapsing costs the badge, so the remaining chips share what is left.
      const budget = available - badgeWidth;
      let used = 0;
      let count = 0;
      for (let i = 0; i < chipWidths.length; i += 1) {
        if (used + chipWidths[i] > budget) break;
        used += chipWidths[i];
        count += 1;
      }
      setVisibleCount(Math.min(Math.max(count, MIN_VISIBLE), total));
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [measureRef, total, selectionKey]);

  return visibleCount;
}

/**
 * Custom ValueContainer that shows as many chips as the row can hold.
 * Chips that do not fit are collapsed into a "+N" badge; clicking it opens
 * a popover listing the hidden items with individual remove buttons.
 */
function TruncatedValueContainer({ children, ...props }) {
  const selected = props.getValue();
  const total = selected.length;
  const measureRef = useRef(null);
  const selectionKey = selected.map((o) => o.label).join('\u0000');
  const visibleCount = useVisibleChipCount(measureRef, total, selectionKey);

  if (total === 0) {
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  }

  // react-select v5: children = [...MultiValue chips, Input element]
  const arr = React.Children.toArray(children);
  const chips = arr.slice(0, -1);
  const input = arr[arr.length - 1]; // Input is always last
  const shown = Math.min(visibleCount, total);
  const hiddenItems = selected.slice(shown);
  const { isDisabled } = props.selectProps;

  const handleRemove = (item) => {
    const newValue = selected.filter((o) => o.value !== item.value);
    props.selectProps.onChange(newValue, {
      action: 'remove-value',
      removedValue: item,
    });
  };

  const popover = (
    <Popover id={`gpsm-more-popover-${props.selectProps.name || 'multi'}`}>
      <Popover.Body className="p-1">
        {hiddenItems.map((item) => (
          <div
            key={item.value}
            className="d-flex align-items-center justify-content-between gap-2 px-1 py-1"
          >
            <span style={{ fontSize: '0.85em' }}>{item.label}</span>
            {!isDisabled && (
              <button
                type="button"
                className="text-dark btn-close"
                style={{ fontSize: '0.6em', flexShrink: 0 }}
                onClick={() => handleRemove(item)}
                aria-label={`Remove ${item.label}`}
              />
            )}
          </div>
        ))}
      </Popover.Body>
    </Popover>
  );

  return (
    <components.ValueContainer {...props}>
      {chips.slice(0, shown)}
      {hiddenItems.length > 0 && (
        <OverlayTrigger
          trigger="click"
          placement="top"
          overlay={popover}
          rootClose
        >
          <Button
            variant="light"
            size="sm"
            style={badgeStyle}
            aria-label={`Show ${hiddenItems.length} more selected item${
              hiddenItems.length === 1 ? '' : 's'
            }`}
          >
            +{hiddenItems.length}
          </Button>
        </OverlayTrigger>
      )}
      {input}
      <div ref={measureRef} style={measureStyle} aria-hidden="true">
        {chips}
        <Button variant="light" size="sm" style={badgeStyle} tabIndex={-1}>
          +{Math.max(total - MIN_VISIBLE, 1)}
        </Button>
      </div>
    </components.ValueContainer>
  );
}

const TRUNCATED_COMPONENTS = { ValueContainer: TruncatedValueContainer };

// Chips keep their natural width on a single row so the measured widths above
// match what is actually rendered.
const multiSelSty = {
  ...frmSelSty,
  valueContainer: (base, state) => ({
    ...frmSelSty.valueContainer(base, state),
    flexWrap: 'nowrap',
  }),
  multiValue: (base, state) => ({
    ...frmSelSty.multiValue(base, state),
    flexShrink: 0,
  }),
};

function GenPropSelectMulti(opt) {
  const {
    field,
    f_obj: fObj,
    options = [],
    onChange,
    isRequired,
    isEditable,
    isSpCall,
    readOnly,
  } = opt;
  const isSUsers = fObj?.option_layers === S_USRS_SRC;

  // Seed initial state from the shared module-level cache so that previously-
  // fetched users are immediately available after a remount (e.g. tab switch).
  const [remoteOptions, setRemoteOptions] = useState(() =>
    isSUsers ? getCachedUserOptions() : [],
  );

  // Resolve any stored sub_field IDs missing from the cache whenever the set of
  // ids changes (incl. mount) so values swapped in after mount don't appear as
  // "(depr.)". Keyed by a stable join of the ids (the array ref changes every
  // render). The fetch is a no-op when ids are already cached or known-invalid.
  const subFieldsKey = (fObj?.sub_fields || []).map((sf) => sf.value).join(',');
  useEffect(() => {
    if (!isSUsers) return;
    fetchMissingUserOptions(
      (fObj?.sub_fields || []).map((sf) => sf.value),
    ).then((fetched) => {
      if (fetched.length > 0) setRemoteOptions(getCachedUserOptions());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subFieldsKey, isSUsers]);
  const klz = fieldCls(isSpCall);
  const selectOpts = useMemo(() => options.map(toOption), [options]);
  let className = isEditable
    ? 'select_generic_properties_editable'
    : 'select_generic_properties_readonly';
  className =
    isRequired && isEditable ? 'select_generic_properties_required' : className;
  const sourceOptions = isSUsers ? remoteOptions : selectOpts;
  const selectedOpts = selectedUserOptions(fObj?.sub_fields, sourceOptions);

  const loadUserOptions = async (inputValue) => {
    const search = inputValue.trim();
    if (search.length < MIN_USER_SEARCH_LENGTH) return [];

    const result = await Api.getUsers({ name: search });
    const fetchedOptions = responseUserOptions(result)
      .map(userToOption)
      .filter((op) => op.value !== '');
    // Write into the shared module-level cache so future remounts can resolve these ids.
    mergeUserOptionsIntoCache(fetchedOptions);
    setRemoteOptions((currentOptions) => {
      const optionMap = new Map(
        [...currentOptions, ...fetchedOptions].map((op) => [op.value, op]),
      );
      return Array.from(optionMap.values());
    });
    return fetchedOptions;
  };

  const selectProps = {
    className,
    components: TRUNCATED_COMPONENTS,
    isClearable: true,
    isMulti: true,
    isDisabled: readOnly,
    menuPlacement: 'auto',
    menuPortalTarget: document.body,
    name: field,
    onChange,
    styles: multiSelSty,
    value: selectedOpts,
  };

  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <span className={klz[1]}>
        {isSUsers ? (
          <AsyncSelect
            {...selectProps}
            cacheOptions
            defaultOptions={false}
            loadOptions={loadUserOptions}
          />
        ) : (
          <Select {...selectProps} options={selectOpts} />
        )}
      </span>
      {isSUsers && <Form.Text muted>{S_USRS_SEARCH_HINT}</Form.Text>}
    </Form.Group>
  );
}

export default GenPropSelectMulti;
