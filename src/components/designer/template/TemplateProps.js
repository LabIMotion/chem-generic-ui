/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, Panel, Row } from 'react-bootstrap';
import PropLayers from './PropLayers';
import SelectOptionLayer from '../../admin/SelectOptionLayer';
import ButtonTooltip from '../../fields/ButtonTooltip';
import Constants from '../../tools/Constants';
import WorkflowDesignBtn from '../WorkflowDesignBtn';
import UploadTemplateBtn from '../UploadTemplateBtn';

const TemplateProps = props => {
  const {
    data,
    fnDelete,
    fnDerive,
    // fnSaveFlow,
    // fnSubmit,
    fnUpdate,
    fnUpload,
    genericType,
  } = props;

  return (
    <Panel>
      <Panel.Heading>
        <b>{`Template of Element [${data.name}]`}</b>&nbsp;
        <span className="generic_version">{`ver.: ${data.uuid}`}</span>
        <span className="generic_version_draft">
          {data.uuid === data.properties_template.uuid
            ? ''
            : `draft: ${data.properties_template.uuid}`}
        </span>
        <span className="button-right">
          <UploadTemplateBtn
            data={data}
            fnUpload={fnUpload}
            genericType={genericType}
          />
          &nbsp;
          <WorkflowDesignBtn
            element={data}
            fnSave={fnDerive}
            genericType={genericType}
          />
          &nbsp;
          <ButtonTooltip
            txt="Save and Release"
            tip="Save and Release template"
            // fnClick={() => fnSubmit(true)}
            fnClick={fnDerive}
            fa="fa-floppy-o"
            place="top"
            bs="success"
          />
          &nbsp;
          <ButtonTooltip
            txt="Save as draft"
            tip="Save template as draft"
            // fnClick={() => fnSubmit(false)}
            fnClick={fnDerive}
            fa="fa-floppy-o"
            place="top"
            bs="primary"
          />
        </span>
        <div className="clearfix" />
      </Panel.Heading>
      <Panel.Body>
        <Row style={{ maxWidth: '2000px', margin: 'auto' }}>
          <Col sm={8}>
            <PropLayers
              data={data}
              fnDelete={fnDelete}
              fnUpdate={fnUpdate}
              genericType={genericType}
            />
          </Col>
          <Col sm={4}>
            <SelectOptionLayer generic={data} fnChange={fnUpdate} />
          </Col>
        </Row>
      </Panel.Body>
    </Panel>
  );
};

TemplateProps.propTypes = {
  data: PropTypes.object,
  fnDelete: PropTypes.func.isRequired,
  fnDerive: PropTypes.func.isRequired,
  // fnSaveFlow: PropTypes.func,
  // fnSubmit: PropTypes.func.isRequired,
  fnUpdate: PropTypes.func.isRequired, // update element with new element
  fnUpload: PropTypes.func.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
  ]).isRequired,
};

// TemplateProps.defaultProps = { fnSaveFlow: () => {} };

export default TemplateProps;
