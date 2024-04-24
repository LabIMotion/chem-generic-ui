/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import { downloadFile } from 'generic-ui-core';
import FIcons from '../icons/FIcons';

const FieldUploadItem = ({ opt, attachment }) => {
  const [secondImgSrc, setSecondImgSrc] = useState('');
  const [imgWidth, setImgWidth] = useState('50%');

  useEffect(() => {
    const urlParams = new URLSearchParams({
      identifier: attachment.uid,
      annotated: false,
    });

    fetch(`/api/v1/attachments/image/-1?${urlParams}`, {
      credentials: 'same-origin',
      method: 'GET',
    })
      .then(response => response.blob())
      .then(blob => {
        if (blob?.type.startsWith('image')) {
          setSecondImgSrc(URL.createObjectURL(blob));
        }
      })
      .catch(errorMessage => {
        console.log(errorMessage);
      });
  }, [attachment.uid]);

  const handleInputChange = e => {
    let newWidth = parseFloat(e.target.value);
    if (Number.isNaN(newWidth)) {
      newWidth = 50; // default value
    } else if (newWidth < 0) {
      newWidth = 0;
    } else if (newWidth > 100) {
      newWidth = 100;
    }
    setImgWidth(`${newWidth}%`);
  };

  const delBtn = (
    <Button
      id={attachment.uid}
      className="button-right btn-gxs"
      onClick={() =>
        opt.onChange({ ...opt.value, action: 'd', uid: attachment.uid })
      }
    >
      {FIcons.faTimes}
    </Button>
  );

  const filename = attachment.aid ? (
    <>
      <a
        onClick={() =>
          downloadFile({
            contents: `/api/v1/attachments/${attachment.aid}`,
            name: attachment.filename,
          })
        }
        style={{ cursor: 'pointer' }}
        title={attachment.filename}
      >
        {attachment.filename}
      </a>
    </>
  ) : (
    attachment.filename
  );

  return (
    <div className="generic_grid">
      <div>
        <div>{delBtn}</div>
        <div className="generic_grid_row file_text">{filename}</div>
        <div className="generic_grid_row">
          <FormGroup bsSize="sm">
            <FormControl
              type="text"
              value={attachment.label || ''}
              onChange={e =>
                opt.onChange({
                  ...opt.value,
                  action: 'l',
                  uid: attachment.uid,
                  val: e,
                })
              }
            />
          </FormGroup>
        </div>
      </div>
      <div style={{ flexDirection: 'column', alignItems: 'center' }}>
        {secondImgSrc && (
          <>
            <div style={{ alignSelf: 'flex-end', display: 'inline-flex' }}>
              <InputGroup bsSize="sm" className="gu-xsmall-input-group">
                <FormControl
                  type="number"
                  step="any"
                  value={parseFloat(imgWidth)}
                  onChange={handleInputChange}
                />
                <InputGroup.Addon>%</InputGroup.Addon>
              </InputGroup>
              <Button
                className="btn-gxs"
                onClick={() => window.open(secondImgSrc, '_blank')}
              >
                Original
              </Button>
            </div>
            <img
              src={secondImgSrc}
              alt={attachment.filename}
              style={{ width: imgWidth, height: 'auto', maxWidth: '100%' }}
            />
          </>
        )}
      </div>
    </div>
  );
};

FieldUploadItem.propTypes = {
  attachment: PropTypes.shape({
    aid: PropTypes.number,
    filename: PropTypes.string,
    label: PropTypes.string,
    uid: PropTypes.string,
  }),
  opt: PropTypes.shape({
    onChange: PropTypes.func,
    value: PropTypes.object,
  }),
};

FieldUploadItem.defaultProps = { attachment: {}, opt: {} };

export default FieldUploadItem;
