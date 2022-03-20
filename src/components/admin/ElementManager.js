/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

const ElementManager = () => {
  const [count, setCount] = useState(0);

  // return (
  //   <Panel bsStyle="primary">
  //     <Panel.Heading>
  //       <Panel.Title componentClass="h3">Panel heading</Panel.Title>
  //     </Panel.Heading>
  //     <Panel.Body>Panel content</Panel.Body>
  //   </Panel>
  // );
  return (
    <div>
      <p>You clicked {count} times</p>
      <Button bsStyle="primary" onClick={() => setCount(count + 1)}>
        Click me
      </Button>
    </div>
  );
};


// export { GenPropertiesText, ElementManager };
export default ElementManager;
