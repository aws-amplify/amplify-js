import UserAgent from './UserAgent';
/** @class */
export default class Client {
  /**
   * Constructs a new AWS Cognito Identity Provider client object
   * @param {string} region AWS region
   * @param {string} endpoint endpoint
   */
  constructor(region, endpoint) {
    this.endpoint = endpoint || `https://cognito-idp.${region}.amazonaws.com/`;
    this.userAgent = UserAgent.prototype.userAgent || 'aws-amplify/0.1.x js';
  }

  /**
   * Makes an unauthenticated request on AWS Cognito Identity Provider API
   * using fetch
   * @param {string} operation API operation
   * @param {object} params Input parameters
   * @param {function} callback Callback called when a response is returned
   * @returns {void}
  */
  request(operation, params, callback) {
    const headers = {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
      'X-Amz-User-Agent': this.userAgent,
    };

    const options = {
      headers,
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      body: JSON.stringify(params),
    };

    let response;
    let responseJsonData;

    fetch(this.endpoint, options)
      .then(resp => {
        response = resp;
        return resp;
      }, err => {
        // If error happens here, the request failed
        // if it is TypeError throw network error
        if (err instanceof TypeError) {
          throw new Error('Network error');
        }
        throw err;
      })
      .then(resp => resp.json().catch(() => ({})))
      .then(data => {
        // return parsed body stream
        if (response.ok) return callback(null, data);
        responseJsonData = data;

        // Taken from aws-sdk-js/lib/protocol/json.js
        // eslint-disable-next-line no-underscore-dangle
        const code = (data.__type || data.code).split('#').pop();
        const error = {
          code,
          name: code,
          message: (data.message || data.Message || null),
        };
        return callback(error);
      })
      .catch(err => {
        // first check if we have a service error
        if (response && response.headers && response.headers.get('x-amzn-errortype')) {
          try {
            const code = (response.headers.get('x-amzn-errortype')).split(':')[0];
            const error = {
              code,
              name: code,
              statusCode: response.status,
              message: (response.status) ? response.status.toString() : null,
            };
            return callback(error);
          } catch (ex) {
              return callback(err);
          }
        // otherwise check if error is Network error
        } else if (err instanceof Error && err.message === 'Network error') {
          const error = {
            code: 'NetworkError',
            name: err.name,
            message: err.message,
          };
          return callback(error);
        } else {
          return callback(err);
        }
      });
  }
}
