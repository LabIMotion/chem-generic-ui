/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Tooltip, OverlayTrigger } from 'react-bootstrap';
import DocuConst from '../../tools/DocuConst';
import FIcons from '../../icons/FIcons';
import LTooltip from '../../shared/LTooltip';

const TemplateBar = (props) => {
  const { notify, active, fnSwitch } = props;
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(notify !== null && Object.keys(notify || {}).length > 0);
  }, [notify]);

  const onClick = (event) => {
    event.stopPropagation();
    setShow(false);
  };

  return (
    <span className="gu-designer-template-bar">
      <ButtonGroup>
        <LTooltip idf="design_template">
          <Button active={active === 'w'} onClick={() => fnSwitch('w')}>
            Work Area
          </Button>
        </LTooltip>
        <LTooltip idf="preview_or_versions">
          <Button active={active === 'p'} onClick={() => fnSwitch('p')}>
            Preview Design
          </Button>
        </LTooltip>
      </ButtonGroup>
      <OverlayTrigger
        delayShow={1000}
        placement="top"
        overlay={<Tooltip id="_designer_doc_tooltip">Learn more</Tooltip>}
      >
        <Button
          bsStyle="link"
          href={[
            DocuConst.DOC_SITE,
            'guides',
            'designer',
            'template-features',
          ].join('/')}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          {FIcons.faCircleQuestion}
        </Button>
      </OverlayTrigger>
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
