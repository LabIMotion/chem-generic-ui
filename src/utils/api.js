const API_V1 = '/api/v1';
const baseOptions = {
  credentials: 'same-origin',
  headers: {
    Accept: 'application/json',
  },
};

const fetchOptions = (method) => {
  return {
    ...baseOptions,
    method,
  };
};

const fetchBody = (data, method) => {
  return {
    ...baseOptions,
    method,
    headers: {
      ...baseOptions.headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || response.statusText);
  }
  const data = await response.json();
  if (!('mc' in data)) {
    return { mc: 'se01' };
  }
  return data;
};

const handleError = (error) => {
  const errorMessage = error instanceof Error ? error.message : error;
  return { mc: 'se00', msg: errorMessage };
};

export default class Api {
  /**
   * Build a full URL with optional query parameters
   */
  static buildUrl = (endpoint, params = {}) => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    return `${API_V1}/${endpoint}${queryString ? `?${queryString}` : ''}`;
  };

  /**
   * Get headers for API requests
   */
  static getHeaders = () => {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  };

  static execApi = async (path, method = 'GET', params = {}) => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = `${API_V1}/${path}${queryString ? `?${queryString}` : ''}`;
    try {
      const res = await fetch(url, fetchOptions(method));
      return await handleResponse(res);
    } catch (error) {
      return handleError(error);
    }
  };

  static execApiData = async (data, path, method = 'POST') => {
    try {
      const res = await fetch(`${API_V1}/${path}`, fetchBody(data, method));
      return await handleResponse(res);
    } catch (error) {
      return handleError(error);
    }
  };

  // deprecated
  // Execute an API call and return the fetch response with JSON parsing
  static execApiDepr = async (path, method = 'GET', params = {}) => {
    const searchParams = new URLSearchParams(params || {});
    const queryString = searchParams.toString();
    const url = `${API_V1}/${path}${queryString ? `?${queryString}` : ''}`;
    try {
      const res = await fetch(url, fetchOptions(method));
      return await res.json();
    } catch (error) {
      return handleError(error);
    }
  };

  static execApiDataDepr = async (data, path, method = 'POST') => {
    try {
      const res = await fetch(`${API_V1}/${path}`, fetchBody(data, method));
      return await res.json();
    } catch (error) {
      return handleError(error);
    }
  };

  /**
   * Execute an API call and return the raw fetch response without JSON parsing
   */
  static execApiRaw = async (endpoint, method = 'GET', params = {}) => {
    const url = Api.buildUrl(endpoint, params);
    try {
      const response = await fetch(url, {
        method,
        headers: Api.getHeaders(),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error(`API error for ${url}:`, error);
      throw error;
    }
  };

  /**
   * Execute an API call with data payload and return the raw fetch response
   */
  static execApiDataRaw = async (data, endpoint) => {
    const url = Api.buildUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: Api.getHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error(`API data error for ${url}:`, error);
      throw error;
    }
  };
}
