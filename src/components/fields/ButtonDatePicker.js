import React, { useState } from 'react';
import { Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FIcons from '../icons/FIcons';

const BTN_DATETIME_PICKER_TIP = (
  <Tooltip id="_cgu_tooltip_datetime_picker">Record time</Tooltip>
);

const DatePickerComponent = ({ handleChange, val }) => (
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
    />
  </FormGroup>
);

const ButtonDatePicker = ({ onChange, val }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = date => {
    onChange(date);
    setShowDatePicker(false);
  };

  if (val || showDatePicker) {
    return <DatePickerComponent handleChange={handleDateChange} val={val} />;
  }
  return (
    <OverlayTrigger placement="top" overlay={BTN_DATETIME_PICKER_TIP}>
      <Button
        className="btn-gxs"
        onClick={() => setShowDatePicker(!showDatePicker)}
      >
        {FIcons.faClock}
      </Button>
    </OverlayTrigger>
  );
};

export default ButtonDatePicker;
