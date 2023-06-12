import React from 'react';
// import { hot } from 'react-hot-loader';
import ButtonTooltip from './components/fields/ButtonTooltip';
// import ButtonConfirm from './components/fields/ButtonConfirm';
import { ElementManager } from './entry';
import SimuDnDWF from './simulations/SimDnDWF';
import SimuDS from './simulations/SimuDS';
import SimuSG from './simulations/SimuSG';
import SimuWF from './simulations/SimuWF';
import SimuInterface from './simulations/SimuInterface';
import SimuSearch from './simulations/SimuSearch';
import DnDModal from './simulations/DnDModal';
import el from './simulations/_el_sem_v.json';

import './GenericMain.css';
import './assets/main.scss';

const { version } = require('../package.json');

const GenericMain = () => (
  <div className="gu_entry">
    <h1> Version {version} </h1>
    {/* <DnDModal element={el} /> */}
    <SimuDnDWF />
    <SimuWF />
    {/* <SimuSearch /> */}
    {/* <h1> Hello, World! </h1> */}
    {/* <ButtonTooltip tip="check this" fnClick={() => {}} bs="primary" txt="Hi" /> */}
    {/* <ElementManager elements={[]} element={{}} /> */}
    {/* <SimuDS /> */}
    {/* <SimuSG /> */}
    {/* <SimuInterface /> */}
  </div>
);

// export default hot(module)(GenericMain);
export default GenericMain;
// export { default as ButtonTooltip } from './components/fields/ButtonTooltip';
// export { ButtonTooltip, ButtonConfirm };
