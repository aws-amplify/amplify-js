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

import { util } from 'aws-sdk/dist/aws-sdk-react-native';

import BigInteger from './BigInteger';
import AuthenticationHelper from './AuthenticationHelper';
import CognitoAccessToken from './CognitoAccessToken';
import CognitoIdToken from './CognitoIdToken';
import CognitoRefreshToken from './CognitoRefreshToken';
import CognitoUserSession from './CognitoUserSession';
import DateHelper from './DateHelper';
import CognitoUserAttribute from './CognitoUserAttribute';
import StorageHelper from './StorageHelper';

/**
 * @callback nodeCallback
 * @template T result
 * @param {*} err The operation failure reason, or null.
 * @param {T} result The operation result.
 */

/**
 * @callback onFailure
 * @param {*} err Failure reason.
 */

/**
 * @callback onSuccess
 * @template T result
 * @param {T} result The operation result.
 */

/**
 * @callback mfaRequired
 * @param {*} details MFA challenge details.
 */

/**
 * @callback customChallenge
 * @param {*} details Custom challenge details.
 */

/**
 * @callback inputVerificationCode
 * @param {*} data Server response.
 */

/**
 * @callback authSuccess
 * @param {CognitoUserSession} session The new session.
 * @param {bool=} userConfirmationNecessary User must be confirmed.
 */


/** @class */
export default class CognitoUser {
  /**
   * Constructs a new CognitoUser object
   * @param {object} data Creation options
   * @param {string} data.Username The user's username.
   * @param {CognitoUserPool} data.Pool Pool containing the user.
   * @param {object} data.Storage Optional storage object.
   */
  constructor(data) {
    if (data == null || data.Username == null || data.Pool == null) {
      throw new Error('Username and pool information are required.');
    }

    this.username = data.Username || '';
    this.pool = data.Pool;
    this.Session = null;

    this.client = data.Pool.client;

    this.signInUserSession = null;
    this.authenticationFlowType = 'USER_SRP_AUTH';

    this.storage = data.Storage || new StorageHelper().getStorage();
  }

  /**
   * Sets the session for this user
   * @param {CognitoUserSession} signInUserSession the session
   * @returns {void}
   */
  setSignInUserSession(signInUserSession) {
    this.clearCachedTokens();
    this.signInUserSession = signInUserSession;
    this.cacheTokens();
  }

  /**
   * @returns {CognitoUserSession} the current session for this user
   */
  getSignInUserSession() {
    return this.signInUserSession;
  }

  /**
   * @returns {string} the user's username
   */
  getUsername() {
    return this.username;
  }

  /**
   * @returns {String} the authentication flow type
   */
  getAuthenticationFlowType() {
    return this.authenticationFlowType;
  }

  /**
   * sets authentication flow type
   * @param {string} authenticationFlowType New value.
   * @returns {void}
   */
  setAuthenticationFlowType(authenticationFlowType) {
    this.authenticationFlowType = authenticationFlowType;
  }


  /**
   * This is used for authenticating the user through the custom authentication flow.
   * @param {AuthenticationDetails} authDetails Contains the authentication data
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {customChallenge} callback.customChallenge Custom challenge
   *        response required to continue.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   */
  initiateAuth(authDetails, callback) {
    const authParameters = authDetails.getAuthParameters();
    authParameters.USERNAME = this.username;

    this.client.makeUnauthenticatedRequest('initiateAuth', {
      AuthFlow: 'CUSTOM_AUTH',
      ClientId: this.pool.getClientId(),
      AuthParameters: authParameters,
      ClientMetadata: authDetails.getValidationData(),
    }, (err, data) => {
      if (err) {
        return callback.onFailure(err);
      }
      const challengeName = data.ChallengeName;
      const challengeParameters = data.ChallengeParameters;

      if (challengeName === 'CUSTOM_CHALLENGE') {
        this.Session = data.Session;
        return callback.customChallenge(challengeParameters);
      }
      this.signInUserSession = this.getCognitoUserSession(data.AuthenticationResult);
      this.cacheTokens();
      return callback.onSuccess(this.signInUserSession);
    });
  }

