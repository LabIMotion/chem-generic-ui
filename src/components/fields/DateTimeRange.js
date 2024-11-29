/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import round from 'lodash/round';
import moment from 'moment';
import 'moment-precise-range-plugin';
import { genUnit, genUnits, unitConversion } from 'generic-ui-core';
import GenericSubField from '../models/GenericSubField';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

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

const DurationLabel = {
  d: 'day(s)',
  h: 'hour(s)',
  min: 'min(s)',
  s: 'sec(s)',
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
        <Form.Group>
          <Form.Label>Start</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              value={timeStart.value}
              placeholder={timePlaceholder}
              onChange={(event) => dataChange({ field: 'timeStart', event })}
            />
            <Button
              variant="light"
              style={{ padding: '6px' }}
              onClick={() =>
                dataChange({ field: 'timeStart', event: 'setCurrent' })
              }
            >
              {FIcons.faClock}
            </Button>
          </InputGroup>
        </Form.Group>
      </Col>
      <Col sm={12} md={3} lg={3}>
        <Form.Group>
          <Form.Label>Stop</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              value={timeStop.value}
              placeholder={timePlaceholder}
              onChange={(event) => dataChange({ field: 'timeStop', event })}
            />
            <Button
              variant="light"
              style={{ padding: '6px' }}
              onClick={() =>
                dataChange({ field: 'timeStop', event: 'setCurrent' })
              }
            >
              {FIcons.faClock}
            </Button>
          </InputGroup>
        </Form.Group>
      </Col>
      <Col sm={12} md={3} lg={3}>
        <Form.Group>
          <Form.Label>Duration</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              value={calc}
              disabled
              placeholder="Duration"
            />
            <LTooltip idf="clipboard">
              <Button
                variant="light"
                onClick={() => {
                  navigator.clipboard.writeText(calc);
                }}
              >
                {FIcons.faPaste}
              </Button>
            </LTooltip>
            <LTooltip idf="copy_to_duration">
              <Button
                variant="light"
                className="clipboardBtn"
                onClick={() =>
                  dataChange({ field: 'duration', event: 'copyTo' })
                }
              >
                {FIcons.faArrowRight}
              </Button>
            </LTooltip>
          </InputGroup>
        </Form.Group>
      </Col>
      <Col sm={12} md={3} lg={3}>
        <Form.Group>
          <Form.Label>&nbsp;</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              value={duration.value || ''}
              placeholder="Input Duration..."
              onChange={(event) => dataChange({ field: 'duration', event })}
            />
            <Button
              variant="success"
              onClick={() =>
                dataChange({ field: 'duration', event: 'changeUnit' })
              }
            >
              {DurationLabel[genUnit('duration', duration.value_system).key] ||
                ''}
            </Button>
          </InputGroup>
        </Form.Group>
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
