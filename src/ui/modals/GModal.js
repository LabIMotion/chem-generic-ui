import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

/**
 * The modal shell every dialog in this library should use.
 *
 * It owns the two things each modal used to repeat by hand: the `gu-modal`
 * marker, which carries our footer spacing and left alignment (see
 * `src/assets/modal.scss` — that part has to stay CSS, because the Chemotion
 * ELN zeroes `$modal-footer-margin-between` globally and no prop undoes it),
 * and vertical centering, which is Bootstrap's own `centered` again rather
 * than a stylesheet rule, so a dialog can opt out with `centered={false}`.
 *
 * Everything else is forwarded to `Modal`. The subcomponents are Bootstrap's
 * own, except `GModal.Header`, which defaults `closeButton` — every header in
 * the library asks for it.
 */
function GModal({ className, centered, ...props }) {
  const classes = className ? `gu-modal ${className}` : 'gu-modal';

  return <Modal {...props} centered={centered} className={classes} />;
}

GModal.propTypes = {
  className: PropTypes.string,
  centered: PropTypes.bool,
};

GModal.defaultProps = {
  className: '',
  centered: true,
};

/**
 * `Modal.Header` with the dismiss button on by default; pass
 * `closeButton={false}` for a header that cannot be dismissed from the corner.
 */
function GModalHeader({ closeButton, ...props }) {
  return <Modal.Header {...props} closeButton={closeButton} />;
}

GModalHeader.propTypes = {
  closeButton: PropTypes.bool,
};

GModalHeader.defaultProps = {
  closeButton: true,
};

GModal.Header = GModalHeader;
GModal.Title = Modal.Title;
GModal.Body = Modal.Body;
GModal.Footer = Modal.Footer;
GModal.Dialog = Modal.Dialog;

export default GModal;
