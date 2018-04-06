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

    fetch(this.endpoint, options).then(function (resp) {
      response = resp;
      return resp;
    }).then(function (resp) {
      return resp.json().catch(function () {
        return {};
      });
    }).then(function (data) {
      if (response.ok) return callback(null, data);

      // Taken from aws-sdk-js/lib/protocol/json.js
      // eslint-disable-next-line no-underscore-dangle
      var code = (data.__type || data.code).split('#').pop();
      var error = {
        code: code,
        name: code,
        message: data.message || data.Message || null
      };
      return callback(error);
    }).catch(function () {
      // Taken from aws-sdk-js/lib/protocol/json.js
      var code = (response.headers.get('x-amzn-errortype') || 'UnknownError').split(':')[0];
      var error = {
        code: code,
        name: code,
        statusCode: response.status,
        message: response.status.toString()
      };
      return callback(error);
    });
  };

  return Client;
}();

export default Client;