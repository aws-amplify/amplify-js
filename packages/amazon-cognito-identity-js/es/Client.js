function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import UserAgent from './UserAgent';
/** @class */

var Client = function () {
  /**
   * Constructs a new AWS Cognito Identity Provider client object
   * @param {string} region AWS region
   * @param {string} endpoint endpoint
   */
  function Client(region, endpoint) {
    _classCallCheck(this, Client);

    this.endpoint = endpoint || 'https://cognito-idp.' + region + '.amazonaws.com/';
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


  Client.prototype.request = function request(operation, params, callback) {
    var headers = {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.' + operation,
      'X-Amz-User-Agent': this.userAgent
    };

    var options = {
      headers: headers,
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      body: JSON.stringify(params)
    };

    var response = void 0;
    var responseJsonData = void 0;

    fetch(this.endpoint, options).then(function (resp) {
      response = resp;
      return resp;
    }).catch(function (err) {
      // If error happens here, the request failed
      // if it is TypeError throw network error
      if (err instanceof TypeError) {
        throw new Error('Network error');
      }
      throw err;
    }).then(function (resp) {
      return resp.json();
    }).catch(function (err) {
      // If error happens here
      // cannot parse the body stream, return undefined
      if (response.ok) return callback(null, undefined);else {
        var error = {
          code: response.status,
          statusCode: response.status,
          message: response.statusText
        };
        callback(error);
      }
    }).then(function (data) {
      // return parsed body stream
      if (response.ok) return callback(null, data);
      responseJsonData = data;

      // Taken from aws-sdk-js/lib/protocol/json.js
      // eslint-disable-next-line no-underscore-dangle
      var code = (data.__type || data.code).split('#').pop();
      var error = {
        code: code,
        name: code,
        message: data.message || data.Message || null
      };
      return callback(error);
    }).catch(function (err) {
      // if cannot split the data
      // default to return 'UnknownError' with the json data from response
      var error = { code: 'UnknownError', message: 'Unknown error, the response body from fetch is: ' + responseJsonData };

      // first check if we have a service error
      if (response && response.headers && response.headers.get('x-amzn-errortype')) {
        try {
          var code = response.headers.get('x-amzn-errortype').split(':')[0];
          error = {
            code: code,
            name: code,
            statusCode: response.status,
            message: response.status ? response.status.toString() : null
          };
        } catch (ex) {
          // pass through so it doesn't get swallowed if we can't parse it
          error = {
            code: 'UnknownError',
            message: response.headers.get('x-amzn-errortype')
          };
          return callback(error);
        }
        // otherwise check if error is Network error
      } else if (err instanceof Error && err.message === 'Network error') {
        error = {
          code: 'NetworkError',
          name: err.name,
          message: err.message
        };
      }
      return callback(error);
    });
  };

  return Client;
}();

export default Client;