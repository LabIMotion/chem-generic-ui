/**
 * Utility functions for file handling
 */

/**
 * Utility function to download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The name to give the downloaded file
 */
export const downloadBlobAsFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);

  document.body.appendChild(link);

  link.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

/**
 * Extracts filename from response headers (Content-Disposition)
 * @param {Response} response - The fetch Response object
 * @param {string} defaultFileName - Default filename to use if none is found in the headers
 * @returns {string} The extracted filename or default name
 */
export const getFileName = (response, defaultFileName = 'download') => {
  try {
    const disposition = response.headers.get('Content-Disposition');

    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);

      if (matches != null && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }

      const filenameUTF8Regex = /filename\*=UTF-8''([^;]*)/i;
      const utf8Matches = filenameUTF8Regex.exec(disposition);

      if (utf8Matches && utf8Matches[1]) {
        return decodeURIComponent(utf8Matches[1]);
      }
    }

    const url = response.url;
    if (url) {
      const urlParts = url.split('/');
      const potentialFilename = urlParts[urlParts.length - 1];

      if (
        potentialFilename &&
        potentialFilename.includes('.') &&
        !potentialFilename.includes('?') &&
        potentialFilename.length < 100
      ) {
        return potentialFilename.split('?')[0]; // Remove any query params
      }
    }

    return defaultFileName;
  } catch (error) {
    console.error('Error extracting filename from response:', error);
    return defaultFileName;
  }
};

/**
 * Downloads a file from a fetch response
 * @param {Response} response - The fetch response
 * @param {string} defaultFileName - Default name to use if filename can't be determined
 */
export const downloadResponseAsFile = async (
  response,
  defaultFileName = 'download',
) => {
  try {
    const blob = await response.clone().blob();
    const filename = getFileName(response, defaultFileName);
    downloadBlobAsFile(blob, filename);
  } catch (error) {
    console.error('Error downloading file from response:', error);
    throw error;
  }
};
