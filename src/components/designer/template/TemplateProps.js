/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import PropLayers from '@components/designer/template/PropLayers';
import SelectOptionLayer from '@components/admin/SelectOptionLayer';
import ButtonTooltip from '@components/fields/ButtonTooltip';
import WorkflowDesignBtn from '@components/designer/WorkflowDesignBtn';
import UploadTemplateBtn from '@components/designer/UploadTemplateBtn';
import ResizablePanel from '@components/shared/ResizablePanel';
import Constants from '@components/tools/Constants';
import fbc from '@components/tools/ui-styles';

const headerText = (genericType, data) => {
  const { name, label, desc } = data;
  let txt = '';
  switch (genericType) {
    case Constants.GENERIC_TYPES.ELEMENT:
      txt = `${genericType} Template: ${label} (${name})`;
      break;
    case Constants.GENERIC_TYPES.SEGMENT:
      txt = `${genericType} Template: ${desc} (${label})`;
      break;
    case Constants.GENERIC_TYPES.DATASET:
      txt = `${genericType} Template: ${label}`;
      break;
    default:
      break;
  }
  return txt;
};

const TemplateProps = (props) => {
  // const { data, vocabularies, fnUpdate, fnSubmit, genericType, innerAction } = props;
  const { data, vocabularies, fnSubmit, genericType, innerAction } = props;

  return (
    <div>
      <Card>
        <Card.Header
          className={`fs-5 fw-bold ${fbc}`}
        >
          {headerText(genericType, data)}
          <span className="button-right d-flex gap-1">
            <UploadTemplateBtn
              data={data}
              fnUpload={innerAction}
              genericType={genericType}
              btnCls="fw-medium"
            />
            <WorkflowDesignBtn
              element={data}
              fnSave={innerAction}
              genericType={genericType}
              btnCls="fw-medium"
            />
            <ButtonTooltip
              txt="Save and Release (Major)"
              idf="tpl_save_rel_major"
              fnClick={fnSubmit}
              element={{ data, release: 'major' }}
              fa="faFloppyDisk"
              place="top"
              bs="success"
              size="sm"
              btnCls="fw-medium"
            />
            <ButtonTooltip
              txt="Save and Release (Minor)"
              idf="tpl_save_rel_minor"
              fnClick={fnSubmit}
              element={{ data, release: 'minor' }}
              fa="faFloppyDisk"
              place="top"
              bs="success"
              size="sm"
              btnCls="fw-medium"
            />
            <ButtonTooltip
              txt="Save as draft"
              idf="tpl_save_draft"
              fnClick={fnSubmit}
              element={{ data, release: 'draft' }}
              fa="faFloppyDisk"
              place="top"
              bs="primary"
              size="sm"
              btnCls="fw-medium"
            />
          </span>
        </Card.Header>
        <Card.Body>
          <div style={{ maxWidth: '2000px', margin: 'auto', height: '100%' }}>
            <ResizablePanel
              defaultLeftWidth={66.67}
              minLeftWidth={50}
              minRightWidth={20}
              leftPanel={
                <PropLayers
                  data={data}
                  vocabularies={vocabularies}
                  fnDerive={innerAction}
                  fnUpdate={innerAction}
                  genericType={genericType}
                />
              }
              rightPanel={
                <div>
                  <SelectOptionLayer generic={data} fnChange={innerAction} />
                </div>
              }
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

TemplateProps.propTypes = {
  data: PropTypes.object,
  vocabularies: PropTypes.array,
  fnSubmit: PropTypes.func.isRequired,
  // fnUpdate: PropTypes.func.isRequired, // update element with new element
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  innerAction: PropTypes.func.isRequired,
};

TemplateProps.defaultProps = { vocabularies: [] };

export default TemplateProps;
