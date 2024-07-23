/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DocuConst from '../../tools/DocuConst';
import FIcons from '../../icons/FIcons';

const TemplateBar = props => {
  const { notify, active, fnSwitch } = props;
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(notify !== null && Object.keys(notify).length > 0);
  }, [notify]);

  const onClick = event => {
    event.stopPropagation();
    setShow(false);
  };

  return (
    <span className="gu-designer-template-bar">
      <ButtonGroup>
        <OverlayTrigger
          delayShow={500}
          placement="top"
          overlay={
            <Tooltip id="_tooltip_preview_design">
              click to design the template
            </Tooltip>
          }
        >
          <Button active={active === 'w'} onClick={() => fnSwitch('w')}>
            Work Area
          </Button>
        </OverlayTrigger>
        <OverlayTrigger
          delayShow={500}
          placement="top"
          overlay={
            <Tooltip id="_tooltip_preview_design">
              click to preview or view version history
            </Tooltip>
          }
        >
          <Button active={active === 'p'} onClick={() => fnSwitch('p')}>
            Preview Design
          </Button>
        </OverlayTrigger>
      </ButtonGroup>
      <Button
        bsStyle="link"
        href={[
          DocuConst.DOC_SITE,
          'guides',
          'designer',
          'template-features',
        ].join('/')}
        target="_blank"
        onClick={e => e.stopPropagation()}
      >
        {FIcons.faCircleQuestion}
      </Button>
      {show && notify !== null && (
        <span className={notify.isSuccess ? 'alert-success' : 'alert-danger'}>
          <span>
            <b>{notify.title}</b>
            {`: ${notify.msg}`}
          </span>
          <Button bsSize="sm" onClick={onClick}>
            {FIcons.faTimes}
          </Button>
        </span>
      )}
    </span>
  );
};

TemplateBar.propTypes = {
  notify: PropTypes.object,
  active: PropTypes.string,
  fnSwitch: PropTypes.func.isRequired,
};
TemplateBar.defaultProps = { notify: null, active: 'w' };
export default TemplateBar;
