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

import Client from './Client';
import CognitoUser from './CognitoUser';
import StorageHelper from './StorageHelper';

/** @class */

var CognitoUserPool = function () {
  /**
   * Constructs a new CognitoUserPool object
   * @param {object} data Creation options.
   * @param {string} data.UserPoolId Cognito user pool id.
   * @param {string} data.ClientId User pool application client id.
   * @param {object} data.Storage Optional storage object.
   * @param {boolean} data.AdvancedSecurityDataCollectionFlag Optional:
   *        boolean flag indicating if the data collection is enabled
   *        to support cognito advanced security features. By default, this
   *        flag is set to true.
   */
  function CognitoUserPool(data) {
    _classCallCheck(this, CognitoUserPool);

    var _ref = data || {},
        UserPoolId = _ref.UserPoolId,
        ClientId = _ref.ClientId,
        endpoint = _ref.endpoint,
        AdvancedSecurityDataCollectionFlag = _ref.AdvancedSecurityDataCollectionFlag;

    if (!UserPoolId || !ClientId) {
      throw new Error('Both UserPoolId and ClientId are required.');
    }
    if (!/^[\w-]+_.+$/.test(UserPoolId)) {
      throw new Error('Invalid UserPoolId format.');
    }
    var region = UserPoolId.split('_')[0];

    this.userPoolId = UserPoolId;
    this.clientId = ClientId;

    this.client = new Client(region, endpoint);

    /**
     * By default, AdvancedSecurityDataCollectionFlag is set to true,
     * if no input value is provided.
     */
    this.advancedSecurityDataCollectionFlag = AdvancedSecurityDataCollectionFlag !== false;

    this.storage = data.Storage || new StorageHelper().getStorage();
  }

  /**
   * @returns {string} the user pool id
   */


  CognitoUserPool.prototype.getUserPoolId = function getUserPoolId() {
    return this.userPoolId;
  };

  /**
   * @returns {string} the client id
   */


  CognitoUserPool.prototype.getClientId = function getClientId() {
    return this.clientId;
  };

  /**
   * @typedef {object} SignUpResult
   * @property {CognitoUser} user New user.
   * @property {bool} userConfirmed If the user is already confirmed.
   */
  /**
   * method for signing up a user
   * @param {string} username User's username.
   * @param {string} password Plain-text initial password entered by user.
   * @param {(AttributeArg[])=} userAttributes New user attributes.
   * @param {(AttributeArg[])=} validationData Application metadata.
   * @param {nodeCallback<SignUpResult>} callback Called on error or with the new user.
   * @returns {void}
   */


  CognitoUserPool.prototype.signUp = function signUp(username, password, userAttributes, validationData, callback) {
    var _this = this;

    var jsonReq = {
      ClientId: this.clientId,
      Username: username,
      Password: password,
      UserAttributes: userAttributes,
      ValidationData: validationData
    };
    if (this.getUserContextData(username)) {
      jsonReq.UserContextData = this.getUserContextData(username);
    }
    this.client.request('SignUp', jsonReq, function (err, data) {
      if (err) {
        return callback(err, null);
      }

      var cognitoUser = {
        Username: username,
        Pool: _this,
        Storage: _this.storage
      };

      var returnData = {
        user: new CognitoUser(cognitoUser),
        userConfirmed: data.UserConfirmed,
        userSub: data.UserSub
      };

      return callback(null, returnData);
    });
  };

  /**
   * method for getting the current user of the application from the local storage
   *
   * @returns {CognitoUser} the user retrieved from storage
   */


  CognitoUserPool.prototype.getCurrentUser = function getCurrentUser() {
    var lastUserKey = 'CognitoIdentityServiceProvider.' + this.clientId + '.LastAuthUser';

    var lastAuthUser = this.storage.getItem(lastUserKey);
    if (lastAuthUser) {
      var cognitoUser = {
        Username: lastAuthUser,
        Pool: this,
        Storage: this.storage
      };

      return new CognitoUser(cognitoUser);
    }

    return null;
  };

  /**
   * This method returns the encoded data string used for cognito advanced security feature.
   * This would be generated only when developer has included the JS used for collecting the
   * data on their client. Please refer to documentation to know more about using AdvancedSecurity
   * features
   * @param {string} username the username for the context data
   * @returns {string} the user context data
   **/


  CognitoUserPool.prototype.getUserContextData = function getUserContextData(username) {
    if (typeof AmazonCognitoAdvancedSecurityData === 'undefined') {
      return undefined;
    }
    /* eslint-disable */
    var amazonCognitoAdvancedSecurityDataConst = AmazonCognitoAdvancedSecurityData;
    /* eslint-enable */

    if (this.advancedSecurityDataCollectionFlag) {
      var advancedSecurityData = amazonCognitoAdvancedSecurityDataConst.getData(username, this.userPoolId, this.clientId);
      if (advancedSecurityData) {
        var userContextData = {
          EncodedData: advancedSecurityData
        };
        return userContextData;
      }
    }
    return {};
  };

  return CognitoUserPool;
}();

export default CognitoUserPool;