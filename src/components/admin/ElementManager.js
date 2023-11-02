import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

const ElementManager = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>
        You clicked
        {count}
        {' '}
        times
      </p>
      <Button bsStyle="primary" onClick={() => setCount(count + 1)}>
        Click me
      </Button>
    </div>
  );
};

export default ElementManager;
