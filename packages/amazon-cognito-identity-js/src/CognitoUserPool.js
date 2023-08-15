/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import CognitoUser from './CognitoUser';
import { InternalCognitoUserPool } from './internals';

const USER_POOL_ID_MAX_LENGTH = 55;

/** @class */
export default class CognitoUserPool extends InternalCognitoUserPool {

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
	 * @param {(AttributeArg[])=} clientMetadata Client metadata.
	 * @param {nodeCallback<SignUpResult>} callback Called on error or with the new user.
	 * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
	 * @returns {void}
	 */
	signUp(
		username,
		password,
		userAttributes,
		validationData,
		callback,
		clientMetadata
	) {
		return super.signUp(
			username,
			password,
			userAttributes,
			validationData,
			callback,
			clientMetadata
		);
	}
}
