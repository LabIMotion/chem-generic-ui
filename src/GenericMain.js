import React from 'react';
import { hot } from 'react-hot-loader';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import './GenericMain.css';
import ButtonTooltip from './components/fields/ButtonTooltip';
// import ButtonConfirm from './components/fields/ButtonConfirm';
import { ElementManager } from './entry';
import SimuDS from './simulations/SimuDS';
import SimuSG from './simulations/SimuSG';
import SimuWF from './simulations/SimuWF';
import SimuInterface from './simulations/SimuInterface';
import SimuSearch from './simulations/SimuSearch';

library.add(fas, far);

const GenericMain = () => (
  <div className="gu_entry">
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
