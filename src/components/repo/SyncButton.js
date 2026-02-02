import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import LTooltip from '@components/shared/LTooltip';
import FIcons from '@components/icons/FIcons';
import RepoNewModal from '@components/repo/RepoNewModal';
import Constants from '@components/tools/Constants';
import ExternalManager from '@utils/extMgr';
import Response from '@utils/response';
import { notifyError } from '@utils/template/designer-message';

const SyncBtn = (props) => {
  const { fnRefresh, genericType, fnCallback } = props;
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleCreate = async (params) => {
    try {
      const response = await ExternalManager.saveTemplate(genericType, {
        identifier: params.identifier,
      });
      if (response.notify.isSuccess) {
        fnRefresh();
      } else {
        fnCallback(new Response(response.notify, []));
      }
    } catch (error) {
      console.error('Error creating template:', error);
      fnCallback(new Response(notifyError(`Error creating template: ${error}`), []));
    } finally {
      setShow(false);
    }
  };

  return (
    <>
      <LTooltip idf="tpl_view_hub">
        <Button variant="primary" onClick={handleShow}>
          {FIcons.faArrowsRotate}&nbsp;Fetch from LabIMotion Hub
        </Button>
      </LTooltip>
      <RepoNewModal
        content={genericType}
        fnClose={handleClose}
        fnCreate={handleCreate}
        showModal={show}
      />
    </>
  );
};

SyncBtn.propTypes = {
  fnRefresh: PropTypes.func.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnCallback: PropTypes.func,
};

SyncBtn.defaultProps = { fnCallback: () => {} };

export default SyncBtn;
