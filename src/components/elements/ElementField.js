/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  InputGroup,
  OverlayTrigger,
  Popover,
  Row,
} from 'react-bootstrap';
import Select from 'react-select';
import { v4 as uuid } from 'uuid';
import { FieldTypes } from 'generic-ui-core';
import ButtonTooltip from '@components/fields/ButtonTooltip';
import { genUnitSup, getFieldProps, frmSelSty } from '@components/tools/utils';
import {
  FieldBase,
  ElementBase,
  SegmentBase,
} from '@components/elements/BaseFields';
import GroupFields from '@components/elements/GroupFields';
import TextFormula from '@components/elements/TextFormula';
import FieldTable from '@ui/tables/FieldTable';
import ConditionFieldBtn from '@components/designer/template/ConditionFieldBtn';
import VocabSaveBtn from '@components/designer/template/VocabSaveBtn';
import FieldBadge from '@components/fields/FieldBadge';
import InputUnit from '@components/fields/InputUnit';
import OntCmp from '@components/fields/OntCmp';
import OntologySelect from '@components/elements/OntologySelect';
import { ButtonOntologySelect } from '@components/fields/ModalOntologySelect';
import {
  // renderDatetimeRange,
  renderAdjust,
  renderBlank,
  renderColWidth,
  renderDummyFieldGroup,
  renderNameField,
  renderNumberField,
  renderNumberInputField,
  renderOwnRow,
  renderRequired,
  renderReadonly,
  renderTextFieldGroup,
  renderTypeField,
} from '@components/elements/Fields';
import PositionDnD from '@components/dnd/PositionDnD';
import DnDs from '@components/dnd/DnDs';
import FIcons from '@components/icons/FIcons';
import FieldActionsBtn from '@components/designer/FieldActionsBtn';
import LLabel from '@components/shared/LLabel';
import Prop from '@components/designer/template/Prop';
import { toNullOrInt } from '@utils/pureUtils';
import Constants from '@components/tools/Constants';
import { S_USRS_SRC, S_USRS_SRC_OPTION } from '@utils/userSelectUtils';

class ElementField extends Component {
  constructor(props) {
    super(props);
    this.state = { parentIsExpanded: props.parentExpand, expandLayers: {} };
    this.handleChange = this.handleChange.bind(this);
    // this.handelDelete = this.handelDelete.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleOntChange = this.handleOntChange.bind(this);
    this.handleUnitChange = this.handleUnitChange.bind(this);
    this.handleAddDummy = this.handleAddDummy.bind(this);
    this.handleAddVoc = this.handleAddVoc.bind(this);
    this.updSubField = this.updSubField.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.toggleExpandLayer = this.toggleExpandLayer.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { parentExpand } = this.props;
    if (prevProps.parentExpand !== parentExpand) {
      this.setState({ parentIsExpanded: parentExpand });
    }
  }

  handleDrop = (_params) => {
    const { onMove } = this.props;
    const { source, target, rid } = _params;
    onMove.onPosition(rid.key, target, source.fid);
  };

  // e: Select event, orig: field type, fe: field, lk: layer key, fc: input change on 'Type', tp: type of input change, e.g. a select, a text, a checkbox, etc.
  handleChange(e, orig, fe, lk, fc, tp) {
    if (
      [
        FieldTypes.F_SELECT,
        FieldTypes.F_SYSTEM_DEFINED,
        FieldTypes.F_SELECT_MULTI,
      ].includes(tp) &&
      e === null
    ) {
      return;
    }
    const { onChange } = this.props;
    const env = e;
    if (fc === 'decimal') {
      env.target.value = toNullOrInt(e.target.value) || 5;
    }
    if (fc === 'min' || fc === 'max') {
      const raw = e.target.value;
      const parsed = parseFloat(raw);
      env.target.value = raw === '' || isNaN(parsed) ? '' : parsed;
    }
    onChange(env, orig, fe, lk, fc, tp);
  }

  handleMove(_params) {
    const { onMove } = this.props;
    const { l, f, isUp } = _params;
    onMove.onField(l, f, isUp);
  }

  handleOntChange(_params) {
    const { field: fieldObject, layer } = this.props;
    this.handleChange(
      { value: _params?.data },
      fieldObject.field,
      fieldObject.field,
      layer.key,
      'ontology', // 'field',
      FieldTypes.F_SELECT, // 'Ontology' // 'text'
    );
  }