  /**
   * This is used for authenticating the user. it calls the AuthenticationHelper for SRP related
   * stuff
   * @param {AuthenticationDetails} authDetails Contains the authentication data
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {newPasswordRequired} callback.newPasswordRequired new
   *        password and any required attributes are required to continue
   * @param {mfaRequired} callback.mfaRequired MFA code
   *        required to continue.
   * @param {customChallenge} callback.customChallenge Custom challenge
   *        response required to continue.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   */
  authenticateUser(authDetails, callback) {
    const authenticationHelper = new AuthenticationHelper(
      this.pool.getUserPoolId().split('_')[1]);
    const dateHelper = new DateHelper();

    let serverBValue;
    let salt;
    const authParameters = {};

    if (this.deviceKey != null) {
      authParameters.DEVICE_KEY = this.deviceKey;
    }

    authParameters.USERNAME = this.username;
    authParameters.SRP_A = authenticationHelper.getLargeAValue().toString(16);

    if (this.authenticationFlowType === 'CUSTOM_AUTH') {
      authParameters.CHALLENGE_NAME = 'SRP_A';
    }

    this.client.makeUnauthenticatedRequest('initiateAuth', {
      AuthFlow: this.authenticationFlowType,
      ClientId: this.pool.getClientId(),
      AuthParameters: authParameters,
      ClientMetadata: authDetails.getValidationData(),
    }, (err, data) => {
      if (err) {
        return callback.onFailure(err);
      }

      const challengeParameters = data.ChallengeParameters;

      this.username = challengeParameters.USER_ID_FOR_SRP;
      serverBValue = new BigInteger(challengeParameters.SRP_B, 16);
      salt = new BigInteger(challengeParameters.SALT, 16);
      this.getCachedDeviceKeyAndPassword();

      const hkdf = authenticationHelper.getPasswordAuthenticationKey(
        this.username,
        authDetails.getPassword(),
        serverBValue,
        salt);

      const dateNow = dateHelper.getNowString();

      const signatureString = util.crypto.hmac(hkdf, util.buffer.concat([
        new util.Buffer(this.pool.getUserPoolId().split('_')[1], 'utf8'),
        new util.Buffer(this.username, 'utf8'),
        new util.Buffer(challengeParameters.SECRET_BLOCK, 'base64'),
        new util.Buffer(dateNow, 'utf8'),
      ]), 'base64', 'sha256');

      const challengeResponses = {};

      challengeResponses.USERNAME = this.username;
      challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK = challengeParameters.SECRET_BLOCK;
      challengeResponses.TIMESTAMP = dateNow;
      challengeResponses.PASSWORD_CLAIM_SIGNATURE = signatureString;

      if (this.deviceKey != null) {
        challengeResponses.DEVICE_KEY = this.deviceKey;
      }

      const respondToAuthChallenge = (challenge, challengeCallback) =>
        this.client.makeUnauthenticatedRequest('respondToAuthChallenge', challenge,
          (errChallenge, dataChallenge) => {
            if (errChallenge && errChallenge.code === 'ResourceNotFoundException' &&
                errChallenge.message.toLowerCase().indexOf('device') !== -1) {
              challengeResponses.DEVICE_KEY = null;
              this.deviceKey = null;
              this.randomPassword = null;
              this.deviceGroupKey = null;
              this.clearCachedDeviceKeyAndPassword();
              return respondToAuthChallenge(challenge, challengeCallback);
            }
            return challengeCallback(errChallenge, dataChallenge);
          });

      respondToAuthChallenge({
        ChallengeName: 'PASSWORD_VERIFIER',
        ClientId: this.pool.getClientId(),
        ChallengeResponses: challengeResponses,
        Session: data.Session,
      }, (errAuthenticate, dataAuthenticate) => {
        if (errAuthenticate) {
          return callback.onFailure(errAuthenticate);
        }

        const challengeName = dataAuthenticate.ChallengeName;
        if (challengeName === 'NEW_PASSWORD_REQUIRED') {
          this.Session = dataAuthenticate.Session;
          let userAttributes = null;
          let rawRequiredAttributes = null;
          const requiredAttributes = [];
          const userAttributesPrefix = authenticationHelper
            .getNewPasswordRequiredChallengeUserAttributePrefix();

          if (dataAuthenticate.ChallengeParameters) {
            userAttributes = JSON.parse(
              dataAuthenticate.ChallengeParameters.userAttributes);
            rawRequiredAttributes = JSON.parse(
              dataAuthenticate.ChallengeParameters.requiredAttributes);
          }

          if (rawRequiredAttributes) {
            for (let i = 0; i < rawRequiredAttributes.length; i++) {
              requiredAttributes[i] = rawRequiredAttributes[i].substr(userAttributesPrefix.length);
            }
          }
          return callback.newPasswordRequired(userAttributes, requiredAttributes);
        }
        return this.authenticateUserInternal(dataAuthenticate, authenticationHelper, callback);
      });
      return undefined;
    });
  }

