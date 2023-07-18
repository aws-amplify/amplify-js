/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import CognitoRefreshToken from './CognitoRefreshToken';
import CognitoUserSession from './CognitoUserSession';
import CognitoUserAttribute from './CognitoUserAttribute';
import { InternalCognitoUser } from './internals/InternalCognitoUser';

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
export default class CognitoUser extends InternalCognitoUser {
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
		super.initiateAuth(authDetails, callback);
	}

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
	authenticateUser(authDetails, callback) {
		super.authenticateUser(authDetails, callback);
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
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	completeNewPasswordChallenge(
		newPassword,
		requiredAttributeData,
		callback,
		clientMetadata
	) {
		super.completeNewPasswordChallenge(
			newPassword,
			requiredAttributeData,
			callback,
			clientMetadata
		);
	}

	/**
	 * This is used to get a session using device authentication. It is called at the end of user
	 * authentication
	 *
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {authSuccess} callback.onSuccess Called on success with the new session.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 * @private
	 */
	getDeviceResponse(callback, clientMetadata) {
		super.getDeviceResponse(callback, clientMetadata);
	}

	/**
	 * This is used for a certain user to confirm the registration by using a confirmation code
	 * @param {string} confirmationCode Code entered by user.
	 * @param {bool} forceAliasCreation Allow migrating from an existing email / phone number.
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	confirmRegistration(
		confirmationCode,
		forceAliasCreation,
		callback,
		clientMetadata
	) {
		super.confirmRegistration(
			confirmationCode,
			forceAliasCreation,
			callback,
			clientMetadata
		);
	}

	/**
	 * This is used by the user once he has the responses to a custom challenge
	 * @param {string} answerChallenge The custom challenge answer.
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {customChallenge} callback.customChallenge
	 *    Custom challenge response required to continue.
	 * @param {authSuccess} callback.onSuccess Called on success with the new session.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	sendCustomChallengeAnswer(answerChallenge, callback, clientMetadata) {
		super.sendCustomChallengeAnswer(answerChallenge, callback, clientMetadata);
	}

	/**
	 * This is used by the user once he has an MFA code
	 * @param {string} confirmationCode The MFA code entered by the user.
	 * @param {object} callback Result callback map.
	 * @param {string} mfaType The mfa we are replying to.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {authSuccess} callback.onSuccess Called on success with the new session.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	sendMFACode(confirmationCode, callback, mfaType, clientMetadata) {
		super.sendMFACode(confirmationCode, callback, mfaType, clientMetadata);
	}

	/**
	 * This is used by an authenticated user to change the current password
	 * @param {string} oldUserPassword The current password.
	 * @param {string} newUserPassword The requested new password.
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	changePassword(oldUserPassword, newUserPassword, callback, clientMetadata) {
		super.changePassword(
			oldUserPassword,
			newUserPassword,
			callback,
			clientMetadata
		);
	}

	/**
	 * This is used by an authenticated user to enable MFA for itself
	 * @deprecated
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @returns {void}
	 */
	enableMFA(callback) {
		super.enableMFA(callback);
	}

	/**
	 * This is used by an authenticated user to enable MFA for itself
	 * @param {IMfaSettings} smsMfaSettings the sms mfa settings
	 * @param {IMFASettings} softwareTokenMfaSettings the software token mfa settings
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @returns {void}
	 */
	setUserMfaPreference(smsMfaSettings, softwareTokenMfaSettings, callback) {
		super.setUserMfaPreference(
			smsMfaSettings,
			softwareTokenMfaSettings,
			callback
		);
	}

	/**
	 * This is used by an authenticated user to disable MFA for itself
	 * @deprecated
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @returns {void}
	 */
	disableMFA(callback) {
		super.disableMFA(callback);
	}

	/**
	 * This is used by an authenticated user to delete itself
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	deleteUser(callback, clientMetadata) {
		super.deleteUser(callback, clientMetadata);
	}

	/**
	 * @typedef {CognitoUserAttribute | { Name:string, Value:string }} AttributeArg
	 */
	/**
	 * This is used by an authenticated user to change a list of attributes
	 * @param {AttributeArg[]} attributes A list of the new user attributes.
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	updateAttributes(attributes, callback, clientMetadata) {
		super.updateAttributes(attributes, callback, clientMetadata);
	}

	/**
	 * This is used by an authenticated user to get a list of attributes
	 * @param {nodeCallback<CognitoUserAttribute[]>} callback Called on success or error.
	 * @returns {void}
	 */
	getUserAttributes(callback) {
		super.getUserAttributes(callback);
	}

	/**
	 * This was previously used by an authenticated user to get MFAOptions,
	 * but no longer returns a meaningful response. Refer to the documentation for
	 * how to setup and use MFA: https://docs.amplify.aws/lib/auth/mfa/q/platform/js
	 * @deprecated
	 * @param {nodeCallback<MFAOptions>} callback Called on success or error.
	 * @returns {void}
	 */
	getMFAOptions(callback) {
		super.getMFAOptions(callback);
	}

	/**
	 * @typedef {Object} GetUserDataOptions
	 * @property {boolean} bypassCache - force getting data from Cognito service
	 * @property {Record<string, string>} clientMetadata - clientMetadata for getSession
	 */

	/**
	 * This is used by an authenticated users to get the userData
	 * @param {nodeCallback<UserData>} callback Called on success or error.
	 * @param {GetUserDataOptions} params
	 * @returns {void}
	 */
	getUserData(callback, params) {
		super.getUserData(callback, params);
	}

	/**
	 * This is used by an authenticated user to delete a list of attributes
	 * @param {string[]} attributeList Names of the attributes to delete.
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @returns {void}
	 */
	deleteAttributes(attributeList, callback) {
		super.deleteAttributes(attributeList, callback);
	}

	/**
	 * This is used by a user to resend a confirmation code
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	resendConfirmationCode(callback, clientMetadata) {
		super.resendConfirmationCode(callback, clientMetadata);
	}

	/**
	 * @typedef {Object} GetSessionOptions
	 * @property {Record<string, string>} clientMetadata - clientMetadata for getSession
	 */

	/**
	 * This is used to get a session, either from the session object
	 * or from  the local storage, or by using a refresh token
	 *
	 * @param {nodeCallback<CognitoUserSession>} callback Called on success or error.
	 * @param {GetSessionOptions} options
	 * @returns {void}
	 */
	getSession(callback, options = {}) {
		super.getSession(callback, options);
	}

	/**
	 * This uses the refreshToken to retrieve a new session
	 * @param {CognitoRefreshToken} refreshToken A previous session's refresh token.
	 * @param {nodeCallback<CognitoUserSession>} callback Called on success or error.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	refreshSession(refreshToken, callback, clientMetadata) {
		super.refreshSession(refreshToken, callback, clientMetadata);
	}

	/**
	 * This is used to initiate a forgot password request
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {inputVerificationCode?} callback.inputVerificationCode
	 *    Optional callback raised instead of onSuccess with response data.
	 * @param {onSuccess} callback.onSuccess Called on success.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	forgotPassword(callback, clientMetadata) {
		super.forgotPassword(callback, clientMetadata);
	}

	/**
	 * This is used to confirm a new password using a confirmationCode
	 * @param {string} confirmationCode Code entered by user.
	 * @param {string} newPassword Confirm new password.
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {onSuccess<void>} callback.onSuccess Called on success.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	confirmPassword(confirmationCode, newPassword, callback, clientMetadata) {
		super.confirmPassword(
			confirmationCode,
			newPassword,
			callback,
			clientMetadata
		);
	}

	/**
	 * This is used to initiate an attribute confirmation request
	 * @param {string} attributeName User attribute that needs confirmation.
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {inputVerificationCode} callback.inputVerificationCode Called on success.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	getAttributeVerificationCode(attributeName, callback, clientMetadata) {
		super.getAttributeVerificationCode(attributeName, callback, clientMetadata);
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
		super.verifyAttribute(attributeName, confirmationCode, callback);
	}

	/**
	 * This is used to get the device information using the current device key
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {onSuccess<*>} callback.onSuccess Called on success with device data.
	 * @returns {void}
	 */
	getDevice(callback) {
		super.getDevice(callback);
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
		super.forgetSpecificDevice(deviceKey, callback);
	}

	/**
	 * This is used to forget the current device
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {onSuccess<string>} callback.onSuccess Called on success.
	 * @returns {void}
	 */
	forgetDevice(callback) {
		super.forgetDevice(callback);
	}

	/**
	 * This is used to set the device status as remembered
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {onSuccess<string>} callback.onSuccess Called on success.
	 * @returns {void}
	 */
	setDeviceStatusRemembered(callback) {
		super.setDeviceStatusRemembered(callback);
	}

	/**
	 * This is used to set the device status as not remembered
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {onSuccess<string>} callback.onSuccess Called on success.
	 * @returns {void}
	 */
	setDeviceStatusNotRemembered(callback) {
		super.setDeviceStatusNotRemembered(callback);
	}

	/**
	 * This is used to list all devices for a user
	 *
	 * @param {int} limit the number of devices returned in a call
	 * @param {string | null} paginationToken the pagination token in case any was returned before
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {onSuccess<*>} callback.onSuccess Called on success with device list.
	 * @returns {void}
	 */
	listDevices(limit, paginationToken, callback) {
		super.listDevices(limit, paginationToken, callback);
	}

	/**
	 * This is used to globally revoke all tokens issued to a user
	 * @param {object} callback Result callback map.
	 * @param {onFailure} callback.onFailure Called on any error.
	 * @param {onSuccess<string>} callback.onSuccess Called on success.
	 * @returns {void}
	 */
	globalSignOut(callback) {
		super.globalSignOut(callback);
	}

	/**
	 * This is used for the user to signOut of the application and clear the cached tokens.
	 * @returns {void}
	 */
	signOut(revokeTokenCallback) {
		super.signOut(revokeTokenCallback);
	}

	revokeTokens(revokeTokenCallback = () => {}) {
		super.revokeTokens(revokeTokenCallback);
	}

	revokeToken({ token, callback }) {
		super.revokeTokens({ token, callback });
	}

	/**
	 * This is used by a user trying to select a given MFA
	 * @param {string} answerChallenge the mfa the user wants
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @returns {void}
	 */
	sendMFASelectionAnswer(answerChallenge, callback) {
		super.sendMFASelectionAnswer(answerChallenge, callback);
	}

	/**
	 * This is used by an authenticated or a user trying to authenticate to associate a TOTP MFA
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @returns {void}
	 */
	associateSoftwareToken(callback) {
		super.associateSoftwareToken(callback);
	}

	/**
	 * This is used by an authenticated or a user trying to authenticate to verify a TOTP MFA
	 * @param {string} totpCode The MFA code entered by the user.
	 * @param {string} friendlyDeviceName The device name we are assigning to the device.
	 * @param {nodeCallback<string>} callback Called on success or error.
	 * @returns {void}
	 */
	verifySoftwareToken(totpCode, friendlyDeviceName, callback) {
		super.verifySoftwareToken(totpCode, friendlyDeviceName, callback);
	}
}
