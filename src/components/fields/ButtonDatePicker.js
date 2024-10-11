import React, { useState } from 'react';
import { Button, FormGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const DatePickerComponent = ({ handleChange, val, readOnly }) => (
  <FormGroup>
    <DatePicker
      isClearable
      clearButtonClassName="gu_date_picker-clear"
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="dd/MM/yyyy HH:mm"
      selected={val}
      onSelect={handleChange}
      onChange={handleChange}
      placeholderText="DD/MM/YYYY hh:mm"
      readOnly={readOnly}
    />
  </FormGroup>
);

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
        className="btn-gxs"
        onClick={() => setShowDatePicker(!showDatePicker)}
      >
        {FIcons.faClock}
      </Button>
    </LTooltip>
  );
};

export default ButtonDatePicker;
