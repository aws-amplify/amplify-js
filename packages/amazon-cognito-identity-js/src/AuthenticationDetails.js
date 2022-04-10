/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/** @class */
export default class AuthenticationDetails {
	/**
	 * Constructs a new AuthenticationDetails object
	 * @param {object=} data Creation options.
	 * @param {string} data.Username User being authenticated.
	 * @param {string} data.Password Plain-text password to authenticate with.
	 * @param {(AttributeArg[])?} data.ValidationData Application extra metadata.
	 * @param {(AttributeArg[])?} data.AuthParamaters Authentication paramaters for custom auth.
	 */
	constructor(data) {
		const {
			ValidationData,
			Username,
			Password,
			AuthParameters,
			ClientMetadata,
		} = data || {};
		this.validationData = ValidationData || {};
		this.authParameters = AuthParameters || {};
		this.clientMetadata = ClientMetadata || {};
		this.username = Username;
		this.password = Password;
	}

	/**
	 * @returns {string} the record's username
	 */
	getUsername() {
		return this.username;
	}

	/**
	 * @returns {string} the record's password
	 */
	getPassword() {
		return this.password;
	}

	/**
	 * @returns {Array} the record's validationData
	 */
	getValidationData() {
		return this.validationData;
	}

	/**
	 * @returns {Array} the record's authParameters
	 */
	getAuthParameters() {
		return this.authParameters;
	}

	/**
	 * @returns {ClientMetadata} the clientMetadata for a Lambda trigger
	 */
	getClientMetadata() {
		return this.clientMetadata;
	}
}
