import React from 'react';
import ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GenericMain from './GenericMain';

const AppWithDnD = () => (
  <DndProvider backend={HTML5Backend}>
    <GenericMain />
  </DndProvider>
);

const rootElement = document.getElementById('app');

const render = () => {
  ReactDOM.render(<AppWithDnD />, rootElement);
};

// Enable React Refresh
if (module.hot) {
  module.hot.accept('./GenericMain', render);
}

render();
