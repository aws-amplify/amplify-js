/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *	 http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { Hub } from '@aws-amplify/core';
const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

export const dispatchAuthEvent = (
	event: string,
	data: any,
	message: string
) => {
	Hub.dispatch('auth', { event, data, message }, 'Auth', AMPLIFY_SYMBOL);
};

export const decodeJWT = (
	token: string
): { [key: string]: string | number | string[] } => {
	try {
		const base64URL = token.split('.')[1];
		const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
		const json = decodeURIComponent(
			atob(base64)
				.split('')
				.map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(json);
	} catch (err) {
		return {};
	}
};

const hasExpiration = (decodedToken: {
	[key: string]: string | number | string[];
}): decodedToken is typeof decodedToken & { exp: number } => {
	return (
		decodedToken && typeof (decodedToken as { exp: number }).exp !== 'undefined'
	);
};

export const getExpirationTimeFromJWT = (token: string): number => {
	const decodedToken = decodeJWT(token);
	if (!hasExpiration(decodedToken)) {
		throw new Error('No expiration time on JWT');
	}
	return decodedToken.exp;
};
