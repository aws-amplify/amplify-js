'use strict';

exports.__esModule = true;

var _buffer = require('buffer/');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*!
                                                                                                                                                           * Copyright 2016 Amazon.com,
                                                                                                                                                           * Inc. or its affiliates. All Rights Reserved.
                                                                                                                                                           *
                                                                                                                                                           * Licensed under the Amazon Software License (the "License").
                                                                                                                                                           * You may not use this file except in compliance with the
                                                                                                                                                           * License. A copy of the License is located at
                                                                                                                                                           *
                                                                                                                                                           *     http://aws.amazon.com/asl/
                                                                                                                                                           *
                                                                                                                                                           * or in the "license" file accompanying this file. This file is
                                                                                                                                                           * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
                                                                                                                                                           * CONDITIONS OF ANY KIND, express or implied. See the License
                                                                                                                                                           * for the specific language governing permissions and
                                                                                                                                                           * limitations under the License.
                                                                                                                                                           */

/** @class */
var CognitoJwtToken = function () {
  /**
   * Constructs a new CognitoJwtToken object
   * @param {string=} token The JWT token.
   */
  function CognitoJwtToken(token) {
    _classCallCheck(this, CognitoJwtToken);

    // Assign object
    this.jwtToken = token || '';
    this.payload = this.decodePayload();
  }

  /**
   * @returns {string} the record's token.
   */


  CognitoJwtToken.prototype.getJwtToken = function getJwtToken() {
    return this.jwtToken;
  };

  /**
   * @returns {int} the token's expiration (exp member).
   */


  CognitoJwtToken.prototype.getExpiration = function getExpiration() {
    return this.payload.exp;
  };

  /**
   * @returns {int} the token's "issued at" (iat member).
   */


  CognitoJwtToken.prototype.getIssuedAt = function getIssuedAt() {
    return this.payload.iat;
  };

  /**
   * @returns {object} the token's payload.
   */


  CognitoJwtToken.prototype.decodePayload = function decodePayload() {
    var payload = this.jwtToken.split('.')[1];
    try {
      return JSON.parse(_buffer.Buffer.from(payload, 'base64').toString('utf8'));
    } catch (err) {
      return {};
    }
  };

  return CognitoJwtToken;
}();

exports.default = CognitoJwtToken;