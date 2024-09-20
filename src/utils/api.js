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

const handleResponse = (response) => {
  console.log('response=', response);
  if (!response.ok) {
    throw new Error(response.error || response.statusText);
  }
  return response.json().then((data) => {
    console.log('parsed data=', data);
    if (!('mc' in data)) {
      return { mc: 'se01' };
    }
    return data;
  });
};

const handleError = (error) => {
  console.log('error instanceof Error=', error instanceof Error);
  console.log(error);
  const errorMessage = error instanceof Error ? error.message : error;
  console.log('errorMessage=', errorMessage);
  return { mc: 'se00', msg: errorMessage };
};

export default class Api {
  static execApi = async (path, method = 'GET', params = {}) => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = `${API_V1}/${path}${queryString ? `?${queryString}` : ''}`;
    console.log('Api.execApi:', url);
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
