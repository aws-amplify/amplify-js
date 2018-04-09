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

import { Buffer } from 'buffer/';
//import createHmac from 'create-hmac';
import * as crypto from 'crypto-browserify';
var createHmac = crypto.createHmac;

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

var CognitoUser = function () {
  /**
   * Constructs a new CognitoUser object
   * @param {object} data Creation options
   * @param {string} data.Username The user's username.
   * @param {CognitoUserPool} data.Pool Pool containing the user.
   * @param {object} data.Storage Optional storage object.
   */
  function CognitoUser(data) {
    _classCallCheck(this, CognitoUser);

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


  CognitoUser.prototype.setSignInUserSession = function setSignInUserSession(signInUserSession) {
    this.clearCachedTokens();
    this.signInUserSession = signInUserSession;
    this.cacheTokens();
  };

  /**
   * @returns {CognitoUserSession} the current session for this user
   */


  CognitoUser.prototype.getSignInUserSession = function getSignInUserSession() {
    return this.signInUserSession;
  };

  /**
   * @returns {string} the user's username
   */


  CognitoUser.prototype.getUsername = function getUsername() {
    return this.username;
  };

  /**
   * @returns {String} the authentication flow type
   */


  CognitoUser.prototype.getAuthenticationFlowType = function getAuthenticationFlowType() {
    return this.authenticationFlowType;
  };

  /**
   * sets authentication flow type
   * @param {string} authenticationFlowType New value.
   * @returns {void}
   */


  CognitoUser.prototype.setAuthenticationFlowType = function setAuthenticationFlowType(authenticationFlowType) {
    this.authenticationFlowType = authenticationFlowType;
  };

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


  CognitoUser.prototype.initiateAuth = function initiateAuth(authDetails, callback) {
    var _this = this;

    var authParameters = authDetails.getAuthParameters();
    authParameters.USERNAME = this.username;

    var jsonReq = {
      AuthFlow: 'CUSTOM_AUTH',
      ClientId: this.pool.getClientId(),
      AuthParameters: authParameters,
      ClientMetadata: authDetails.getValidationData()
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }

    this.client.request('InitiateAuth', jsonReq, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      var challengeName = data.ChallengeName;
      var challengeParameters = data.ChallengeParameters;

      if (challengeName === 'CUSTOM_CHALLENGE') {
        _this.Session = data.Session;
        return callback.customChallenge(challengeParameters);
      }
      _this.signInUserSession = _this.getCognitoUserSession(data.AuthenticationResult);
      _this.cacheTokens();
      return callback.onSuccess(_this.signInUserSession);
    });
  };

  /**
   * This is used for authenticating the user.
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


  CognitoUser.prototype.authenticateUser = function authenticateUser(authDetails, callback) {
    if (this.authenticationFlowType === 'USER_PASSWORD_AUTH') {
      return this.authenticateUserPlainUsernamePassword(authDetails, callback);
    } else if (this.authenticationFlowType === 'USER_SRP_AUTH') {
      return this.authenticateUserDefaultAuth(authDetails, callback);
    }
    return callback.onFailure(new Error('Authentication flow type is invalid.'));
  };

  /**
   * PRIVATE ONLY: This is an internal only method and should not
   * be directly called by the consumers.
   * It calls the AuthenticationHelper for SRP related
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


  CognitoUser.prototype.authenticateUserDefaultAuth = function authenticateUserDefaultAuth(authDetails, callback) {
    var _this2 = this;

    var authenticationHelper = new AuthenticationHelper(this.pool.getUserPoolId().split('_')[1]);
    var dateHelper = new DateHelper();

    var serverBValue = void 0;
    var salt = void 0;
    var authParameters = {};

    if (this.deviceKey != null) {
      authParameters.DEVICE_KEY = this.deviceKey;
    }

    authParameters.USERNAME = this.username;
    authenticationHelper.getLargeAValue(function (errOnAValue, aValue) {
      // getLargeAValue callback start
      if (errOnAValue) {
        callback.onFailure(errOnAValue);
      }

      authParameters.SRP_A = aValue.toString(16);

      if (_this2.authenticationFlowType === 'CUSTOM_AUTH') {
        authParameters.CHALLENGE_NAME = 'SRP_A';
      }

      var jsonReq = {
        AuthFlow: _this2.authenticationFlowType,
        ClientId: _this2.pool.getClientId(),
        AuthParameters: authParameters,
        ClientMetadata: authDetails.getValidationData()
      };
      if (_this2.getUserContextData(_this2.username)) {
        jsonReq.UserContextData = _this2.getUserContextData(_this2.username);
      }

      _this2.client.request('InitiateAuth', jsonReq, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }

        var challengeParameters = data.ChallengeParameters;

        _this2.username = challengeParameters.USER_ID_FOR_SRP;
        serverBValue = new BigInteger(challengeParameters.SRP_B, 16);
        salt = new BigInteger(challengeParameters.SALT, 16);
        _this2.getCachedDeviceKeyAndPassword();

        authenticationHelper.getPasswordAuthenticationKey(_this2.username, authDetails.getPassword(), serverBValue, salt, function (errOnHkdf, hkdf) {
          // getPasswordAuthenticationKey callback start
          if (errOnHkdf) {
            callback.onFailure(errOnHkdf);
          }

          var dateNow = dateHelper.getNowString();

          var signatureString = createHmac('sha256', hkdf).update(Buffer.concat([Buffer.from(_this2.pool.getUserPoolId().split('_')[1], 'utf8'), Buffer.from(_this2.username, 'utf8'), Buffer.from(challengeParameters.SECRET_BLOCK, 'base64'), Buffer.from(dateNow, 'utf8')])).digest('base64');

          var challengeResponses = {};

          challengeResponses.USERNAME = _this2.username;
          challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK = challengeParameters.SECRET_BLOCK;
          challengeResponses.TIMESTAMP = dateNow;
          challengeResponses.PASSWORD_CLAIM_SIGNATURE = signatureString;

          if (_this2.deviceKey != null) {
            challengeResponses.DEVICE_KEY = _this2.deviceKey;
          }

          var respondToAuthChallenge = function respondToAuthChallenge(challenge, challengeCallback) {
            return _this2.client.request('RespondToAuthChallenge', challenge, function (errChallenge, dataChallenge) {
              if (errChallenge && errChallenge.code === 'ResourceNotFoundException' && errChallenge.message.toLowerCase().indexOf('device') !== -1) {
                challengeResponses.DEVICE_KEY = null;
                _this2.deviceKey = null;
                _this2.randomPassword = null;
                _this2.deviceGroupKey = null;
                _this2.clearCachedDeviceKeyAndPassword();
                return respondToAuthChallenge(challenge, challengeCallback);
              }
              return challengeCallback(errChallenge, dataChallenge);
            });
          };

          var jsonReqResp = {
            ChallengeName: 'PASSWORD_VERIFIER',
            ClientId: _this2.pool.getClientId(),
            ChallengeResponses: challengeResponses,
            Session: data.Session
          };
          if (_this2.getUserContextData()) {
            jsonReqResp.UserContextData = _this2.getUserContextData();
          }
          respondToAuthChallenge(jsonReqResp, function (errAuthenticate, dataAuthenticate) {
            if (errAuthenticate) {
              return callback.onFailure(errAuthenticate);
            }

            var challengeName = dataAuthenticate.ChallengeName;
            if (challengeName === 'NEW_PASSWORD_REQUIRED') {
              _this2.Session = dataAuthenticate.Session;
              var userAttributes = null;
              var rawRequiredAttributes = null;
              var requiredAttributes = [];
              var userAttributesPrefix = authenticationHelper.getNewPasswordRequiredChallengeUserAttributePrefix();

              if (dataAuthenticate.ChallengeParameters) {
                userAttributes = JSON.parse(dataAuthenticate.ChallengeParameters.userAttributes);
                rawRequiredAttributes = JSON.parse(dataAuthenticate.ChallengeParameters.requiredAttributes);
              }

              if (rawRequiredAttributes) {
                for (var i = 0; i < rawRequiredAttributes.length; i++) {
                  requiredAttributes[i] = rawRequiredAttributes[i].substr(userAttributesPrefix.length);
                }
              }
              return callback.newPasswordRequired(userAttributes, requiredAttributes);
            }
            return _this2.authenticateUserInternal(dataAuthenticate, authenticationHelper, callback);
          });
          return undefined;
          // getPasswordAuthenticationKey callback end
        });
        return undefined;
      });
      // getLargeAValue callback end
    });
  };

  /**
   * PRIVATE ONLY: This is an internal only method and should not
   * be directly called by the consumers.
   * @param {AuthenticationDetails} authDetails Contains the authentication data.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {mfaRequired} callback.mfaRequired MFA code
   *        required to continue.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   */


  CognitoUser.prototype.authenticateUserPlainUsernamePassword = function authenticateUserPlainUsernamePassword(authDetails, callback) {
    var _this3 = this;

    var authParameters = {};
    authParameters.USERNAME = this.username;
    authParameters.PASSWORD = authDetails.getPassword();
    if (!authParameters.PASSWORD) {
      callback.onFailure(new Error('PASSWORD parameter is required'));
      return;
    }
    var authenticationHelper = new AuthenticationHelper(this.pool.getUserPoolId().split('_')[1]);
    this.getCachedDeviceKeyAndPassword();
    if (this.deviceKey != null) {
      authParameters.DEVICE_KEY = this.deviceKey;
    }

    var jsonReq = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.pool.getClientId(),
      AuthParameters: authParameters,
      ClientMetadata: authDetails.getValidationData()
    };
    if (this.getUserContextData(this.username)) {
      jsonReq.UserContextData = this.getUserContextData(this.username);
    }
    // USER_PASSWORD_AUTH happens in a single round-trip: client sends userName and password,
    // Cognito UserPools verifies password and returns tokens.
    this.client.request('InitiateAuth', jsonReq, function (err, authResult) {
      if (err) {
        return callback.onFailure(err);
      }
      return _this3.authenticateUserInternal(authResult, authenticationHelper, callback);
    });
  };

  /**
  * PRIVATE ONLY: This is an internal only method and should not
  * be directly called by the consumers.
  * @param {object} dataAuthenticate authentication data
  * @param {object} authenticationHelper helper created
  * @param {callback} callback passed on from caller
  * @returns {void}
  */


  CognitoUser.prototype.authenticateUserInternal = function authenticateUserInternal(dataAuthenticate, authenticationHelper, callback) {
    var _this4 = this;

    var challengeName = dataAuthenticate.ChallengeName;
    var challengeParameters = dataAuthenticate.ChallengeParameters;

    if (challengeName === 'SMS_MFA') {
      this.Session = dataAuthenticate.Session;
      return callback.mfaRequired(challengeName, challengeParameters);
    }

    if (challengeName === 'SELECT_MFA_TYPE') {
      this.Session = dataAuthenticate.Session;
      return callback.selectMFAType(challengeName, challengeParameters);
    }

    if (challengeName === 'MFA_SETUP') {
      this.Session = dataAuthenticate.Session;
      return callback.mfaSetup(challengeName, challengeParameters);
    }

    if (challengeName === 'SOFTWARE_TOKEN_MFA') {
      this.Session = dataAuthenticate.Session;
      return callback.totpRequired(challengeName, challengeParameters);
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

    var newDeviceMetadata = dataAuthenticate.AuthenticationResult.NewDeviceMetadata;
    if (newDeviceMetadata == null) {
      return callback.onSuccess(this.signInUserSession);
    }

    authenticationHelper.generateHashDevice(dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey, dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey, function (errGenHash) {
      if (errGenHash) {
        return callback.onFailure(errGenHash);
      }

      var deviceSecretVerifierConfig = {
        Salt: Buffer.from(authenticationHelper.getSaltDevices(), 'hex').toString('base64'),
        PasswordVerifier: Buffer.from(authenticationHelper.getVerifierDevices(), 'hex').toString('base64')
      };

      _this4.verifierDevices = deviceSecretVerifierConfig.PasswordVerifier;
      _this4.deviceGroupKey = newDeviceMetadata.DeviceGroupKey;
      _this4.randomPassword = authenticationHelper.getRandomPassword();

      _this4.client.request('ConfirmDevice', {
        DeviceKey: newDeviceMetadata.DeviceKey,
        AccessToken: _this4.signInUserSession.getAccessToken().getJwtToken(),
        DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
        DeviceName: navigator.userAgent
      }, function (errConfirm, dataConfirm) {
        if (errConfirm) {
          return callback.onFailure(errConfirm);
        }

        _this4.deviceKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
        _this4.cacheDeviceKeyAndPassword();
        if (dataConfirm.UserConfirmationNecessary === true) {
          return callback.onSuccess(_this4.signInUserSession, dataConfirm.UserConfirmationNecessary);
        }
        return callback.onSuccess(_this4.signInUserSession);
      });
      return undefined;
    });
    return undefined;
  };

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


  CognitoUser.prototype.completeNewPasswordChallenge = function completeNewPasswordChallenge(newPassword, requiredAttributeData, callback) {
    var _this5 = this;

    if (!newPassword) {
      return callback.onFailure(new Error('New password is required.'));
    }
    var authenticationHelper = new AuthenticationHelper(this.pool.getUserPoolId().split('_')[1]);
    var userAttributesPrefix = authenticationHelper.getNewPasswordRequiredChallengeUserAttributePrefix();

    var finalUserAttributes = {};
    if (requiredAttributeData) {
      Object.keys(requiredAttributeData).forEach(function (key) {
        finalUserAttributes[userAttributesPrefix + key] = requiredAttributeData[key];
      });
    }

    finalUserAttributes.NEW_PASSWORD = newPassword;
    finalUserAttributes.USERNAME = this.username;
    var jsonReq = {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: this.pool.getClientId(),
      ChallengeResponses: finalUserAttributes,
      Session: this.Session
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }

    this.client.request('RespondToAuthChallenge', jsonReq, function (errAuthenticate, dataAuthenticate) {
      if (errAuthenticate) {
        return callback.onFailure(errAuthenticate);
      }
      return _this5.authenticateUserInternal(dataAuthenticate, authenticationHelper, callback);
    });
    return undefined;
  };

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


  CognitoUser.prototype.getDeviceResponse = function getDeviceResponse(callback) {
    var _this6 = this;

    var authenticationHelper = new AuthenticationHelper(this.deviceGroupKey);
    var dateHelper = new DateHelper();

    var authParameters = {};

    authParameters.USERNAME = this.username;
    authParameters.DEVICE_KEY = this.deviceKey;
    authenticationHelper.getLargeAValue(function (errAValue, aValue) {
      // getLargeAValue callback start
      if (errAValue) {
        callback.onFailure(errAValue);
      }

      authParameters.SRP_A = aValue.toString(16);

      var jsonReq = {
        ChallengeName: 'DEVICE_SRP_AUTH',
        ClientId: _this6.pool.getClientId(),
        ChallengeResponses: authParameters
      };
      if (_this6.getUserContextData()) {
        jsonReq.UserContextData = _this6.getUserContextData();
      }
      _this6.client.request('RespondToAuthChallenge', jsonReq, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }

        var challengeParameters = data.ChallengeParameters;

        var serverBValue = new BigInteger(challengeParameters.SRP_B, 16);
        var salt = new BigInteger(challengeParameters.SALT, 16);

        authenticationHelper.getPasswordAuthenticationKey(_this6.deviceKey, _this6.randomPassword, serverBValue, salt, function (errHkdf, hkdf) {
          // getPasswordAuthenticationKey callback start
          if (errHkdf) {
            return callback.onFailure(errHkdf);
          }

          var dateNow = dateHelper.getNowString();

          var signatureString = createHmac('sha256', hkdf).update(Buffer.concat([Buffer.from(_this6.deviceGroupKey, 'utf8'), Buffer.from(_this6.deviceKey, 'utf8'), Buffer.from(challengeParameters.SECRET_BLOCK, 'base64'), Buffer.from(dateNow, 'utf8')])).digest('base64');

          var challengeResponses = {};

          challengeResponses.USERNAME = _this6.username;
          challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK = challengeParameters.SECRET_BLOCK;
          challengeResponses.TIMESTAMP = dateNow;
          challengeResponses.PASSWORD_CLAIM_SIGNATURE = signatureString;
          challengeResponses.DEVICE_KEY = _this6.deviceKey;

          var jsonReqResp = {
            ChallengeName: 'DEVICE_PASSWORD_VERIFIER',
            ClientId: _this6.pool.getClientId(),
            ChallengeResponses: challengeResponses,
            Session: data.Session
          };
          if (_this6.getUserContextData()) {
            jsonReqResp.UserContextData = _this6.getUserContextData();
          }

          _this6.client.request('RespondToAuthChallenge', jsonReqResp, function (errAuthenticate, dataAuthenticate) {
            if (errAuthenticate) {
              return callback.onFailure(errAuthenticate);
            }

            _this6.signInUserSession = _this6.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
            _this6.cacheTokens();

            return callback.onSuccess(_this6.signInUserSession);
          });
          return undefined;
          // getPasswordAuthenticationKey callback end
        });
        return undefined;
      });
      // getLargeAValue callback end
    });
  };

  /**
   * This is used for a certain user to confirm the registration by using a confirmation code
   * @param {string} confirmationCode Code entered by user.
   * @param {bool} forceAliasCreation Allow migrating from an existing email / phone number.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.confirmRegistration = function confirmRegistration(confirmationCode, forceAliasCreation, callback) {
    var jsonReq = {
      ClientId: this.pool.getClientId(),
      ConfirmationCode: confirmationCode,
      Username: this.username,
      ForceAliasCreation: forceAliasCreation
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('ConfirmSignUp', jsonReq, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
  };

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


  CognitoUser.prototype.sendCustomChallengeAnswer = function sendCustomChallengeAnswer(answerChallenge, callback) {
    var _this7 = this;

    var challengeResponses = {};
    challengeResponses.USERNAME = this.username;
    challengeResponses.ANSWER = answerChallenge;

    var authenticationHelper = new AuthenticationHelper(this.pool.getUserPoolId().split('_')[1]);
    this.getCachedDeviceKeyAndPassword();
    if (this.deviceKey != null) {
      challengeResponses.DEVICE_KEY = this.deviceKey;
    }

    var jsonReq = {
      ChallengeName: 'CUSTOM_CHALLENGE',
      ChallengeResponses: challengeResponses,
      ClientId: this.pool.getClientId(),
      Session: this.Session
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('RespondToAuthChallenge', jsonReq, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }

      return _this7.authenticateUserInternal(data, authenticationHelper, callback);
    });
  };

  /**
   * This is used by the user once he has an MFA code
   * @param {string} confirmationCode The MFA code entered by the user.
   * @param {object} callback Result callback map.
   * @param {string} mfaType The mfa we are replying to.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   */


  CognitoUser.prototype.sendMFACode = function sendMFACode(confirmationCode, callback, mfaType) {
    var _this8 = this;

    var challengeResponses = {};
    challengeResponses.USERNAME = this.username;
    challengeResponses.SMS_MFA_CODE = confirmationCode;
    var mfaTypeSelection = mfaType || 'SMS_MFA';
    if (mfaTypeSelection === 'SOFTWARE_TOKEN_MFA') {
      challengeResponses.SOFTWARE_TOKEN_MFA_CODE = confirmationCode;
    }

    if (this.deviceKey != null) {
      challengeResponses.DEVICE_KEY = this.deviceKey;
    }

    var jsonReq = {
      ChallengeName: mfaTypeSelection,
      ChallengeResponses: challengeResponses,
      ClientId: this.pool.getClientId(),
      Session: this.Session
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }

    this.client.request('RespondToAuthChallenge', jsonReq, function (err, dataAuthenticate) {
      if (err) {
        return callback.onFailure(err);
      }

      var challengeName = dataAuthenticate.ChallengeName;

      if (challengeName === 'DEVICE_SRP_AUTH') {
        _this8.getDeviceResponse(callback);
        return undefined;
      }

      _this8.signInUserSession = _this8.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
      _this8.cacheTokens();

      if (dataAuthenticate.AuthenticationResult.NewDeviceMetadata == null) {
        return callback.onSuccess(_this8.signInUserSession);
      }

      var authenticationHelper = new AuthenticationHelper(_this8.pool.getUserPoolId().split('_')[1]);
      authenticationHelper.generateHashDevice(dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey, dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey, function (errGenHash) {
        if (errGenHash) {
          return callback.onFailure(errGenHash);
        }

        var deviceSecretVerifierConfig = {
          Salt: Buffer.from(authenticationHelper.getSaltDevices(), 'hex').toString('base64'),
          PasswordVerifier: Buffer.from(authenticationHelper.getVerifierDevices(), 'hex').toString('base64')
        };

        _this8.verifierDevices = deviceSecretVerifierConfig.PasswordVerifier;
        _this8.deviceGroupKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey;
        _this8.randomPassword = authenticationHelper.getRandomPassword();

        _this8.client.request('ConfirmDevice', {
          DeviceKey: dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey,
          AccessToken: _this8.signInUserSession.getAccessToken().getJwtToken(),
          DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
          DeviceName: navigator.userAgent
        }, function (errConfirm, dataConfirm) {
          if (errConfirm) {
            return callback.onFailure(errConfirm);
          }

          _this8.deviceKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
          _this8.cacheDeviceKeyAndPassword();
          if (dataConfirm.UserConfirmationNecessary === true) {
            return callback.onSuccess(_this8.signInUserSession, dataConfirm.UserConfirmationNecessary);
          }
          return callback.onSuccess(_this8.signInUserSession);
        });
        return undefined;
      });
      return undefined;
    });
  };

  /**
   * This is used by an authenticated user to change the current password
   * @param {string} oldUserPassword The current password.
   * @param {string} newUserPassword The requested new password.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.changePassword = function changePassword(oldUserPassword, newUserPassword, callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.request('ChangePassword', {
      PreviousPassword: oldUserPassword,
      ProposedPassword: newUserPassword,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  };

  /**
   * This is used by an authenticated user to enable MFA for himself
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.enableMFA = function enableMFA(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }

    var mfaOptions = [];
    var mfaEnabled = {
      DeliveryMedium: 'SMS',
      AttributeName: 'phone_number'
    };
    mfaOptions.push(mfaEnabled);

    this.client.request('SetUserSettings', {
      MFAOptions: mfaOptions,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  };

  /**
   * This is used by an authenticated user to enable MFA for himself
   * @param {string[]} smsMfaSettings the sms mfa settings
   * @param {string[]} softwareTokenMfaSettings the software token mfa settings
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.setUserMfaPreference = function setUserMfaPreference(smsMfaSettings, softwareTokenMfaSettings, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.request('SetUserMFAPreference', {
      SMSMfaSettings: smsMfaSettings,
      SoftwareTokenMfaSettings: softwareTokenMfaSettings,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  };

  /**
   * This is used by an authenticated user to disable MFA for himself
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.disableMFA = function disableMFA(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }

    var mfaOptions = [];

    this.client.request('SetUserSettings', {
      MFAOptions: mfaOptions,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  };

  /**
   * This is used by an authenticated user to delete himself
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.deleteUser = function deleteUser(callback) {
    var _this9 = this;

    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.request('DeleteUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      _this9.clearCachedTokens();
      return callback(null, 'SUCCESS');
    });
    return undefined;
  };

  /**
   * @typedef {CognitoUserAttribute | { Name:string, Value:string }} AttributeArg
   */
  /**
   * This is used by an authenticated user to change a list of attributes
   * @param {AttributeArg[]} attributes A list of the new user attributes.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.updateAttributes = function updateAttributes(attributes, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.request('UpdateUserAttributes', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      UserAttributes: attributes
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  };

  /**
   * This is used by an authenticated user to get a list of attributes
   * @param {nodeCallback<CognitoUserAttribute[]>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.getUserAttributes = function getUserAttributes(callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.request('GetUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err, userData) {
      if (err) {
        return callback(err, null);
      }

      var attributeList = [];

      for (var i = 0; i < userData.UserAttributes.length; i++) {
        var attribute = {
          Name: userData.UserAttributes[i].Name,
          Value: userData.UserAttributes[i].Value
        };
        var userAttribute = new CognitoUserAttribute(attribute);
        attributeList.push(userAttribute);
      }

      return callback(null, attributeList);
    });
    return undefined;
  };

  /**
   * This is used by an authenticated user to get the MFAOptions
   * @param {nodeCallback<MFAOptions>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.getMFAOptions = function getMFAOptions(callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.request('GetUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err, userData) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, userData.MFAOptions);
    });
    return undefined;
  };

  /**
   * This is used by an authenticated users to get the userData
   * @param {nodeCallback<UserData>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.getUserData = function getUserData(callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.request('GetUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err, userData) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, userData);
    });
    return undefined;
  };

  /**
   * This is used by an authenticated user to delete a list of attributes
   * @param {string[]} attributeList Names of the attributes to delete.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.deleteAttributes = function deleteAttributes(attributeList, callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }

    this.client.request('DeleteUserAttributes', {
      UserAttributeNames: attributeList,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  };

  /**
   * This is used by a user to resend a confirmation code
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.resendConfirmationCode = function resendConfirmationCode(callback) {
    var jsonReq = {
      ClientId: this.pool.getClientId(),
      Username: this.username
    };

    this.client.request('ResendConfirmationCode', jsonReq, function (err, result) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, result);
    });
  };

  /**
   * This is used to get a session, either from the session object
   * or from  the local storage, or by using a refresh token
   *
   * @param {nodeCallback<CognitoUserSession>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.getSession = function getSession(callback) {
    if (this.username == null) {
      return callback(new Error('Username is null. Cannot retrieve a new session'), null);
    }

    if (this.signInUserSession != null && this.signInUserSession.isValid()) {
      return callback(null, this.signInUserSession);
    }

    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId() + '.' + this.username;
    var idTokenKey = keyPrefix + '.idToken';
    var accessTokenKey = keyPrefix + '.accessToken';
    var refreshTokenKey = keyPrefix + '.refreshToken';
    var clockDriftKey = keyPrefix + '.clockDrift';

    if (this.storage.getItem(idTokenKey)) {
      var idToken = new CognitoIdToken({
        IdToken: this.storage.getItem(idTokenKey)
      });
      var accessToken = new CognitoAccessToken({
        AccessToken: this.storage.getItem(accessTokenKey)
      });
      var refreshToken = new CognitoRefreshToken({
        RefreshToken: this.storage.getItem(refreshTokenKey)
      });
      var clockDrift = parseInt(this.storage.getItem(clockDriftKey), 0) || 0;

      var sessionData = {
        IdToken: idToken,
        AccessToken: accessToken,
        RefreshToken: refreshToken,
        ClockDrift: clockDrift
      };
      var cachedSession = new CognitoUserSession(sessionData);
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
  };

  /**
   * This uses the refreshToken to retrieve a new session
   * @param {CognitoRefreshToken} refreshToken A previous session's refresh token.
   * @param {nodeCallback<CognitoUserSession>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.refreshSession = function refreshSession(refreshToken, callback) {
    var _this10 = this;

    var authParameters = {};
    authParameters.REFRESH_TOKEN = refreshToken.getToken();
    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId();
    var lastUserKey = keyPrefix + '.LastAuthUser';

    if (this.storage.getItem(lastUserKey)) {
      this.username = this.storage.getItem(lastUserKey);
      var deviceKeyKey = keyPrefix + '.' + this.username + '.deviceKey';
      this.deviceKey = this.storage.getItem(deviceKeyKey);
      authParameters.DEVICE_KEY = this.deviceKey;
    }

    var jsonReq = {
      ClientId: this.pool.getClientId(),
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: authParameters
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('InitiateAuth', jsonReq, function (err, authResult) {
      if (err) {
        if (err.code === 'NotAuthorizedException') {
          _this10.clearCachedTokens();
        }
        return callback(err, null);
      }
      if (authResult) {
        var authenticationResult = authResult.AuthenticationResult;
        if (!Object.prototype.hasOwnProperty.call(authenticationResult, 'RefreshToken')) {
          authenticationResult.RefreshToken = refreshToken.getToken();
        }
        _this10.signInUserSession = _this10.getCognitoUserSession(authenticationResult);
        _this10.cacheTokens();
        return callback(null, _this10.signInUserSession);
      }
      return undefined;
    });
  };

  /**
   * This is used to save the session tokens to local storage
   * @returns {void}
   */


  CognitoUser.prototype.cacheTokens = function cacheTokens() {
    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId();
    var idTokenKey = keyPrefix + '.' + this.username + '.idToken';
    var accessTokenKey = keyPrefix + '.' + this.username + '.accessToken';
    var refreshTokenKey = keyPrefix + '.' + this.username + '.refreshToken';
    var clockDriftKey = keyPrefix + '.' + this.username + '.clockDrift';
    var lastUserKey = keyPrefix + '.LastAuthUser';

    this.storage.setItem(idTokenKey, this.signInUserSession.getIdToken().getJwtToken());
    this.storage.setItem(accessTokenKey, this.signInUserSession.getAccessToken().getJwtToken());
    this.storage.setItem(refreshTokenKey, this.signInUserSession.getRefreshToken().getToken());
    this.storage.setItem(clockDriftKey, '' + this.signInUserSession.getClockDrift());
    this.storage.setItem(lastUserKey, this.username);
  };

  /**
   * This is used to cache the device key and device group and device password
   * @returns {void}
   */


  CognitoUser.prototype.cacheDeviceKeyAndPassword = function cacheDeviceKeyAndPassword() {
    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId() + '.' + this.username;
    var deviceKeyKey = keyPrefix + '.deviceKey';
    var randomPasswordKey = keyPrefix + '.randomPasswordKey';
    var deviceGroupKeyKey = keyPrefix + '.deviceGroupKey';

    this.storage.setItem(deviceKeyKey, this.deviceKey);
    this.storage.setItem(randomPasswordKey, this.randomPassword);
    this.storage.setItem(deviceGroupKeyKey, this.deviceGroupKey);
  };

  /**
   * This is used to get current device key and device group and device password
   * @returns {void}
   */


  CognitoUser.prototype.getCachedDeviceKeyAndPassword = function getCachedDeviceKeyAndPassword() {
    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId() + '.' + this.username;
    var deviceKeyKey = keyPrefix + '.deviceKey';
    var randomPasswordKey = keyPrefix + '.randomPasswordKey';
    var deviceGroupKeyKey = keyPrefix + '.deviceGroupKey';

    if (this.storage.getItem(deviceKeyKey)) {
      this.deviceKey = this.storage.getItem(deviceKeyKey);
      this.randomPassword = this.storage.getItem(randomPasswordKey);
      this.deviceGroupKey = this.storage.getItem(deviceGroupKeyKey);
    }
  };

  /**
   * This is used to clear the device key info from local storage
   * @returns {void}
   */


  CognitoUser.prototype.clearCachedDeviceKeyAndPassword = function clearCachedDeviceKeyAndPassword() {
    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId() + '.' + this.username;
    var deviceKeyKey = keyPrefix + '.deviceKey';
    var randomPasswordKey = keyPrefix + '.randomPasswordKey';
    var deviceGroupKeyKey = keyPrefix + '.deviceGroupKey';

    this.storage.removeItem(deviceKeyKey);
    this.storage.removeItem(randomPasswordKey);
    this.storage.removeItem(deviceGroupKeyKey);
  };

  /**
   * This is used to clear the session tokens from local storage
   * @returns {void}
   */


  CognitoUser.prototype.clearCachedTokens = function clearCachedTokens() {
    var keyPrefix = 'CognitoIdentityServiceProvider.' + this.pool.getClientId();
    var idTokenKey = keyPrefix + '.' + this.username + '.idToken';
    var accessTokenKey = keyPrefix + '.' + this.username + '.accessToken';
    var refreshTokenKey = keyPrefix + '.' + this.username + '.refreshToken';
    var lastUserKey = keyPrefix + '.LastAuthUser';

    this.storage.removeItem(idTokenKey);
    this.storage.removeItem(accessTokenKey);
    this.storage.removeItem(refreshTokenKey);
    this.storage.removeItem(lastUserKey);
  };

  /**
   * This is used to build a user session from tokens retrieved in the authentication result
   * @param {object} authResult Successful auth response from server.
   * @returns {CognitoUserSession} The new user session.
   * @private
   */


  CognitoUser.prototype.getCognitoUserSession = function getCognitoUserSession(authResult) {
    var idToken = new CognitoIdToken(authResult);
    var accessToken = new CognitoAccessToken(authResult);
    var refreshToken = new CognitoRefreshToken(authResult);

    var sessionData = {
      IdToken: idToken,
      AccessToken: accessToken,
      RefreshToken: refreshToken
    };

    return new CognitoUserSession(sessionData);
  };

  /**
   * This is used to initiate a forgot password request
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {inputVerificationCode?} callback.inputVerificationCode
   *    Optional callback raised instead of onSuccess with response data.
   * @param {onSuccess} callback.onSuccess Called on success.
   * @returns {void}
   */


  CognitoUser.prototype.forgotPassword = function forgotPassword(callback) {
    var jsonReq = {
      ClientId: this.pool.getClientId(),
      Username: this.username
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('ForgotPassword', jsonReq, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      if (typeof callback.inputVerificationCode === 'function') {
        return callback.inputVerificationCode(data);
      }
      return callback.onSuccess(data);
    });
  };

  /**
   * This is used to confirm a new password using a confirmationCode
   * @param {string} confirmationCode Code entered by user.
   * @param {string} newPassword Confirm new password.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<void>} callback.onSuccess Called on success.
   * @returns {void}
   */


  CognitoUser.prototype.confirmPassword = function confirmPassword(confirmationCode, newPassword, callback) {
    var jsonReq = {
      ClientId: this.pool.getClientId(),
      Username: this.username,
      ConfirmationCode: confirmationCode,
      Password: newPassword
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('ConfirmForgotPassword', jsonReq, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess();
    });
  };

  /**
   * This is used to initiate an attribute confirmation request
   * @param {string} attributeName User attribute that needs confirmation.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {inputVerificationCode} callback.inputVerificationCode Called on success.
   * @returns {void}
   */


  CognitoUser.prototype.getAttributeVerificationCode = function getAttributeVerificationCode(attributeName, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.request('GetUserAttributeVerificationCode', {
      AttributeName: attributeName,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      if (typeof callback.inputVerificationCode === 'function') {
        return callback.inputVerificationCode(data);
      }
      return callback.onSuccess();
    });
    return undefined;
  };

  /**
   * This is used to confirm an attribute using a confirmation code
   * @param {string} attributeName Attribute being confirmed.
   * @param {string} confirmationCode Code entered by user.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */


  CognitoUser.prototype.verifyAttribute = function verifyAttribute(attributeName, confirmationCode, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.request('VerifyUserAttribute', {
      AttributeName: attributeName,
      Code: confirmationCode,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  };

  /**
   * This is used to get the device information using the current device key
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<*>} callback.onSuccess Called on success with device data.
   * @returns {void}
   */


  CognitoUser.prototype.getDevice = function getDevice(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.request('GetDevice', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: this.deviceKey
    }, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess(data);
    });
    return undefined;
  };

  /**
   * This is used to forget a specific device
   * @param {string} deviceKey Device key.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */


  CognitoUser.prototype.forgetSpecificDevice = function forgetSpecificDevice(deviceKey, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.request('ForgetDevice', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: deviceKey
    }, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  };

  /**
   * This is used to forget the current device
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */


  CognitoUser.prototype.forgetDevice = function forgetDevice(callback) {
    var _this11 = this;

    this.forgetSpecificDevice(this.deviceKey, {
      onFailure: callback.onFailure,
      onSuccess: function onSuccess(result) {
        _this11.deviceKey = null;
        _this11.deviceGroupKey = null;
        _this11.randomPassword = null;
        _this11.clearCachedDeviceKeyAndPassword();
        return callback.onSuccess(result);
      }
    });
  };

  /**
   * This is used to set the device status as remembered
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */


  CognitoUser.prototype.setDeviceStatusRemembered = function setDeviceStatusRemembered(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.request('UpdateDeviceStatus', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: this.deviceKey,
      DeviceRememberedStatus: 'remembered'
    }, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  };

  /**
   * This is used to set the device status as not remembered
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */


  CognitoUser.prototype.setDeviceStatusNotRemembered = function setDeviceStatusNotRemembered(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.request('UpdateDeviceStatus', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: this.deviceKey,
      DeviceRememberedStatus: 'not_remembered'
    }, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  };

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


  CognitoUser.prototype.listDevices = function listDevices(limit, paginationToken, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.request('ListDevices', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      Limit: limit,
      PaginationToken: paginationToken
    }, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess(data);
    });
    return undefined;
  };

  /**
   * This is used to globally revoke all tokens issued to a user
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */


  CognitoUser.prototype.globalSignOut = function globalSignOut(callback) {
    var _this12 = this;

    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }

    this.client.request('GlobalSignOut', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      _this12.clearCachedTokens();
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  };

  /**
   * This is used for the user to signOut of the application and clear the cached tokens.
   * @returns {void}
   */


  CognitoUser.prototype.signOut = function signOut() {
    this.signInUserSession = null;
    this.clearCachedTokens();
  };

  /**
   * This is used by a user trying to select a given MFA
   * @param {string} answerChallenge the mfa the user wants
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.sendMFASelectionAnswer = function sendMFASelectionAnswer(answerChallenge, callback) {
    var _this13 = this;

    var challengeResponses = {};
    challengeResponses.USERNAME = this.username;
    challengeResponses.ANSWER = answerChallenge;

    var jsonReq = {
      ChallengeName: 'SELECT_MFA_TYPE',
      ChallengeResponses: challengeResponses,
      ClientId: this.pool.getClientId(),
      Session: this.Session
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('RespondToAuthChallenge', jsonReq, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      _this13.Session = data.Session;
      if (answerChallenge === 'SMS_MFA') {
        return callback.mfaRequired(data.challengeName, data.challengeParameters);
      }
      if (answerChallenge === 'SOFTWARE_TOKEN_MFA') {
        return callback.totpRequired(data.challengeName, data.challengeParameters);
      }
      return undefined;
    });
  };

  /**
   * This returns the user context data for advanced security feature.
   * @returns {void}
   */


  CognitoUser.prototype.getUserContextData = function getUserContextData() {
    var pool = this.pool;
    return pool.getUserContextData(this.username);
  };

  /**
   * This is used by an authenticated or a user trying to authenticate to associate a TOTP MFA
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.associateSoftwareToken = function associateSoftwareToken(callback) {
    var _this14 = this;

    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      this.client.request('AssociateSoftwareToken', {
        Session: this.Session
      }, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }
        _this14.Session = data.Session;
        return callback.associateSecretCode(data.SecretCode);
      });
    } else {
      this.client.request('AssociateSoftwareToken', {
        AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
      }, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }
        return callback.associateSecretCode(data.SecretCode);
      });
    }
  };

  /**
   * This is used by an authenticated or a user trying to authenticate to verify a TOTP MFA
   * @param {string} totpCode The MFA code entered by the user.
   * @param {string} friendlyDeviceName The device name we are assigning to the device.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  CognitoUser.prototype.verifySoftwareToken = function verifySoftwareToken(totpCode, friendlyDeviceName, callback) {
    var _this15 = this;

    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      this.client.request('VerifySoftwareToken', {
        Session: this.Session,
        UserCode: totpCode,
        FriendlyDeviceName: friendlyDeviceName
      }, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }
        _this15.Session = data.Session;
        var challengeResponses = {};
        challengeResponses.USERNAME = _this15.username;
        var jsonReq = {
          ChallengeName: 'MFA_SETUP',
          ClientId: _this15.pool.getClientId(),
          ChallengeResponses: challengeResponses,
          Session: _this15.Session
        };
        if (_this15.getUserContextData()) {
          jsonReq.UserContextData = _this15.getUserContextData();
        }
        _this15.client.request('RespondToAuthChallenge', jsonReq, function (errRespond, dataRespond) {
          if (errRespond) {
            return callback.onFailure(errRespond);
          }
          _this15.signInUserSession = _this15.getCognitoUserSession(dataRespond.AuthenticationResult);
          _this15.cacheTokens();
          return callback.onSuccess(_this15.signInUserSession);
        });
        return undefined;
      });
    } else {
      this.client.request('VerifySoftwareToken', {
        AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
        UserCode: totpCode,
        FriendlyDeviceName: friendlyDeviceName
      }, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }
        return callback.onSuccess(data);
      });
    }
  };

  return CognitoUser;
}();

export default CognitoUser;