  handleUnitChange(_params) {
    const { field: fieldObject, layer } = this.props;
    this.handleChange(
      { value: _params?.data },
      fieldObject.field,
      fieldObject.field,
      layer.key,
      'value_system', // 'field',
      FieldTypes.F_SYSTEM_DEFINED,
    );
  }

  handleAddDummy(_params) {
    const { onDummyAdd } = this.props;
    onDummyAdd(_params);
  }

  handleAddVoc(_params) {
    this.handleChange(_params);
  }

  // Toggle function to handle expand/collapse
  toggleExpandLayer = (layerKey) => {
    this.setState((prev) => ({
      expandLayers: {
        ...prev.expandLayers,
        [layerKey]: !prev.expandLayers[layerKey],
      },
    }));
  };

  updSubField(layerKey, field, cb) {
    const { onFieldSubFieldChange } = this.props;
    onFieldSubFieldChange(layerKey, field, cb);
  }

  // handelDelete(delStr, delKey, delRoot) {
  //   const { onDelete } = this.props;
  //   onDelete(delStr, delKey, delRoot);
  // }

  availableUnits(val) {
    const { unitsSystem } = this.props;
    const us = unitsSystem.find((e) => e.field === val);
    if (us === undefined) return null;
    const tbl = us.units.map((e) => (
      <div key={uuid()}>
        {genUnitSup(e.label)}
        <br />
      </div>
    ));
    const popover = (
      <Popover id="popover-positioned-scrolling-left">
        <Popover.Header as="h3">Available units</Popover.Header>
        <Popover.Body>{tbl}</Popover.Body>
      </Popover>
    );
    return (
      <OverlayTrigger
        animation
        placement="top"
        root
        trigger={['hover', 'focus', 'click']}
        overlay={popover}
      >
        <Button variant="success" size="sm">
          {FIcons.faTableCells}
        </Button>
      </OverlayTrigger>
    );
  }

