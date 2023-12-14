/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Button,
  Popover,
  Col,
  Checkbox,
  Panel,
  Form,
  ButtonGroup,
  OverlayTrigger,
  FormGroup,
  FormControl,
  InputGroup,
} from 'react-bootstrap';
import Select from 'react-select';
import { v4 as uuid } from 'uuid';
import { FieldTypes } from 'generic-ui-core';
import ButtonTooltip from '../fields/ButtonTooltip';
import { genUnitSup, toBool, toNullOrInt } from '../tools/utils';
import { FieldBase, ElementBase, SegmentBase } from './BaseFields';
import GroupFields from './GroupFields';
import TextFormula from './TextFormula';
import TableDef from './TableDef';
import ConditionFieldBtn from '../designer/template/ConditionFieldBtn';
import TermLink from '../fields/TermLink';
import {
  renderDatetimeRange,
  renderDummyFieldGroup,
  renderNameField,
  renderTextFieldGroup,
  renderOwnRow,
  renderRequired,
  renderReadonly,
} from './Fields';

class ElementField extends Component {
  constructor(props) {
    super(props);
    this.state = { panelIsExpanded: false };
    this.handleChange = this.handleChange.bind(this);
    this.handelDelete = this.handelDelete.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleOntChange = this.handleOntChange.bind(this);
    this.handleAddDummy = this.handleAddDummy.bind(this);
    this.updSubField = this.updSubField.bind(this);
    this.handlePanelToggle = this.handlePanelToggle.bind(this);
  }

  handlePanelToggle = () => {
    this.setState(prevState => {
      return {
        panelIsExpanded: !prevState.panelIsExpanded,
      };
    });
  };

  handleChange(e, orig, fe, lk, fc, tp) {
    if (
      (tp === FieldTypes.F_SELECT || tp === FieldTypes.F_SYSTEM_DEFINED) &&
      e === null
    ) {
      return;
    }
    const env = e;
    if (fc === 'decimal') {
      env.target.value = toNullOrInt(e.target.value) || 5;
    }
    this.props.onChange(env, orig, fe, lk, fc, tp);
  }

  handleMove(_params) {
    const { l, f, isUp } = _params;
    this.props.onMove(l, f, isUp);
  }

  handleOntChange(_params) {
    const { field: fieldObject, layer } = this.props;
    this.handleChange(
      { value: _params?.data },
      fieldObject['field'],
      fieldObject.field,
      layer.key,
      'ontology', // 'field',
      'select' // 'Ontology' // 'text'
    );
  }

  handleAddDummy(_params) {
    this.props.onDummyAdd(_params);
  }

  updSubField(layerKey, field, cb) {
    this.props.onFieldSubFieldChange(layerKey, field, cb);
  }

  handelDelete(delStr, delKey, delRoot) {
    this.props.onDelete(delStr, delKey, delRoot);
  }

  availableUnits(val) {
    const { unitsSystem } = this.props;
    const us = unitsSystem.find(e => e.field === val);
    if (us === undefined) return null;
    const tbl = us.units.map(e => (
      <div key={uuid()}>
        {genUnitSup(e.label)}
        <br />
      </div>
    ));
    const popover = (
      <Popover id="popover-positioned-scrolling-left">
        <b>
          <u>available units</u>
        </b>
        <br />
        {tbl}
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
        <Button bsSize="xs">
          <i className="fa fa-table" aria-hidden="true" />
        </Button>
      </OverlayTrigger>
    );
  }

