import React from 'react';
import { Form } from 'react-bootstrap';

/**
 * Helper function to build link from type and id
 * @param {string} type - The type of resource
 * @param {string|number} id - The id of resource
 * @returns {string} The constructed URL
 */
export const buildLink = (type, id) => {
  if (!type || !id) {
    return '';
  }

  // Get hostname and port from window.location
  const { protocol, hostname, port } = window.location;
  const portPart = port ? `:${port}` : '';

  return `${protocol}//${hostname}${portPart}/mydb/collection/all/${type.toLowerCase()}/${id}`;
};

/**
 * Helper function to build resource link from resources array
 * @param {Array} resources - Array of resource objects
 * @returns {string} The constructed resource URL
 */
export const buildResourceLink = (resources) => {
  const contextType = resources[0]?.resource_context_type;
  const contextId = resources[0]?.resource_context_id;
  const link = buildLink(contextType, contextId);
  return link;
};

/**
 * Helper function to build default element link
 * @param {Object} element - The element object
 * @returns {string} The constructed element URL
 */
export const buildElementLink = (element) => {
  return buildLink(element?.type, element?.id);
};

/**
 * Get identifier label for display
 * @param {Object} field - The field object
 * @param {Object} element - The element object
 * @returns {string} The label to display
 */
export const getIdentifierLabel = (field, element) => {
  if (field.key === 'resource_identifier') {
    return element?.id;
  }
  if (field.key === 'resource_context_identifier') {
    const resources = element?.tag?.taggable_data?.resources;
    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      return '';
    }
    return resources[0]?.['resource_context_id'] || '';
  }
  return '';
};

/**
 * Get identifier URL for linking
 * @param {Object} field - The field object
 * @param {Object} element - The element object
 * @returns {string} The URL to link to
 */
export const getIdentifierUrl = (field, element) => {
  if (field.key === 'resource_identifier') {
    return buildElementLink(element);
  }
  if (field.key === 'resource_context_identifier') {
    const resources = element?.tag?.taggable_data?.resources;
    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      return '';
    }
    return buildResourceLink(resources);
  }
  return '';
};

/**
 * Render identifier field as link or empty text field
 * @param {Object} field - The field object
 * @param {Object} element - The element object
 * @returns {JSX.Element} The rendered field
 */
export const renderIdentifierField = (field, element) => {
  const label = getIdentifierLabel(field, element);

  if (!label) {
    return (
      <Form.Control
        type="text"
        value=""
        readOnly
        style={{ backgroundColor: '#f5f5f5' }}
      />
    );
  }

  const url = getIdentifierUrl(field, element);

  return (
    <div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          padding: '0.375rem 0.75rem',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ced4da',
          borderRadius: '0.25rem',
          textDecoration: 'none',
          color: '#0d6efd',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {label}
      </a>
    </div>
  );
};
