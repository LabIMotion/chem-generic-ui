import 'whatwg-fetch';

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
}
