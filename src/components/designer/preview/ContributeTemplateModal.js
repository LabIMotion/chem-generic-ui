/* eslint-disable react/forbid-prop-types */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { userData } from '@components/tools/utils';
import Api from '@utils/api';

const ContributeTemplateModal = ({ showProps, data, currentUser, onSubmitSuccess }) => {
  const { show, setShow } = showProps;
  const formRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', content: '' });
  const [emailValidation, setEmailValidation] = useState({ isValid: true, message: '' });

  const handleClose = () => {
    setShow(false);
    setSubmitMessage({ type: '', content: '' });
    setEmailValidation({ isValid: true, message: '' });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value.trim();

    if (email === '') {
      setEmailValidation({ isValid: true, message: '' });
    } else if (!validateEmail(email)) {
      setEmailValidation({
        isValid: false,
        message: 'Please enter a valid email address (e.g., user@example.com)'
      });
    } else {
      setEmailValidation({ isValid: true, message: '' });
    }
  };

  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter') {
      const email = e.target.value.trim();
      if (email !== '' && !validateEmail(email)) {
        setEmailValidation({
          isValid: false,
          message: 'Please enter a valid email address (e.g., user@example.com)'
        });
      }
    }
  };

  const validateForm = () => {
    const form = formRef.current;
    if (!form) return false;

    const nameInput = form.querySelector('[name="contributorName"]');
    const contributorEmailInput = form.querySelector('[name="contributorEmail"]');
    const emailInput = form.querySelector('[name="contactEmail"]');
    const applicationInput = form.querySelector('[name="application"]');
    const messageInput = form.querySelector('[name="message"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const contributorEmail = contributorEmailInput ? contributorEmailInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const application = applicationInput ? applicationInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !contributorEmail || !email || !application || !message) {
      setSubmitMessage({
        type: 'danger',
        content: 'All fields are required. Please fill in all the fields.',
      });
      return false;
    }

    // Basic email validation
    if (!validateEmail(email)) {
      setSubmitMessage({
        type: 'danger',
        content: 'Please enter a valid email address.',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', content: '' });

    try {
      const form = formRef.current;
      const emailInput = form.querySelector('[name="contactEmail"]');
      const applicationInput = form.querySelector('[name="application"]');
      const messageInput = form.querySelector('[name="message"]');
      const templateKlass = data?.properties_release?.klass;
      const submissionData = {
        contact_email: emailInput ? emailInput.value.trim() : '',
        application: applicationInput ? applicationInput.value.trim() : '',
        message: messageInput ? messageInput.value.trim() : '',
        klass: templateKlass || '',
        id: data?.id,
        templateUuid: data?.uuid,
      };

      const response = await Api.execApiData(
        submissionData,
        'labimotion_hub/submit',
        'POST'
      );

      if (response.mc === 'se00') {
        setSubmitMessage({
          type: 'danger',
          content: response.msg || 'Failed to submit template contribution.',
        });
      } else {
        setSubmitMessage({
          type: 'success',
          content: 'Template contribution submitted successfully! Thank you for your contribution.',
        });

        // Clear form after successful submission
        form.reset();
        setEmailValidation({ isValid: true, message: '' });

        // Update the data to mark as submitted
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }
    } catch (error) {
      setSubmitMessage({
        type: 'danger',
        content: 'An error occurred while submitting. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Contribute this template to Template Hub</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {submitMessage.content && (
          <Alert variant={submitMessage.type} className="mb-3">
            {submitMessage.content}
          </Alert>
        )}

        <Form ref={formRef} onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Registered Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="contributorName"
              placeholder="Enter your full name"
              required
              disabled
              defaultValue={userData(currentUser).name || ''}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Registered E-Mail <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="contributorEmail"
              placeholder="Enter your email address"
              required
              disabled
              defaultValue={userData(currentUser).email || ''}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Contact E-Mail <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="contactEmail"
              placeholder="Enter your email address"
              required
              onChange={handleEmailChange}
              onKeyPress={handleEmailKeyPress}
              isInvalid={!emailValidation.isValid}
            />
            {!emailValidation.isValid && (
              <Form.Control.Feedback type="invalid">
                {emailValidation.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Application <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="application"
              placeholder="Enter the application name or context"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Leave a message <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="message"
              placeholder="Please describe your template, its purpose, and why it would be valuable for the template hub..."
              required
            />
          </Form.Group>

          <div className="text-muted small mb-3">
            <strong>Template Information:</strong>
            <br />
            ID: {data?.uuid || 'N/A'}
            <br />
            Version: {data?.version || 'N/A'}
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="justify-content-start">
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit to Template Hub'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ContributeTemplateModal.propTypes = {
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
  data: PropTypes.object,
  onSubmitSuccess: PropTypes.func,
};

ContributeTemplateModal.defaultProps = {
  data: {},
  onSubmitSuccess: null,
};

export default ContributeTemplateModal;