  /**
  * PRIVATE ONLY: This is an internal only method and should not
  * be directly called by the consumers.
  * @param {object} dataAuthenticate authentication data
  * @param {object} authenticationHelper helper created
  * @param {callback} callback passed on from caller
  * @returns {void}
  */
  authenticateUserInternal(dataAuthenticate, authenticationHelper, callback) {
    const challengeName = dataAuthenticate.ChallengeName;
    const challengeParameters = dataAuthenticate.ChallengeParameters;

    if (challengeName === 'SMS_MFA') {
      this.Session = dataAuthenticate.Session;
      return callback.mfaRequired(challengeName, challengeParameters);
    }

    if (challengeName === 'CUSTOM_CHALLENGE') {
      this.Session = dataAuthenticate.Session;
      return callback.customChallenge(challengeParameters);
    }

    if (challengeName === 'DEVICE_SRP_AUTH') {
      this.getDeviceResponse(callback);
      return undefined;
    }

    this.signInUserSession = this.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
    this.cacheTokens();

    const newDeviceMetadata = dataAuthenticate.AuthenticationResult.NewDeviceMetadata;
    if (newDeviceMetadata == null) {
      return callback.onSuccess(this.signInUserSession);
    }

    authenticationHelper.generateHashDevice(
      dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey,
      dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey);

    const deviceSecretVerifierConfig = {
      Salt: new util.Buffer(
          authenticationHelper.getSaltDevices(), 'hex'
        ).toString('base64'),
      PasswordVerifier: new util.Buffer(
          authenticationHelper.getVerifierDevices(), 'hex'
        ).toString('base64'),
    };

    this.verifierDevices = deviceSecretVerifierConfig.PasswordVerifier;
    this.deviceGroupKey = newDeviceMetadata.DeviceGroupKey;
    this.randomPassword = authenticationHelper.getRandomPassword();

    this.client.makeUnauthenticatedRequest('confirmDevice', {
      DeviceKey: newDeviceMetadata.DeviceKey,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
      DeviceName: navigator.userAgent,
    }, (errConfirm, dataConfirm) => {
      if (errConfirm) {
        return callback.onFailure(errConfirm);
      }

      this.deviceKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
      this.cacheDeviceKeyAndPassword();
      if (dataConfirm.UserConfirmationNecessary === true) {
        return callback.onSuccess(
          this.signInUserSession, dataConfirm.UserConfirmationNecessary);
      }
      return callback.onSuccess(this.signInUserSession);
    });
    return undefined;
  }

  /**
  * This method is user to complete the NEW_PASSWORD_REQUIRED challenge.
  * Pass the new password with any new user attributes to be updated.
  * User attribute keys must be of format userAttributes.<attribute_name>.
  * @param {string} newPassword new password for this user
  * @param {object} requiredAttributeData map with values for all required attributes
  * @param {object} callback Result callback map.
  * @param {onFailure} callback.onFailure Called on any error.
  * @param {mfaRequired} callback.mfaRequired MFA code required to continue.
  * @param {customChallenge} callback.customChallenge Custom challenge
  *         response required to continue.
  * @param {authSuccess} callback.onSuccess Called on success with the new session.
  * @returns {void}
  */
  completeNewPasswordChallenge(newPassword, requiredAttributeData, callback) {
    if (!newPassword) {
      return callback.onFailure(new Error('New password is required.'));
    }
    const authenticationHelper = new AuthenticationHelper(
      this.pool.getUserPoolId().split('_')[1]);
    const userAttributesPrefix = authenticationHelper
      .getNewPasswordRequiredChallengeUserAttributePrefix();

    const finalUserAttributes = {};
    if (requiredAttributeData) {
      Object.keys(requiredAttributeData).forEach((key) => {
        finalUserAttributes[userAttributesPrefix + key] = requiredAttributeData[key];
      });
    }

    finalUserAttributes.NEW_PASSWORD = newPassword;
    finalUserAttributes.USERNAME = this.username;
    this.client.makeUnauthenticatedRequest('respondToAuthChallenge', {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: this.pool.getClientId(),
      ChallengeResponses: finalUserAttributes,
      Session: this.Session,
    }, (errAuthenticate, dataAuthenticate) => {
      if (errAuthenticate) {
        return callback.onFailure(errAuthenticate);
      }
      return this.authenticateUserInternal(dataAuthenticate, authenticationHelper, callback);
    });
    return undefined;
  }

