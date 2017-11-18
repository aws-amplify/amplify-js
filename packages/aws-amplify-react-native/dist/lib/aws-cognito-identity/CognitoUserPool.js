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

import { CognitoIdentityServiceProvider } from 'aws-sdk/dist/aws-sdk-react-native';

import CognitoUser from './CognitoUser';
import StorageHelper from './StorageHelper';

/** @class */
export default class CognitoUserPool {
  /**
   * Constructs a new CognitoUserPool object
   * @param {object} data Creation options.
   * @param {string} data.UserPoolId Cognito user pool id.
   * @param {string} data.ClientId User pool application client id.
   * @param {object} data.Storage Optional storage object.
   */
  constructor(data) {
    const { UserPoolId, ClientId, endpoint } = data || {};
    if (!UserPoolId || !ClientId) {
      throw new Error('Both UserPoolId and ClientId are required.');
    }
    if (!/^[\w-]+_.+$/.test(UserPoolId)) {
      throw new Error('Invalid UserPoolId format.');
    }
    const region = UserPoolId.split('_')[0];

    this.userPoolId = UserPoolId;
    this.clientId = ClientId;

    this.client = new CognitoIdentityServiceProvider({
      apiVersion: '2016-04-19',
      region,
      endpoint
    });

    this.storage = data.Storage || new StorageHelper().getStorage();
  }

  /**
   * @returns {string} the user pool id
   */
  getUserPoolId() {
    return this.userPoolId;
  }

  /**
   * @returns {string} the client id
   */
  getClientId() {
    return this.clientId;
  }

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
  signUp(username, password, userAttributes, validationData, callback) {
    this.client.makeUnauthenticatedRequest('signUp', {
      ClientId: this.clientId,
      Username: username,
      Password: password,
      UserAttributes: userAttributes,
      ValidationData: validationData
    }, (err, data) => {
      if (err) {
        return callback(err, null);
      }

      const cognitoUser = {
        Username: username,
        Pool: this,
        Storage: this.storage
      };

      const returnData = {
        user: new CognitoUser(cognitoUser),
        userConfirmed: data.UserConfirmed,
        userSub: data.UserSub
      };

      return callback(null, returnData);
    });
  }

  /**
   * method for getting the current user of the application from the local storage
   *
   * @returns {CognitoUser} the user retrieved from storage
   */
  getCurrentUser() {
    const lastUserKey = `CognitoIdentityServiceProvider.${this.clientId}.LastAuthUser`;

    const lastAuthUser = this.storage.getItem(lastUserKey);
    if (lastAuthUser) {
      const cognitoUser = {
        Username: lastAuthUser,
        Pool: this,
        Storage: this.storage
      };

      return new CognitoUser(cognitoUser);
    }

    return null;
  }
}