import React from 'react';
import { Tooltip } from 'react-bootstrap';
import KlassAttrForm from '@components/elements/KlassAttrForm';
import SegmentAttrForm from '@components/elements/SegmentAttrForm';
import Constants from '@components/tools/Constants';

function TipActive(type) {
  return (
    <Tooltip id="active_button">
      This {type} is deactivated, press button to [activate]
    </Tooltip>
  );
}
function TipInActive(type) {
  return (
    <Tooltip id="disable_button">
      This {type} is activated, press button to [deactivate]
    </Tooltip>
  );
}
function TipDelete(type) {
  return (
    <Tooltip id="delete_button">
      Delete this {type}, after deletion, all elements are unaccessible
    </Tooltip>
  );
}

const Content = React.forwardRef((props, ref) => {
  switch (props.content) {
    case Constants.GENERIC_TYPES.SEGMENT:
      return (
        <SegmentAttrForm
          ref={ref}
          element={props.element}
          editable={props.editable}
        />
      );
    case Constants.GENERIC_TYPES.ELEMENT:
      return (
        <KlassAttrForm
          ref={ref}
          element={props.element}
          editable={props.editable}
        />
      );
    default:
      return <div>No content</div>;
  }
});

Content.displayName = 'Content';

export { Content, TipActive, TipInActive, TipDelete };