  renderComponent() {
    const {
      unitsSystem,
      field: fieldObject,
      layer,
      layerKey,
      genericType,
      allLayers,
      select_options: selections,
      position,
      generic,
      onDelete,
      vocabularies,
    } = this.props;
    const { parentIsExpanded, expandLayers } = this.state;
    const isExpanded = parentIsExpanded && (expandLayers[layerKey] || false);

    const metadata = generic?.metadata || {};
    const groups = metadata.groups || [];

    // Get data for restriction
    const groupedLayerKeys = groups.flatMap((group) => group.layers || []);
    const currentLayerGroup = groups.find((group) =>
      (group.layers || []).includes(layerKey),
    );
    const sameGroupLayerKeys = currentLayerGroup?.layers || null;

    const unitConfig = unitsSystem.map((_c) => ({
      value: _c.field,
      name: _c.label,
      label: _c.label,
    }));
    let typeOpts = FieldBase;
    if (genericType === 'Element') {
      typeOpts = ElementBase;
    } else if (genericType === 'Segment') {
      typeOpts = SegmentBase;
    }
    typeOpts.sort((a, b) => a.label.localeCompare(b.label));
    const f = fieldObject;

    // Legacy backfill: pin the existing default unit as the formula base unit
    // for templates created before `value_system_base` existed, so they get
    // migrated when next opened in the designer.
    if (
      f.type === FieldTypes.F_SYSTEM_DEFINED &&
      f.value_system &&
      !f.value_system_base
    ) {
      f.value_system_base = f.value_system;
    }

    // Transform to expected format
    const selectOptionsArray = Object.keys(selections || {}).map((key) => ({
      value: key,
      name: key,
      label: key,
    }));

    const sUsersOption = S_USRS_SRC_OPTION;
    const selectOptionsOpts = [
      FieldTypes.F_SELECT,
      FieldTypes.F_SELECT_MULTI,
    ].includes(f.type)
      ? [sUsersOption, ...selectOptionsArray]
      : unitConfig;
    const selectOptionsVal =
      selectOptionsOpts?.find((o) => o.value === f.option_layers) || null;
    const selectOptions = [
      FieldTypes.F_SYSTEM_DEFINED,
      FieldTypes.F_SELECT,
      FieldTypes.F_SELECT_MULTI,
    ].includes(f.type) ? (
      <>
        <Form.Group as={Col}>
          {[FieldTypes.F_SELECT, FieldTypes.F_SELECT_MULTI].includes(f.type) ? (
            <LLabel>
              <>
                {getFieldProps('options').label}&nbsp;
                {getFieldProps('options').fieldTooltip}
              </>
            </LLabel>
          ) : (
            <LLabel>
              <>{getFieldProps('si').label}</>
            </LLabel>
          )}
          <div style={{ display: 'flex' }}>
            <span style={{ width: '100%' }}>
              <Select
                styles={frmSelSty}
                name={f.field}
                multi={false}
                options={selectOptionsOpts}
                value={selectOptionsVal}
                onChange={(event) =>
                  this.handleChange(
                    event,
                    f.option_layers,
                    f.field,
                    layerKey,
                    'option_layers',
                    f.type,
                  )
                }
                formatOptionLabel={(option) =>
                  option.value === S_USRS_SRC ? (
                    <span className="fst-italic">
                      <span>(from system)</span>
                      &nbsp;
                      {option.label}
                    </span>
                  ) : (
                    option.label
                  )
                }
                menuPlacement="auto"
                menuPortalTarget={document.body}
              />
            </span>
          </div>
        </Form.Group>
        {[FieldTypes.F_SELECT, FieldTypes.F_SELECT_MULTI].includes(
          f.type,
        ) ? null : (
          <Form.Group as={Col} xs={2}>
            <InputUnit fObj={f} fnUnitChange={this.handleUnitChange} />
          </Form.Group>
        )}
      </>
    ) : null;

    const groupOptions = [FieldTypes.F_INPUT_GROUP].includes(f.type) ? (
      <Row className="mb-1">
        <Form.Group as={Col}>
          <GroupFields
            layerKey={layerKey}
            field={f}
            updSub={this.updSubField}
            unitsFields={unitsSystem}
            panelIsExpanded={isExpanded}
          />
        </Form.Group>
      </Row>
    ) : null;

    const tableOptions = [FieldTypes.F_TABLE].includes(f.type) ? (
      <Row className="mb-1">
        <Form.Group as={Col}>
          <FieldTable
            genericType={genericType}
            layerKey={layerKey}
            field={f}
            updSub={this.updSubField}
            unitsFields={unitsSystem}
            selectOptions={selectOptionsArray}
            panelIsExpanded={isExpanded}
          />
          <InputGroup>
            <InputGroup.Text>Tables per row</InputGroup.Text>
            <Form.Control
              name={`frmPerRow_${layer.key}_f_${fieldObject.field}`}
              as="select"
              defaultValue={f.cols || 1}
              onChange={(event) =>
                this.handleChange(
                  event,
                  f.cols,
                  f.field,
                  layerKey,
                  'cols',
                  f.cols,
                )
              }
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </Form.Control>
          </InputGroup>
        </Form.Group>
      </Row>
    ) : null;

    const textFormula = [FieldTypes.F_TEXT_FORMULA].includes(f.type) ? (
      <Row className="mb-1">
        <Form.Group as={Col}>
          <TextFormula
            layerKey={layerKey}
            field={f}
            updSub={this.updSubField}
            allLayers={allLayers}
            panelIsExpanded={isExpanded}
          />
        </Form.Group>
      </Row>
    ) : null;

    const ontologySelectOptions = [FieldTypes.F_ONTOLOGY_SELECT].includes(
      f.type,
    ) ? (
      <Row className="mb-1">
        <Form.Group as={Col}>
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              name={`f_ontology_term_${f.field}`}
              value={f.ontology_term?.label || f.ontology_term || ''}
              className="me-2"
              readOnly
              disabled // Add the disabled prop on an input to give it a grayed out appearance and remove pointer events.
              placeholder="Select an ontology term"
            />
            <ButtonOntologySelect
              modalComponent={
                <OntologySelect
                  fnSelected={(selected) => {
                    if (selected) {
                      this.handleChange(
                        {
                          target: {
                            value: {
                              value: selected.value,
                              label: selected.data?.label || selected.value,
                            },
                          },
                        },
                        f.ontology_term,
                        f.field,
                        layerKey,
                        'ontology_term',
                        FieldTypes.F_TEXT,
                      );
                    }
                  }}
                  defaultValue={f.ontology_term || null}
                />
              }
              customClass={f.ontology_term ? 'gu-ontology-selected' : null}
            />
          </div>
        </Form.Group>
      </Row>
    ) : null;

    const fieldHeader = (
      <span className="flex-grow-1">
        <span className="fw-bold">
          {position}{' '}
          {[FieldTypes.F_DUMMY].includes(f.type) ? '(dummy field)' : f.label}
        </span>
        <FieldBadge fieldObj={f} prop="field" />
        {OntCmp(fieldObject.ontology, '!link')}
        <FieldBadge fieldObj={f} prop="type" />
        <FieldBadge fieldObj={f} prop="cols" />
      </span>
    );

    const fieldHeaderButtons = (
      <div onClick={(e) => e.stopPropagation()}>
        {genericType !== Constants.GENERIC_TYPES.DATASET && (
          <ButtonGroup className="me-2">
            <VocabSaveBtn
              field={fieldObject}
              data={generic}
              layer={layer}
              genericType={genericType}
            />
          </ButtonGroup>
        )}
        <ButtonGroup>
          <ButtonTooltip
            idf="mv_up"
            fnClick={this.handleMove}
            element={{ l: layerKey, f: f.field, isUp: true }}
            fa="faArrowUp"
            place="top"
            disabled={position === 1}
          />
          <ButtonTooltip
            idf="mv_down"
            fnClick={this.handleMove}
            element={{ l: layerKey, f: f.field, isUp: false }}
            fa="faArrowDown"
            place="top"
          />
          <ConditionFieldBtn
            field={f}
            fnUpdateSub={this.updSubField}
            layer={layer}
            sortedLayers={allLayers}
            groupedLayerKeys={groupedLayerKeys}
            sameGroupLayerKeys={sameGroupLayerKeys}
            selectOptions={selections || {}}
            as="button"
            // disabled={f.required === true || f.required === 'true'}
            disabled={false} // for testing
          />
          <FieldActionsBtn
            field={f}
            layerKey={layerKey}
            generic={generic}
            onDummyAdd={this.handleAddDummy}
            onDelete={onDelete}
          />
        </ButtonGroup>
      </div>
    );

    const dnd = (
      <PositionDnD
        key={`_drag_${DnDs.LAYER_FIELD}_${f.field}_${layer.key}`}
        type={`${DnDs.LAYER_FIELD}_${layer.key}`}
        field={{ field: f.field }}
        rowValue={{ key: layer.key }}
        isButton={false}
      />
    );

    const customHeader = (
      <>
        {fieldHeader}
        {fieldHeaderButtons}
      </>
    );

    return (
      <div>
        {/* <Card className="border-0 border-top gu-square-corners"> */}
        <Card className="border-0 gu-square-corners">
          <Card.Body className="p-0">
            <Prop
              key={`_prop_content_${f.field}_${layerKey}`}
              layerKey={`${f.field}_${layerKey}`}
              toggleExpand={this.toggleExpandLayer}
              propHeader={customHeader}
              unmountCollapsed
            >
              <Form>
                <Row className="mb-1">
                  {renderNameField({
                    layer,
                    fieldObject,
                    field: 'field',
                    fnChange: this.handleChange,
                    fnOntChange: this.handleOntChange,
                  })}
                  {renderTextFieldGroup({
                    layer,
                    fieldObject,
                    field: 'label',
                    fnChange: this.handleChange,
                  })}
                  {renderDummyFieldGroup({ fieldObject })}
                </Row>
                <Row className="mb-1">
                  {renderTextFieldGroup({
                    layer,
                    fieldObject,
                    field: 'description',
                    fnChange: this.handleChange,
                    xs: 6,
                  })}
                  {renderColWidth({
                    layer,
                    fieldObject,
                    field: 'cols',
                    fnChange: this.handleChange,
                  })}
                  {renderOwnRow({
                    layer,
                    fieldObject,
                    fnChange: this.handleChange,
                  })}
                </Row>
                <Row className="mb-1">
                  {renderTypeField({
                    layer,
                    fieldObject,
                    fnChange: this.handleChange,
                    typeOpts,
                    xs: [
                      FieldTypes.F_SELECT,
                      FieldTypes.F_SYSTEM_DEFINED,
                      FieldTypes.F_SELECT_MULTI,
                    ].includes(f.type)
                      ? undefined
                      : undefined,
                  })}
                </Row>
                {[
                  FieldTypes.F_SELECT,
                  FieldTypes.F_SYSTEM_DEFINED,
                  FieldTypes.F_SELECT_MULTI,
                ].includes(f.type) && (
                  <Row className="mb-1">{selectOptions}</Row>
                )}
                {[FieldTypes.F_FORMULA_FIELD].includes(f.type) ? (
                  <Row className="mb-1">
                    {renderTextFieldGroup({
                      layer,
                      fieldObject,
                      field: 'formula',
                      fnChange: this.handleChange,
                      xs: 8,
                    })}
                    {renderNumberField({
                      layer,
                      fieldObject,
                      field: 'decimal',
                      fnChange: this.handleChange,
                      xs: 2,
                    })}
                    {renderAdjust({
                      layer,
                      fieldObject,
                      fnChange: this.handleChange,
                      xs: 2,
                    })}
                  </Row>
                ) : null}
                {groupOptions}
                {/* {renderDatetimeRange({ fieldObject })} */}
                {tableOptions}
                {textFormula}
                {ontologySelectOptions}
                {[FieldTypes.F_INTEGER, FieldTypes.F_TEXT].includes(f.type) && (
                  <>
                    <Row className="mb-1">
                      {renderTextFieldGroup({
                        layer,
                        fieldObject,
                        field: 'placeholder',
                        fnChange: this.handleChange,
                        xs: undefined,
                      })}
                    </Row>
                    <Row className="mb-1">
                      {renderReadonly({
                        layer,
                        fieldObject,
                        fnChange: this.handleChange,
                      })}
                      {['Element'].includes(genericType)
                        ? renderRequired({
                            layer,
                            fieldObject,
                            fnChange: this.handleChange,
                            xs: 6,
                          })
                        : renderBlank()}
                    </Row>
                  </>
                )}
                {[FieldTypes.F_NUMBER].includes(f.type) && (
                  <>
                    <Row className="mb-1">
                      {renderNumberInputField({
                        layer,
                        fieldObject,
                        field: 'decimals',
                        fnChange: this.handleChange,
                        xs: 4,
                      })}
                      {renderNumberInputField({
                        layer,
                        fieldObject,
                        field: 'min',
                        fnChange: this.handleChange,
                        xs: 4,
                      })}
                      {renderNumberInputField({
                        layer,
                        fieldObject,
                        field: 'max',
                        fnChange: this.handleChange,
                        xs: 4,
                      })}
                    </Row>
                    <Row className="mb-1">
                      {renderTextFieldGroup({
                        layer,
                        fieldObject,
                        field: 'placeholder',
                        fnChange: this.handleChange,
                        xs: undefined,
                      })}
                    </Row>
                    <Row className="mb-1">
                      {renderReadonly({
                        layer,
                        fieldObject,
                        fnChange: this.handleChange,
                      })}
                      {['Element'].includes(genericType)
                        ? renderRequired({
                            layer,
                            fieldObject,
                            fnChange: this.handleChange,
                            xs: 6,
                          })
                        : renderBlank()}
                    </Row>
                  </>
                )}
              </Form>
            </Prop>
          </Card.Body>
        </Card>
      </div>
    );
  }

  render() {
    return (
      <Col md={12} className="ps-0">
        {this.renderComponent()}
      </Col>
    );
  }
}

ElementField.propTypes = {
  genericType: PropTypes.string, // PropTypes.arrayOf(PropTypes.object),
  layer: PropTypes.object.isRequired,
  layerKey: PropTypes.string.isRequired,
  select_options: PropTypes.object,
  position: PropTypes.number.isRequired,
  field: PropTypes.object.isRequired,
  onMove: PropTypes.shape({
    onField: PropTypes.func.isRequired,
    onPosition: PropTypes.func.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  unitsSystem: PropTypes.array,
  onFieldSubFieldChange: PropTypes.func.isRequired,
  onDummyAdd: PropTypes.func.isRequired,
  vocabularies: PropTypes.array,
  parentExpand: PropTypes.bool,
};

ElementField.defaultProps = {
  genericType: 'Element',
  unitsSystem: [],
  vocabularies: [],
  parentExpand: false,
  select_options: {},
};

export default ElementField;