  /**
   * This is used to get a session using device authentication. It is called at the end of user
   * authentication
   *
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   * @private
   */
  getDeviceResponse(callback) {
    const authenticationHelper = new AuthenticationHelper(
      this.deviceGroupKey);
    const dateHelper = new DateHelper();

    const authParameters = {};

    authParameters.USERNAME = this.username;
    authParameters.DEVICE_KEY = this.deviceKey;
    authParameters.SRP_A = authenticationHelper.getLargeAValue().toString(16);

    this.client.makeUnauthenticatedRequest('respondToAuthChallenge', {
      ChallengeName: 'DEVICE_SRP_AUTH',
      ClientId: this.pool.getClientId(),
      ChallengeResponses: authParameters,
    }, (err, data) => {
      if (err) {
        return callback.onFailure(err);
      }

      const challengeParameters = data.ChallengeParameters;

      const serverBValue = new BigInteger(challengeParameters.SRP_B, 16);
      const salt = new BigInteger(challengeParameters.SALT, 16);

      const hkdf = authenticationHelper.getPasswordAuthenticationKey(
        this.deviceKey,
        this.randomPassword,
        serverBValue,
        salt);

      const dateNow = dateHelper.getNowString();

      const signatureString = util.crypto.hmac(hkdf, util.buffer.concat([
        new util.Buffer(this.deviceGroupKey, 'utf8'),
        new util.Buffer(this.deviceKey, 'utf8'),
        new util.Buffer(challengeParameters.SECRET_BLOCK, 'base64'),
        new util.Buffer(dateNow, 'utf8'),
      ]), 'base64', 'sha256');

      const challengeResponses = {};

      challengeResponses.USERNAME = this.username;
      challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK = challengeParameters.SECRET_BLOCK;
      challengeResponses.TIMESTAMP = dateNow;
      challengeResponses.PASSWORD_CLAIM_SIGNATURE = signatureString;
      challengeResponses.DEVICE_KEY = this.deviceKey;

      this.client.makeUnauthenticatedRequest('respondToAuthChallenge', {
        ChallengeName: 'DEVICE_PASSWORD_VERIFIER',
        ClientId: this.pool.getClientId(),
        ChallengeResponses: challengeResponses,
        Session: data.Session,
      }, (errAuthenticate, dataAuthenticate) => {
        if (errAuthenticate) {
          return callback.onFailure(errAuthenticate);
        }

        this.signInUserSession = this.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
        this.cacheTokens();

        return callback.onSuccess(this.signInUserSession);
      });
      return undefined;
    });
  }

