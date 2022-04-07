import { hot } from 'react-hot-loader';
import Select from 'react-select';
import './GenericMain.css';
import ButtonTooltip from './components/fields/ButtonTooltip';
// import ButtonConfirm from './components/fields/ButtonConfirm';
import { ElementManager } from './entry';
import SimuDS from './simulations/SimuDS';
import SimuSG from './simulations/SimuSG';
import SimuWF from './simulations/SimuWF';
import SimuInterface from './simulations/SimuInterface';
import SimuSearch from './simulations/SimuSearch';

const colourOptions = [
  { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
  { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
  { value: 'purple', label: 'Purple', color: '#5243AA' },
  { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
  { value: 'orange', label: 'Orange', color: '#FF8B00' },
  { value: 'yellow', label: 'Yellow', color: '#FFC400' },
  { value: 'green', label: 'Green', color: '#36B37E' },
  { value: 'forest', label: 'Forest', color: '#00875A' },
  { value: 'slate', label: 'Slate', color: '#253858' },
  { value: 'silver', label: 'Silver', color: '#666666' },
];

const GenericMain = () => (
  <div className="gu_entry">
    <>
      <Select
        className="basic-single"
        classNamePrefix="select"
        defaultValue="Red"
        isDisabled={false}
        isLoading={false}
        isClearable={false}
        isRtl={false}
        isSearchable
        name="color"
        options={colourOptions}
      />
    </>
    <>
      <Select
        className="basic-single"
        classNamePrefix="select"
        defaultValue="Red"
        isDisabled={false}
        isLoading={false}
        isClearable={false}
        isRtl={false}
        isSearchable
        name="color"
        options={colourOptions}
      />
    </>
    <SimuSearch />
    <h1> Hello, World! </h1>
    <ButtonTooltip
      tip="check this"
      fnClick={() => {}}
      bs="primary"
      txt="Hi"
    />
    <ElementManager elements={[]} element={{}} />
    <SimuWF />
    <SimuDS />
    <SimuSG />
    <SimuInterface />
  </div>
);

export default hot(module)(GenericMain);
// export { default as ButtonTooltip } from './components/fields/ButtonTooltip';
// export { ButtonTooltip, ButtonConfirm };
