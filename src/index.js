import React from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import GenericMain from './GenericMain';

const AppWithDnD = DragDropContext(HTML5Backend)(GenericMain);

ReactDOM.render(<AppWithDnD />, document.getElementById('app'));
