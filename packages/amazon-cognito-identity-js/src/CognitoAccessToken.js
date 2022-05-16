/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import CognitoJwtToken from './CognitoJwtToken';

/** @class */
export default class CognitoAccessToken extends CognitoJwtToken {
	/**
	 * Constructs a new CognitoAccessToken object
	 * @param {string=} AccessToken The JWT access token.
	 */
	constructor({ AccessToken } = {}) {
		super(AccessToken || '');
	}
}
