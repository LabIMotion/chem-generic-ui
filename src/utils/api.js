import 'whatwg-fetch';

const API_V1 = '/api/v1';
const baseOptions = {
  credentials: 'same-origin',
  headers: {
    Accept: 'application/json',
  },
};

const fetchOptions = method => {
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

export default class Api {
  static execApi = (path, method = 'GET') => {
    console.log('Api.execApi:', `${API_V1}/${path}`);
    return fetch(`${API_V1}/${path}`, fetchOptions(method))
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .catch(error => {
        console.error('Fetching Error:', error);
        return error;
      });
  };

  static execApiData = (data, path, method = 'POST') =>
    fetch(`${API_V1}/${path}`, fetchBody(data, method))
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .catch(error => {
        console.error('Fetching Error:', error);
        return error;
      });
}
