/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import LTooltip from '../shared/LTooltip';
import FIcons from '../icons/FIcons';
import RepoNewModal from './RepoNewModal';
import Constants from '../tools/Constants';
import ExternalManager from '../../utils/extMgr';

const SyncBtn = (props) => {
  const { fnRefresh, genericType, klasses } = props;
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleCreate = async (params) => {
    await ExternalManager.saveTemplate(genericType, {
      identifier: params.identifier,
    });
    fnRefresh();
    setShow(false);
  };

  return (
    <>
      <LTooltip idf="tpl_view_hub">
        <Button variant="info" onClick={handleShow}>
          {FIcons.faArrowsRotate}&nbsp;Fetch from LabIMotion Hub
        </Button>
      </LTooltip>
      <RepoNewModal
        content={genericType}
        fnClose={handleClose}
        fnCreate={handleCreate}
        klasses={klasses}
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
  klasses: PropTypes.array,
};

SyncBtn.defaultProps = { klasses: [] };

export default SyncBtn;
