/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  InputGroup,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap';
import { round } from 'lodash';
import moment from 'moment';
import 'moment-precise-range-plugin';
import { genUnit, genUnits, unitConversion } from 'generic-ui-core';
import { genUnitSup } from '../tools/utils';
import GenericSubField from '../models/GenericSubField';

const DateTimeRangeFields = [
  'timeStart',
  'timeStop',
  'durationCalc',
  'duration',
];
const MomentUnit = {
  d: 'days',
  h: 'hours',
  min: 'minutes',
  s: 'seconds',
};

const DateTimeRange = props => {
  const { layer, opt, onInputChange } = props;
  const timePlaceholder = 'DD/MM/YYYY hh:mm:ss';

  let subFields = opt.f_obj.sub_fields || [];
  if (subFields.length < 1) {
    subFields = DateTimeRangeFields.map(e => {
      if (e === 'duration') {
        return new GenericSubField({
          type: 'text',
          value: '',
          col_name: e,
          option_layers: 'duration',
          value_system: 'd',
        });
      }
      return new GenericSubField({ type: 'text', value: '', col_name: e });
    });
  }
  const timeStart = subFields.find(f => f.col_name === 'timeStart') || '';
  const timeStop = subFields.find(f => f.col_name === 'timeStop') || '';
  const duration = subFields.find(f => f.col_name === 'duration') || '';

  const durationDiff = (startAt, stopAt, precise = false) => {
    if (startAt && stopAt) {
      const start = moment(startAt, 'DD-MM-YYYY HH:mm:ss');
      const stop = moment(stopAt, 'DD-MM-YYYY HH:mm:ss');
      if (start < stop) {
        return precise
          ? moment.preciseDiff(start, stop)
          : moment.duration(stop.diff(start));
      }
    }
    return '';
  };

  const highestUnitFromDuration = (d, threshold = 1.0) => {
    if (d.asDays() >= threshold) {
      return 'd';
    }
    if (d.asHours() >= threshold) {
      return 'h';
    }
    if (d.asMinutes() >= threshold) {
      return 'min';
    }
    if (d.asSeconds() >= threshold) {
      return 's';
    }
    return 'h';
  };

  const dataChange = params => {
    const { field, event } = params;
    if (event === 'setCurrent') {
      const currentTime = new Date()
        .toLocaleString('en-GB')
        .split(', ')
        .join(' ');
      subFields.find(f => f.col_name === field).value = currentTime;
    } else if (event === 'changeUnit') {
      const sub = subFields.find(f => f.col_name === field);
      const units = genUnits('duration');
      let uIdx = units.findIndex(u => u.key === sub.value_system);
      if (uIdx < units.length - 1) uIdx += 1;
      else uIdx = 0;
      sub.value_system = units.length > 0 ? units[uIdx].key : '';
      sub.value = unitConversion('duration', sub.value_system, sub.value);
    } else if (event === 'copyTo') {
      const calDiff = durationDiff(timeStart.value, timeStop.value);
      if (calDiff) {
        const highestUnit = highestUnitFromDuration(calDiff);
        const sub = subFields.find(f => f.col_name === field);
        sub.value_system = highestUnit;
        sub.value = round(calDiff.as(MomentUnit[highestUnit]), 1);
      }
    } else {
      const { value } = event.target;
      subFields.find(f => f.col_name === field).value = value;
    }
    onInputChange({
      field: opt.f_obj.field,
      layer: layer.key,
      subFields,
      type: opt.f_obj.type,
    });
  };

  const calc = durationDiff(timeStart.value, timeStop.value, true);

  return (
    <Row>
      <Col sm={12} md={3} lg={3}>
        <FormGroup>
          <ControlLabel>Start</ControlLabel>
          <InputGroup>
            <FormControl
              type="text"
              value={timeStart.value}
              placeholder={timePlaceholder}
              onChange={event => dataChange({ field: 'timeStart', event })}
            />
            <InputGroup.Button>
              <Button
                active
                style={{ padding: '6px' }}
                onClick={() =>
                  dataChange({ field: 'timeStart', event: 'setCurrent' })
                }
              >
                <i className="fa fa-clock-o" aria-hidden="true" />
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </Col>
      <Col sm={12} md={3} lg={3}>
        <FormGroup>
          <ControlLabel>Stop</ControlLabel>
          <InputGroup>
            <FormControl
              type="text"
              value={timeStop.value}
              placeholder={timePlaceholder}
              onChange={event => dataChange({ field: 'timeStop', event })}
            />
            <InputGroup.Button>
              <Button
                active
                style={{ padding: '6px' }}
                onClick={() =>
                  dataChange({ field: 'timeStop', event: 'setCurrent' })
                }
              >
                <i className="fa fa-clock-o" aria-hidden="true" />
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </Col>
      <Col sm={12} md={3} lg={3}>
        <FormGroup>
          <ControlLabel>Duration</ControlLabel>
          <InputGroup>
            <FormControl
              type="text"
              value={calc}
              disabled
              placeholder="Duration"
            />
            <InputGroup.Button>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="copy_duration_to_clipboard">
                    copy to clipboard
                  </Tooltip>
                }
              >
                <Button
                  active
                  onClick={() => {
                    navigator.clipboard.writeText(calc);
                  }}
                >
                  <i className="fa fa-clipboard" aria-hidden="true" />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="copy_durationCalc_to_duration">
                    use this duration
                    <br />
                    (rounded to precision 1)
                  </Tooltip>
                }
              >
                <Button
                  active
                  className="clipboardBtn"
                  onClick={() =>
                    dataChange({ field: 'duration', event: 'copyTo' })
                  }
                >
                  <i className="fa fa-arrow-right" aria-hidden="true" />
                </Button>
              </OverlayTrigger>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </Col>
      <Col sm={12} md={3} lg={3}>
        <FormGroup>
          <ControlLabel>&nbsp;</ControlLabel>
          <InputGroup>
            <FormControl
              type="text"
              value={duration.value || ''}
              placeholder="Input Duration..."
              onChange={event => dataChange({ field: 'duration', event })}
            />
            <InputGroup.Button>
              <Button
                bsStyle="success"
                onClick={() =>
                  dataChange({ field: 'duration', event: 'changeUnit' })
                }
              >
                {genUnitSup(genUnit('duration', duration.value_system).label) ||
                  ''}
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </Col>
    </Row>
  );
};

DateTimeRange.propTypes = {
  opt: PropTypes.object.isRequired,
  layer: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default DateTimeRange;
