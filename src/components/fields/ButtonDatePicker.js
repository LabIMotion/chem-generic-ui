import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

const DatePickerComponent = ({ handleChange, val, readOnly }) => {
  const selectedValue = val ? new Date(val) : null;

  return (
    <Form.Group onClick={(e) => e.stopPropagation()}>
      <div className="gu-datepicker">
        <DatePicker
          isClearable={!readOnly}
          clearButtonClassName="gu_date_picker-clear"
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="dd/MM/yyyy HH:mm"
          selected={selectedValue}
          onSelect={handleChange}
          onChange={handleChange}
          placeholderText="DD/MM/YYYY hh:mm"
          readOnly={readOnly}
          className={readOnly ? 'gu-readonly' : ''}
        />
      </div>
    </Form.Group>
  );
};

const ButtonDatePicker = ({ onChange, val, readOnly }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (date) => {
    onChange(date);
    setShowDatePicker(false);
  };

  if (val || showDatePicker) {
    return (
      <DatePickerComponent
        handleChange={handleDateChange}
        val={val}
        readOnly={readOnly}
      />
    );
  }
  return (
    <LTooltip idf="record_time">
      <Button
        variant="light"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setShowDatePicker(!showDatePicker);
        }}
        disabled={readOnly}
      >
        {FIcons.faClock}
      </Button>
    </LTooltip>
  );
};

export default ButtonDatePicker;
