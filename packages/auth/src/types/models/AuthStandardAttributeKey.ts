// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * A list of standard user attribute keys.
 *
 * @remarks
 * These attributes are derived from the OIDC specification's list of standard claims.
 */
export type AuthStandardAttributeKey =
	| 'address'
	| 'birthDate'
	| 'email'
	| 'emailVerified'
	| 'familyName'
	| 'gender'
	| 'givenName'
	| 'locale'
	| 'middleName'
	| 'name'
	| 'nickname'
	| 'phoneNumber'
	| 'phoneNumberVerified'
	| 'picture'
	| 'preferredUsername'
	| 'profile'
	| 'sub'
	| 'updatedAt'
	| 'website'
	| 'zoneInfo';
