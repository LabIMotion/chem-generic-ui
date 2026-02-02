import Api from '@utils/api';
import Response from '@utils/response';
import { mc2res } from '@components/tools/format-utils';

class ApiExecutor {
  static exec = async (endpoint, method = 'GET', data = null, params = {}) => {
    const fullEndpoint = endpoint;
    const res = data
      ? await Api.execApiDataDepr(data, fullEndpoint, method)
      : await Api.execApiDepr(fullEndpoint, method, params);

    // this is a temporary solution to return the raw response
    // until the backend is refactored to use mc2res
    if (res.error) {
      return new Response(mc2res('se00', res.error || ''), { data: res });
    }
    return new Response(mc2res('ss00', res.msg || ''), { data: res });
  };

  // Execute an API call and return the raw fetch response without JSON parsing
  static execRaw = async (endpoint, method = 'GET', data = null, params = {}) => {
    const fullEndpoint = endpoint;
    const res = data
      ? await Api.execApiDataRaw(data, fullEndpoint)
      : await Api.execApiRaw(fullEndpoint, method, params);

    return res;
  };
}

export default ApiExecutor;