  renderDeleteButton(delStr, delKey, delRoot) {
    const msg = `remove this field: [${delKey}] from layer [${delRoot}] `;
    const popover = (
      <Popover id="popover-positioned-scrolling-left">
        {msg} <br />
        <div className="btn-toolbar">
          <Button
            bsSize="xsmall"
            bsStyle="danger"
            onClick={() => this.handelDelete(delStr, delKey, delRoot)}
          >
            Yes
          </Button>
          <span>&nbsp;&nbsp;</span>
          <Button bsSize="xsmall" bsStyle="warning" onClick={this.handleClick}>
            No
          </Button>
        </div>
      </Popover>
    );

    return (
      <OverlayTrigger
        animation
        placement="top"
        root
        trigger="focus"
        overlay={popover}
      >
        <Button bsSize="xs">
          <i className="fa fa-trash-o" aria-hidden="true" />
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
      select_options,
    } = this.props;
    const { panelIsExpanded } = this.state;
    const unitConfig = unitsSystem.map(_c => {
      return {
        value: _c.field,
        name: _c.label,
        label: _c.label,
      };
    });
    let typeOpts = FieldBase;
    if (genericType === 'Element') {
      typeOpts = ElementBase;
    } else if (genericType === 'Segment') {
      typeOpts = SegmentBase;
    }
    typeOpts.sort((a, b) => a.value.localeCompare(b.value));
    const f = fieldObject;
    const formulaField =
      f.type === FieldTypes.F_FORMULA_FIELD ? (
        <FormGroup className="gu-form-group">
          <Col sm={3}>
            <span className="gu-form-group-label">Formula</span>
          </Col>
          <Col sm={9}>
            <div style={{ display: 'flex' }}>
              <span style={{ width: '100%' }}>
                <FormControl
                  type="text"
                  name="f_label"
                  defaultValue={f.formula}
                  onChange={event =>
                    this.handleChange(
                      event,
                      f.label,
                      f.field,
                      layerKey,
                      'formula',
                      'text'
                    )
                  }
                />
              </span>
            </div>
          </Col>
        </FormGroup>
      ) : (
        <div />
      );
    const selectOptionsOpts =
      f.type === FieldTypes.F_SELECT ? select_options : unitConfig;
    const selectOptionsVal =
      selectOptionsOpts?.find(o => o.value === f.option_layers) || undefined;
    const selectOptions =
      f.type === FieldTypes.F_SELECT ||
      f.type === FieldTypes.F_SYSTEM_DEFINED ? (
        <FormGroup className="gu-form-group">
          <Col sm={3}>
            <span className="gu-form-group-label">
              {f.type === FieldTypes.F_SELECT ? 'Options' : ' '}
            </span>
          </Col>
          <Col sm={9}>
            <div style={{ display: 'flex' }}>
              <span style={{ width: '100%' }}>
                <Select
                  styles={{
                    menuPortal: base => {
                      return { ...base, zIndex: 9999 };
                    },
                    menu: base => {
                      return { ...base, zIndex: 9999 };
                    },
                  }}
                  name={f.field}
                  multi={false}
                  options={selectOptionsOpts}
                  value={selectOptionsVal}
                  onChange={event =>
                    this.handleChange(
                      event,
                      f.option_layers,
                      f.field,
                      layerKey,
                      'option_layers',
                      f.type
                    )
                  }
                />
              </span>
              {f.type === FieldTypes.F_SELECT
                ? null
                : this.availableUnits(f.option_layers)}
            </div>
          </Col>
        </FormGroup>
      ) : (
        <div />
      );
    const groupOptions = [FieldTypes.F_INPUT_GROUP].includes(f.type) ? (
      <FormGroup className="gu-form-group">
        <Col sm={3}>
          <span className="gu-form-group-label">&nbsp;</span>
        </Col>
        <Col sm={9}>
          <GroupFields
            layerKey={layerKey}
            field={f}
            updSub={this.updSubField}
            unitsFields={unitsSystem}
            panelIsExpanded={panelIsExpanded}
          />
        </Col>
      </FormGroup>
    ) : null;
    const tableOptions = [FieldTypes.F_TABLE].includes(f.type) ? (
      <FormGroup className="gu-form-group">
        <Col sm={3}>
          <span className="gu-form-group-label">&nbsp;</span>
        </Col>
        <Col sm={9}>
          <TableDef
            genericType={genericType}
            layerKey={layerKey}
            field={f}
            updSub={this.updSubField}
            unitsFields={unitsSystem}
            selectOptions={select_options || []}
            panelIsExpanded={panelIsExpanded}
          />
          <InputGroup>
            <InputGroup.Addon>Tables per row</InputGroup.Addon>
            <FormControl
              name={`frmPerRow_${layer.key}_f_${fieldObject.field}`}
              componentClass="select"
              defaultValue={f.cols || 1}
              onChange={event =>
                this.handleChange(
                  event,
                  f.cols,
                  f.field,
                  layerKey,
                  'cols',
                  f.cols
                )
              }
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </FormControl>
          </InputGroup>
        </Col>
      </FormGroup>
    ) : null;
    const textFormula = [FieldTypes.F_TEXT_FORMULA].includes(f.type) ? (
      <FormGroup className="gu-form-group">
        <Col sm={3}>
          <span className="gu-form-group-label">&nbsp;</span>
        </Col>
        <Col sm={9}>
          <TextFormula
            layerKey={layerKey}
            field={f}
            updSub={this.updSubField}
            allLayers={allLayers}
            panelIsExpanded={panelIsExpanded}
          />
        </Col>
      </FormGroup>
    ) : null;
    return (
      <div>
        <Panel>
          <Panel.Heading className="template_panel_heading">
            <Panel.Title toggle onClick={this.handlePanelToggle}>
              {this.props.position}&nbsp;
              {[FieldTypes.F_DUMMY].includes(f.type)
                ? '(dummy field)'
                : f.label}
              &nbsp;
              <Badge className="bg-bs-field-display">{f.field || ''}</Badge>
              &nbsp;
              <Badge className="bg-bs-field-display">{f.type || ''}</Badge>
              {TermLink(fieldObject.ontology)}
            </Panel.Title>
            <ButtonGroup bsSize="xsmall">
              <ConditionFieldBtn
                field={f}
                fnUpdateSub={this.updSubField}
                layer={layer}
                sortedLayers={allLayers}
              />
              <ButtonTooltip
                tip="Move Up"
                fnClick={this.handleMove}
                element={{ l: layerKey, f: f.field, isUp: true }}
                fa="fa-arrow-up"
                place="top"
                disabled={this.props.position === 1}
              />
              <ButtonTooltip
                tip="Move Down"
                fnClick={this.handleMove}
                element={{ l: layerKey, f: f.field, isUp: false }}
                fa="fa-arrow-down"
                place="top"
              />
              {this.renderDeleteButton('Field', f.field, layerKey)}
              <ButtonTooltip
                tip="Add Dummy field"
                fnClick={this.handleAddDummy}
                element={{ layerKey, field: f.field }}
                fa="fa fa-plus-circle"
                place="top"
              />
            </ButtonGroup>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              <Form horizontal className="default_style">
                {renderDummyFieldGroup({ layer, fieldObject })}
                {renderNameField({
                  layer,
                  fieldObject,
                  label: 'Field Name',
                  field: 'field',
                  fnChange: this.handleChange,
                  fnOntChange: this.handleOntChange,
                })}
                {renderTextFieldGroup({
                  layer,
                  fieldObject,
                  label: 'Display Name',
                  field: 'label',
                  fnChange: this.handleChange,
                })}
                {renderTextFieldGroup({
                  layer,
                  fieldObject,
                  label: 'Hover Info',
                  field: 'description',
                  fnChange: this.handleChange,
                })}
                {renderOwnRow({
                  layer,
                  fieldObject,
                  fnChange: this.handleChange,
                })}
                {[FieldTypes.F_DUMMY, FieldTypes.F_FORMULA_FIELD].includes(
                  f.type
                ) ? null : (
                  <FormGroup className="gu-form-group">
                    <Col sm={3}>
                      <span className="gu-form-group-label">Type</span>
                    </Col>
                    <Col sm={9}>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '100%' }}>
                          <Select
                            styles={{
                              menuPortal: base => {
                                return { ...base, zIndex: 9999 };
                              },
                              menu: base => {
                                return { ...base, zIndex: 9999 };
                              },
                            }}
                            name={f.field}
                            multi={false}
                            options={typeOpts}
                            value={typeOpts?.find(o => o.value === f.type)}
                            onChange={event =>
                              this.handleChange(
                                event,
                                f.type,
                                f.field,
                                layerKey,
                                'type',
                                'select'
                              )
                            }
                          />
                        </span>
                      </div>
                    </Col>
                  </FormGroup>
                )}
                {[FieldTypes.F_FORMULA_FIELD].includes(f.type) ? (
                  <FormGroup className="gu-form-group">
                    <Col sm={3}>
                      <span className="gu-form-group-label">Type</span>
                    </Col>
                    <Col sm={3}>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '100%' }}>
                          <Select
                            styles={{
                              menuPortal: base => {
                                return { ...base, zIndex: 9999 };
                              },
                              menu: base => {
                                return { ...base, zIndex: 9999 };
                              },
                            }}
                            name={f.field}
                            multi={false}
                            options={typeOpts}
                            value={typeOpts?.find(o => o.value === f.type)}
                            onChange={event =>
                              this.handleChange(
                                event,
                                f.type,
                                f.field,
                                layerKey,
                                'type',
                                'select'
                              )
                            }
                          />
                        </span>
                      </div>
                    </Col>
                    <Col sm={1}>
                      <span className="gu-form-group-label">Decimal</span>
                    </Col>
                    <Col sm={2}>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '100%' }}>
                          <FormControl
                            name={`frmDecimal_${layer.key}_f_${fieldObject.field}`}
                            type="number"
                            value={f.decimal}
                            onChange={event =>
                              this.handleChange(
                                event,
                                f.label,
                                f.field,
                                this.props.layerKey,
                                'decimal',
                                'text'
                              )
                            }
                            min={1}
                          />
                        </span>
                      </div>
                    </Col>
                    <Col sm={2}>
                      <span className="gu-form-group-label">Can adjust?</span>
                    </Col>
                    <Col sm={1}>
                      <Checkbox
                        name={`frmChk_${layer.key}_f_${fieldObject.field}`}
                        checked={toBool(f.canAdjust)}
                        onChange={event =>
                          this.handleChange(
                            event,
                            toBool(f.canAdjust),
                            f.field,
                            layerKey,
                            'canAdjust',
                            'checkbox'
                          )
                        }
                      />
                    </Col>
                  </FormGroup>
                ) : null}
                {renderDatetimeRange({ fieldObject })}
                {groupOptions}
                {tableOptions}
                {selectOptions}
                {formulaField}
                {textFormula}
                {['Element'].includes(genericType)
                  ? renderRequired({
                      layer,
                      fieldObject,
                      fnChange: this.handleChange,
                    })
                  : null}
                {renderReadonly({
                  layer,
                  fieldObject,
                  fnChange: this.handleChange,
                })}
                {[FieldTypes.F_INTEGER, FieldTypes.F_TEXT].includes(f.type)
                  ? renderTextFieldGroup({
                      layer,
                      fieldObject,
                      label: 'Placeholder',
                      field: 'placeholder',
                      fnChange: this.handleChange,
                    })
                  : null}
              </Form>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
      </div>
    );
  }

  render() {
    return <Col md={12}>{this.renderComponent()}</Col>;
  }
}

ElementField.propTypes = {
  genericType: PropTypes.string, // PropTypes.arrayOf(PropTypes.object),
  layer: PropTypes.object.isRequired,
  layerKey: PropTypes.string.isRequired,
  select_options: PropTypes.array.isRequired,
  position: PropTypes.number.isRequired,
  field: PropTypes.object.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  unitsSystem: PropTypes.array,
  onFieldSubFieldChange: PropTypes.func.isRequired,
  onDummyAdd: PropTypes.func.isRequired,
};

ElementField.defaultProps = { genericType: 'Element', unitsSystem: [] };

export default ElementField;