  /**
   * This is used for a certain user to confirm the registration by using a confirmation code
   * @param {string} confirmationCode Code entered by user.
   * @param {bool} forceAliasCreation Allow migrating from an existing email / phone number.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */
  confirmRegistration(confirmationCode, forceAliasCreation, callback) {
    this.client.makeUnauthenticatedRequest('confirmSignUp', {
      ClientId: this.pool.getClientId(),
      ConfirmationCode: confirmationCode,
      Username: this.username,
      ForceAliasCreation: forceAliasCreation,
    }, err => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
  }

  /**
   * This is used by the user once he has the responses to a custom challenge
   * @param {string} answerChallenge The custom challange answer.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {customChallenge} callback.customChallenge
   *    Custom challenge response required to continue.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   */
  sendCustomChallengeAnswer(answerChallenge, callback) {
    const challengeResponses = {};
    challengeResponses.USERNAME = this.username;
    challengeResponses.ANSWER = answerChallenge;

    this.client.makeUnauthenticatedRequest('respondToAuthChallenge', {
      ChallengeName: 'CUSTOM_CHALLENGE',
      ChallengeResponses: challengeResponses,
      ClientId: this.pool.getClientId(),
      Session: this.Session,
    }, (err, data) => {
      if (err) {
        return callback.onFailure(err);
      }

      const challengeName = data.ChallengeName;

      if (challengeName === 'CUSTOM_CHALLENGE') {
        this.Session = data.Session;
        return callback.customChallenge(data.ChallengeParameters);
      }

      this.signInUserSession = this.getCognitoUserSession(data.AuthenticationResult);
      this.cacheTokens();
      return callback.onSuccess(this.signInUserSession);
    });
  }

  /**
   * This is used by the user once he has an MFA code
   * @param {string} confirmationCode The MFA code entered by the user.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   */
  sendMFACode(confirmationCode, callback) {
    const challengeResponses = {};
    challengeResponses.USERNAME = this.username;
    challengeResponses.SMS_MFA_CODE = confirmationCode;

    if (this.deviceKey != null) {
      challengeResponses.DEVICE_KEY = this.deviceKey;
    }

    this.client.makeUnauthenticatedRequest('respondToAuthChallenge', {
      ChallengeName: 'SMS_MFA',
      ChallengeResponses: challengeResponses,
      ClientId: this.pool.getClientId(),
      Session: this.Session,
    }, (err, dataAuthenticate) => {
      if (err) {
        return callback.onFailure(err);
      }

      const challengeName = dataAuthenticate.ChallengeName;

      if (challengeName === 'DEVICE_SRP_AUTH') {
        this.getDeviceResponse(callback);
        return undefined;
      }

      this.signInUserSession = this.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
      this.cacheTokens();

      if (dataAuthenticate.AuthenticationResult.NewDeviceMetadata == null) {
        return callback.onSuccess(this.signInUserSession);
      }

      const authenticationHelper = new AuthenticationHelper(
        this.pool.getUserPoolId().split('_')[1]);
      authenticationHelper.generateHashDevice(
        dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey,
        dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey);

      const deviceSecretVerifierConfig = {
        Salt: new util.Buffer(
            authenticationHelper.getSaltDevices(), 'hex'
          ).toString('base64'),
        PasswordVerifier: new util.Buffer(
            authenticationHelper.getVerifierDevices(), 'hex'
          ).toString('base64'),
      };

      this.verifierDevices = deviceSecretVerifierConfig.PasswordVerifier;
      this.deviceGroupKey = dataAuthenticate.AuthenticationResult
        .NewDeviceMetadata.DeviceGroupKey;
      this.randomPassword = authenticationHelper.getRandomPassword();

      this.client.makeUnauthenticatedRequest('confirmDevice', {
        DeviceKey: dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey,
        AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
        DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
        DeviceName: navigator.userAgent,
      }, (errConfirm, dataConfirm) => {
        if (errConfirm) {
          return callback.onFailure(errConfirm);
        }

        this.deviceKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
        this.cacheDeviceKeyAndPassword();
        if (dataConfirm.UserConfirmationNecessary === true) {
          return callback.onSuccess(
            this.signInUserSession,
            dataConfirm.UserConfirmationNecessary);
        }
        return callback.onSuccess(this.signInUserSession);
      });
      return undefined;
    });
  }

  /**
   * This is used by an authenticated user to change the current password
   * @param {string} oldUserPassword The current password.
   * @param {string} newUserPassword The requested new password.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */
  changePassword(oldUserPassword, newUserPassword, callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.makeUnauthenticatedRequest('changePassword', {
      PreviousPassword: oldUserPassword,
      ProposedPassword: newUserPassword,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
    }, err => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used by an authenticated user to enable MFA for himself
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */
  enableMFA(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }

    const mfaOptions = [];
    const mfaEnabled = {
      DeliveryMedium: 'SMS',
      AttributeName: 'phone_number',
    };
    mfaOptions.push(mfaEnabled);

    this.client.makeUnauthenticatedRequest('setUserSettings', {
      MFAOptions: mfaOptions,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
    }, err => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used by an authenticated user to disable MFA for himself
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */
  disableMFA(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }

    const mfaOptions = [];

    this.client.makeUnauthenticatedRequest('setUserSettings', {
      MFAOptions: mfaOptions,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
    }, err => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }


  /**
   * This is used by an authenticated user to delete himself
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */
  deleteUser(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.makeUnauthenticatedRequest('deleteUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
    }, err => {
      if (err) {
        return callback(err, null);
      }
      this.clearCachedTokens();
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }

  /**
   * @typedef {CognitoUserAttribute | { Name:string, Value:string }} AttributeArg
   */
  /**
   * This is used by an authenticated user to change a list of attributes
   * @param {AttributeArg[]} attributes A list of the new user attributes.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */
  updateAttributes(attributes, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.makeUnauthenticatedRequest('updateUserAttributes', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      UserAttributes: attributes,
    }, err => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used by an authenticated user to get a list of attributes
   * @param {nodeCallback<CognitoUserAttribute[]>} callback Called on success or error.
   * @returns {void}
   */
  getUserAttributes(callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.makeUnauthenticatedRequest('getUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
    }, (err, userData) => {
      if (err) {
        return callback(err, null);
      }

      const attributeList = [];

      for (let i = 0; i < userData.UserAttributes.length; i++) {
        const attribute = {
          Name: userData.UserAttributes[i].Name,
          Value: userData.UserAttributes[i].Value,
        };
        const userAttribute = new CognitoUserAttribute(attribute);
        attributeList.push(userAttribute);
      }

      return callback(null, attributeList);
    });
    return undefined;
  }

  /**
   * This is used by an authenticated user to get the MFAOptions
   * @param {nodeCallback<MFAOptions>} callback Called on success or error.
   * @returns {void}
   */
  getMFAOptions(callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.makeUnauthenticatedRequest('getUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
    }, (err, userData) => {
      if (err) {
        return callback(err, null);
      }

      return callback(null, userData.MFAOptions);
    });
    return undefined;
  }

  /**
   * This is used by an authenticated user to delete a list of attributes
   * @param {string[]} attributeList Names of the attributes to delete.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */
  deleteAttributes(attributeList, callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.makeUnauthenticatedRequest('deleteUserAttributes', {
      UserAttributeNames: attributeList,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
    }, err => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used by a user to resend a confirmation code
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */
  resendConfirmationCode(callback) {
    this.client.makeUnauthenticatedRequest('resendConfirmationCode', {
      ClientId: this.pool.getClientId(),
      Username: this.username,
    }, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, result);
    });
  }

  /**
   * This is used to get a session, either from the session object
   * or from  the local storage, or by using a refresh token
   *
   * @param {nodeCallback<CognitoUserSession>} callback Called on success or error.
   * @returns {void}
   */
  getSession(callback) {
    if (this.username == null) {
      return callback(new Error('Username is null. Cannot retrieve a new session'), null);
    }

    if (this.signInUserSession != null && this.signInUserSession.isValid()) {
      return callback(null, this.signInUserSession);
    }

    const keyPrefix = `CognitoIdentityServiceProvider.${this.pool.getClientId()}.${this.username}`;
    const idTokenKey = `${keyPrefix}.idToken`;
    const accessTokenKey = `${keyPrefix}.accessToken`;
    const refreshTokenKey = `${keyPrefix}.refreshToken`;
    const clockDriftKey = `${keyPrefix}.clockDrift`;

    if (this.storage.getItem(idTokenKey)) {
      const idToken = new CognitoIdToken({
        IdToken: this.storage.getItem(idTokenKey),
      });
      const accessToken = new CognitoAccessToken({
        AccessToken: this.storage.getItem(accessTokenKey),
      });
      const refreshToken = new CognitoRefreshToken({
        RefreshToken: this.storage.getItem(refreshTokenKey),
      });
      const clockDrift = parseInt(this.storage.getItem(clockDriftKey), 0) || 0;

      const sessionData = {
        IdToken: idToken,
        AccessToken: accessToken,
        RefreshToken: refreshToken,
        ClockDrift: clockDrift,
      };
      const cachedSession = new CognitoUserSession(sessionData);
      if (cachedSession.isValid()) {
        this.signInUserSession = cachedSession;
        return callback(null, this.signInUserSession);
      }

      if (refreshToken.getToken() == null) {
        return callback(new Error('Cannot retrieve a new session. Please authenticate.'), null);
      }

      this.refreshSession(refreshToken, callback);
    } else {
      callback(new Error('Local storage is missing an ID Token, Please authenticate'), null);
    }

    return undefined;
  }


  /**
   * This uses the refreshToken to retrieve a new session
   * @param {CognitoRefreshToken} refreshToken A previous session's refresh token.
   * @param {nodeCallback<CognitoUserSession>} callback Called on success or error.
   * @returns {void}
   */
  refreshSession(refreshToken, callback) {
    const authParameters = {};
    authParameters.REFRESH_TOKEN = refreshToken.getToken();
    const keyPrefix = `CognitoIdentityServiceProvider.${this.pool.getClientId()}`;
    const lastUserKey = `${keyPrefix}.LastAuthUser`;

    if (this.storage.getItem(lastUserKey)) {
      this.username = this.storage.getItem(lastUserKey);
      const deviceKeyKey = `${keyPrefix}.${this.username}.deviceKey`;
      this.deviceKey = this.storage.getItem(deviceKeyKey);
      authParameters.DEVICE_KEY = this.deviceKey;
    }

    this.client.makeUnauthenticatedRequest('initiateAuth', {
      ClientId: this.pool.getClientId(),
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: authParameters,
    }, (err, authResult) => {
      if (err) {
        if (err.code === 'NotAuthorizedException') {
          this.clearCachedTokens();
        }
        return callback(err, null);
      }
      if (authResult) {
        const authenticationResult = authResult.AuthenticationResult;
        if (!Object.prototype.hasOwnProperty.call(authenticationResult, 'RefreshToken')) {
          authenticationResult.RefreshToken = refreshToken.getToken();
        }
        this.signInUserSession = this.getCognitoUserSession(authenticationResult);
        this.cacheTokens();
        return callback(null, this.signInUserSession);
      }
      return undefined;
    });
  }

  /**
   * This is used to save the session tokens to local storage
   * @returns {void}
   */
  cacheTokens() {
    const keyPrefix = `CognitoIdentityServiceProvider.${this.pool.getClientId()}`;
    const idTokenKey = `${keyPrefix}.${this.username}.idToken`;
    const accessTokenKey = `${keyPrefix}.${this.username}.accessToken`;
    const refreshTokenKey = `${keyPrefix}.${this.username}.refreshToken`;
    const clockDriftKey = `${keyPrefix}.${this.username}.clockDrift`;
    const lastUserKey = `${keyPrefix}.LastAuthUser`;

    this.storage.setItem(idTokenKey, this.signInUserSession.getIdToken().getJwtToken());
    this.storage.setItem(accessTokenKey, this.signInUserSession.getAccessToken().getJwtToken());
    this.storage.setItem(refreshTokenKey, this.signInUserSession.getRefreshToken().getToken());
    this.storage.setItem(clockDriftKey, this.signInUserSession.getClockDrift());
    this.storage.setItem(lastUserKey, this.username);
  }

  /**
   * This is used to cache the device key and device group and device password
   * @returns {void}
   */
  cacheDeviceKeyAndPassword() {
    const keyPrefix = `CognitoIdentityServiceProvider.${this.pool.getClientId()}.${this.username}`;
    const deviceKeyKey = `${keyPrefix}.deviceKey`;
    const randomPasswordKey = `${keyPrefix}.randomPasswordKey`;
    const deviceGroupKeyKey = `${keyPrefix}.deviceGroupKey`;

    this.storage.setItem(deviceKeyKey, this.deviceKey);
    this.storage.setItem(randomPasswordKey, this.randomPassword);
    this.storage.setItem(deviceGroupKeyKey, this.deviceGroupKey);
  }

  /**
   * This is used to get current device key and device group and device password
   * @returns {void}
   */
  getCachedDeviceKeyAndPassword() {
    const keyPrefix = `CognitoIdentityServiceProvider.${this.pool.getClientId()}.${this.username}`;
    const deviceKeyKey = `${keyPrefix}.deviceKey`;
    const randomPasswordKey = `${keyPrefix}.randomPasswordKey`;
    const deviceGroupKeyKey = `${keyPrefix}.deviceGroupKey`;

    if (this.storage.getItem(deviceKeyKey)) {
      this.deviceKey = this.storage.getItem(deviceKeyKey);
      this.randomPassword = this.storage.getItem(randomPasswordKey);
      this.deviceGroupKey = this.storage.getItem(deviceGroupKeyKey);
    }
  }

  /**
   * This is used to clear the device key info from local storage
   * @returns {void}
   */
  clearCachedDeviceKeyAndPassword() {
    const keyPrefix = `CognitoIdentityServiceProvider.${this.pool.getClientId()}.${this.username}`;
    const deviceKeyKey = `${keyPrefix}.deviceKey`;
    const randomPasswordKey = `${keyPrefix}.randomPasswordKey`;
    const deviceGroupKeyKey = `${keyPrefix}.deviceGroupKey`;

    this.storage.removeItem(deviceKeyKey);
    this.storage.removeItem(randomPasswordKey);
    this.storage.removeItem(deviceGroupKeyKey);
  }

  /**
   * This is used to clear the session tokens from local storage
   * @returns {void}
   */
  clearCachedTokens() {
    const keyPrefix = `CognitoIdentityServiceProvider.${this.pool.getClientId()}`;
    const idTokenKey = `${keyPrefix}.${this.username}.idToken`;
    const accessTokenKey = `${keyPrefix}.${this.username}.accessToken`;
    const refreshTokenKey = `${keyPrefix}.${this.username}.refreshToken`;
    const lastUserKey = `${keyPrefix}.LastAuthUser`;

    this.storage.removeItem(idTokenKey);
    this.storage.removeItem(accessTokenKey);
    this.storage.removeItem(refreshTokenKey);
    this.storage.removeItem(lastUserKey);
  }

  /**
   * This is used to build a user session from tokens retrieved in the authentication result
   * @param {object} authResult Successful auth response from server.
   * @returns {CognitoUserSession} The new user session.
   * @private
   */
  getCognitoUserSession(authResult) {
    const idToken = new CognitoIdToken(authResult);
    const accessToken = new CognitoAccessToken(authResult);
    const refreshToken = new CognitoRefreshToken(authResult);

    const sessionData = {
      IdToken: idToken,
      AccessToken: accessToken,
      RefreshToken: refreshToken,
    };

    return new CognitoUserSession(sessionData);
  }

  /**
   * This is used to initiate a forgot password request
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {inputVerificationCode?} callback.inputVerificationCode
   *    Optional callback raised instead of onSuccess with response data.
   * @param {onSuccess} callback.onSuccess Called on success.
   * @returns {void}
   */
  forgotPassword(callback) {
    this.client.makeUnauthenticatedRequest('forgotPassword', {
      ClientId: this.pool.getClientId(),
      Username: this.username,
    }, (err, data) => {
      if (err) {
        return callback.onFailure(err);
      }
      if (typeof callback.inputVerificationCode === 'function') {
        return callback.inputVerificationCode(data);
      }
      return callback.onSuccess(data);
    });
  }

  /**
   * This is used to confirm a new password using a confirmationCode
   * @param {string} confirmationCode Code entered by user.
   * @param {string} newPassword Confirm new password.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<void>} callback.onSuccess Called on success.
   * @returns {void}
   */
  confirmPassword(confirmationCode, newPassword, callback) {
    this.client.makeUnauthenticatedRequest('confirmForgotPassword', {
      ClientId: this.pool.getClientId(),
      Username: this.username,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    }, err => {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess();
    });
  }

  /**
   * This is used to initiate an attribute confirmation request
   * @param {string} attributeName User attribute that needs confirmation.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {inputVerificationCode} callback.inputVerificationCode Called on success.
   * @returns {void}
   */
  getAttributeVerificationCode(attributeName, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.makeUnauthenticatedRequest('getUserAttributeVerificationCode', {
      AttributeName: attributeName,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
    }, (err, data) => {
      if (err) {
        return callback.onFailure(err);
      }
      if (typeof callback.inputVerificationCode === 'function') {
        return callback.inputVerificationCode(data);
      }
      return callback.onSuccess();
    });
    return undefined;
  }

  /**
   * This is used to confirm an attribute using a confirmation code
   * @param {string} attributeName Attribute being confirmed.
   * @param {string} confirmationCode Code entered by user.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */
  verifyAttribute(attributeName, confirmationCode, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.makeUnauthenticatedRequest('verifyUserAttribute', {
      AttributeName: attributeName,
      Code: confirmationCode,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
    }, err => {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used to get the device information using the current device key
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<*>} callback.onSuccess Called on success with device data.
   * @returns {void}
   */
  getDevice(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.makeUnauthenticatedRequest('getDevice', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: this.deviceKey,
    }, (err, data) => {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess(data);
    });
    return undefined;
  }

  /**
   * This is used to forget a specific device
   * @param {string} deviceKey Device key.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */
  forgetSpecificDevice(deviceKey, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.makeUnauthenticatedRequest('forgetDevice', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: deviceKey,
    }, err => {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used to forget the current device
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */
  forgetDevice(callback) {
    this.forgetSpecificDevice(this.deviceKey, {
      onFailure: callback.onFailure,
      onSuccess: result => {
        this.deviceKey = null;
        this.deviceGroupKey = null;
        this.randomPassword = null;
        this.clearCachedDeviceKeyAndPassword();
        return callback.onSuccess(result);
      },
    });
  }

  /**
   * This is used to set the device status as remembered
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */
  setDeviceStatusRemembered(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.makeUnauthenticatedRequest('updateDeviceStatus', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: this.deviceKey,
      DeviceRememberedStatus: 'remembered',
    }, err => {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used to set the device status as not remembered
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */
  setDeviceStatusNotRemembered(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.makeUnauthenticatedRequest('updateDeviceStatus', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: this.deviceKey,
      DeviceRememberedStatus: 'not_remembered',
    }, err => {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used to list all devices for a user
   *
   * @param {int} limit the number of devices returned in a call
   * @param {string} paginationToken the pagination token in case any was returned before
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<*>} callback.onSuccess Called on success with device list.
   * @returns {void}
   */
  listDevices(limit, paginationToken, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.makeUnauthenticatedRequest('listDevices', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      Limit: limit,
      PaginationToken: paginationToken,
    }, (err, data) => {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess(data);
    });
    return undefined;
  }

  /**
   * This is used to globally revoke all tokens issued to a user
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */
  globalSignOut(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.makeUnauthenticatedRequest('globalSignOut', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
    }, err => {
      if (err) {
        return callback.onFailure(err);
      }
      this.clearCachedTokens();
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used for the user to signOut of the application and clear the cached tokens.
   * @returns {void}
   */
  signOut() {
    this.signInUserSession = null;
    this.clearCachedTokens();
  }
}
