import React from 'react';

export default function ExampleSidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/labimotion', nodeType);
    // eslint-disable-next-line no-param-reassign -- required HTML5 DnD API mutation
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      <div className="description">
        You can drag these nodes to the pane on the right.
      </div>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'input')}
        draggable
      >
        Input Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'default')}
        draggable
      >
        Default Node
      </div>
      <div
        className="dndnode output"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        Output Node
      </div>
    </aside>
  );
}
