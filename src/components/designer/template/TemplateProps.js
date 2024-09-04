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
  const { data, vocabularies, fnUpdate, fnSubmit, genericType, innerAction } = props;

  return (
    <div>
      <Panel>
        <Panel.Heading>
          <b>{`Template of ${genericType} [${data.name || data.label}]`}</b>
          &nbsp;
          <span className="button-right">
            <UploadTemplateBtn
              data={data}
              fnUpload={innerAction}
              genericType={genericType}
            />
            &nbsp;
            <WorkflowDesignBtn
              element={data}
              fnSave={innerAction}
              genericType={genericType}
            />
            &nbsp;
            <ButtonTooltip
              txt="Save and Release (Major)"
              idf="tpl_save_rel_major"
              fnClick={fnSubmit}
              element={{ data, release: 'major' }}
              fa="faFloppyDisk"
              place="top"
              bs="success"
            />
            &nbsp;
            <ButtonTooltip
              txt="Save and Release (Minor)"
              idf="tpl_save_rel_minor"
              fnClick={fnSubmit}
              element={{ data, release: 'minor' }}
              fa="faFloppyDisk"
              place="top"
              bs="success"
            />
            &nbsp;
            <ButtonTooltip
              txt="Save as draft"
              idf="tpl_save_draft"
              fnClick={fnSubmit}
              element={{ data, release: 'draft' }}
              fa="faFloppyDisk"
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
                vocabularies={vocabularies}
                fnDerive={innerAction}
                fnUpdate={innerAction}
                genericType={genericType}
              />
            </Col>
            <Col sm={4}>
              <SelectOptionLayer generic={data} fnChange={innerAction} />
            </Col>
          </Row>
        </Panel.Body>
      </Panel>
    </div>
  );
};

TemplateProps.propTypes = {
  data: PropTypes.object,
  vocabularies: PropTypes.array,
  fnSubmit: PropTypes.func.isRequired,
  fnUpdate: PropTypes.func.isRequired, // update element with new element
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  innerAction: PropTypes.func.isRequired,
};

TemplateProps.defaultProps = { vocabularies: [] };

export default TemplateProps;
