import React from 'react';
import PropTypes from 'prop-types';
import GModal from '@ui/modals/GModal';

function GenericElCriteriaModal(props) {
  const Component = props.component;
  if (!props.show) return <span />;
  return (
    <GModal
      dialogClassName="generic_criteria_modal"
      animation={false}
      show={props.show}
      onHide={props.onHide}
    >
      <GModal.Header>
        <GModal.Title>{props.title}</GModal.Title>
      </GModal.Header>
      <GModal.Body>{Component}</GModal.Body>
    </GModal>
  );
}

GenericElCriteriaModal.propTypes = {
  show: PropTypes.bool,
  component: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  onHide: PropTypes.func,
};

GenericElCriteriaModal.defaultProps = {
  show: false,
  component: null,
  title: '',
  onHide: () => {},
};

export default GenericElCriteriaModal;
