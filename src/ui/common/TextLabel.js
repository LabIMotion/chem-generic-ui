import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import FieldHeader from '@components/fields/FieldHeader';
import { parseTextWithLinks } from '@utils/pureUtils';

const TextLabel = ({ opt, value }) => {
  const parts = parseTextWithLinks(value);
  return (
    <Form.Group className="props_text">
      {FieldHeader(opt)}
      <div>
        {parts.map((part, i) =>
          part.type === 'link' ? (
            <a
              key={i}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ wordBreak: 'break-word' }}
            >
              {part.content} {FIcons.faArrowUpRightFromSquare}
            </a>
          ) : (
            <span key={i}>{part.content}</span>
          ),
        )}
      </div>
    </Form.Group>
  );
};

TextLabel.propTypes = {
  opt: PropTypes.object,
  value: PropTypes.string,
};

TextLabel.defaultProps = {
  opt: {},
  value: '',
};

export default TextLabel;
