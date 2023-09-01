/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import CognitoJwtToken from './CognitoJwtToken';

/** @class */
export default class CognitoIdToken extends CognitoJwtToken {
	/**
	 * Constructs a new CognitoIdToken object
	 * @param {string=} IdToken The JWT Id token
	 */
	constructor({ IdToken } = {}) {
		super(IdToken || '');
	}
}
