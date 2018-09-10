"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*!
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
var AuthenticationDetails = function () {
  /**
   * Constructs a new AuthenticationDetails object
   * @param {object=} data Creation options.
   * @param {string} data.Username User being authenticated.
   * @param {string} data.Password Plain-text password to authenticate with.
   * @param {(AttributeArg[])?} data.ValidationData Application extra metadata.
   * @param {(AttributeArg[])?} data.AuthParamaters Authentication paramaters for custom auth.
   */
  function AuthenticationDetails(data) {
    _classCallCheck(this, AuthenticationDetails);

    var _ref = data || {},
        ValidationData = _ref.ValidationData,
        Username = _ref.Username,
        Password = _ref.Password,
        AuthParameters = _ref.AuthParameters;

    this.validationData = ValidationData || {};
    this.authParameters = AuthParameters || {};
    this.username = Username;
    this.password = Password;
  }

  /**
   * @returns {string} the record's username
   */


  AuthenticationDetails.prototype.getUsername = function getUsername() {
    return this.username;
  };

  /**
   * @returns {string} the record's password
   */


  AuthenticationDetails.prototype.getPassword = function getPassword() {
    return this.password;
  };

  /**
   * @returns {Array} the record's validationData
   */


  AuthenticationDetails.prototype.getValidationData = function getValidationData() {
    return this.validationData;
  };

  /**
   * @returns {Array} the record's authParameters
   */


  AuthenticationDetails.prototype.getAuthParameters = function getAuthParameters() {
    return this.authParameters;
  };

  return AuthenticationDetails;
}();

exports.default = AuthenticationDetails;