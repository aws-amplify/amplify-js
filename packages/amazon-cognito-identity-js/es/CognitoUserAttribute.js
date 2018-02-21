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
var CognitoUserAttribute = function () {
  /**
   * Constructs a new CognitoUserAttribute object
   * @param {string=} Name The record's name
   * @param {string=} Value The record's value
   */
  function CognitoUserAttribute() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        Name = _ref.Name,
        Value = _ref.Value;

    _classCallCheck(this, CognitoUserAttribute);

    this.Name = Name || '';
    this.Value = Value || '';
  }

  /**
   * @returns {string} the record's value.
   */


  CognitoUserAttribute.prototype.getValue = function getValue() {
    return this.Value;
  };

  /**
   * Sets the record's value.
   * @param {string} value The new value.
   * @returns {CognitoUserAttribute} The record for method chaining.
   */


  CognitoUserAttribute.prototype.setValue = function setValue(value) {
    this.Value = value;
    return this;
  };

  /**
   * @returns {string} the record's name.
   */


  CognitoUserAttribute.prototype.getName = function getName() {
    return this.Name;
  };

  /**
   * Sets the record's name
   * @param {string} name The new name.
   * @returns {CognitoUserAttribute} The record for method chaining.
   */


  CognitoUserAttribute.prototype.setName = function setName(name) {
    this.Name = name;
    return this;
  };

  /**
   * @returns {string} a string representation of the record.
   */


  CognitoUserAttribute.prototype.toString = function toString() {
    return JSON.stringify(this);
  };

  /**
   * @returns {object} a flat object representing the record.
   */


  CognitoUserAttribute.prototype.toJSON = function toJSON() {
    return {
      Name: this.Name,
      Value: this.Value
    };
  };

  return CognitoUserAttribute;
}();

export default CognitoUserAttribute;