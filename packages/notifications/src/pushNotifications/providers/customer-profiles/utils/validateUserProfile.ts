// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PushNotificationValidationErrorCode, assert } from '../../../errors';
import { UserProfile } from '../types';

// Mirrors amplify-backend validateIdentifyUser — keep in sync.
const MAX_ATTRIBUTE_LENGTH = 255;
const RESERVED_ATTRIBUTE_KEYS = new Set(['principalId']);

const isValidOptionalString = (value: unknown): boolean =>
	value === undefined ||
	(typeof value === 'string' && value.length <= MAX_ATTRIBUTE_LENGTH);

/**
 * Validates a {@link UserProfile} before it is sent to Amazon Connect Customer
 * Profiles. This is a client-side defense-in-depth check that mirrors the
 * backend `validateIdentifyUser` bounds exactly (no drift): every string field
 * must be at most 255 characters, and `customAttributes` must be a plain object
 * whose keys/values are strings of at most 255 characters, excluding the
 * reserved `principalId` key.
 *
 * @param userProfile - The profile to validate. `undefined` is allowed.
 * @throws validation: {@link PushNotificationValidationErrorCode.InvalidUserProfile}
 *  - Thrown when any field violates the length/type/reserved-key constraints.
 *
 * @internal
 */
export const validateUserProfile = (userProfile?: UserProfile): void => {
	if (userProfile == null) {
		return;
	}

	const { email, name, phone, location, customAttributes } = userProfile;

	assert(
		isValidOptionalString(email),
		PushNotificationValidationErrorCode.InvalidUserProfile,
	);
	assert(
		isValidOptionalString(name),
		PushNotificationValidationErrorCode.InvalidUserProfile,
	);
	assert(
		isValidOptionalString(phone),
		PushNotificationValidationErrorCode.InvalidUserProfile,
	);

	if (location !== undefined) {
		assert(
			typeof location === 'object' &&
				location !== null &&
				!Array.isArray(location),
			PushNotificationValidationErrorCode.InvalidUserProfile,
		);
		assert(
			isValidOptionalString(location.city),
			PushNotificationValidationErrorCode.InvalidUserProfile,
		);
		assert(
			isValidOptionalString(location.country),
			PushNotificationValidationErrorCode.InvalidUserProfile,
		);
		assert(
			isValidOptionalString(location.postalCode),
			PushNotificationValidationErrorCode.InvalidUserProfile,
		);
		assert(
			isValidOptionalString(location.region),
			PushNotificationValidationErrorCode.InvalidUserProfile,
		);
	}

	if (customAttributes !== undefined) {
		assert(
			typeof customAttributes === 'object' &&
				customAttributes !== null &&
				!Array.isArray(customAttributes),
			PushNotificationValidationErrorCode.InvalidUserProfile,
		);

		for (const [key, value] of Object.entries(customAttributes)) {
			assert(
				!RESERVED_ATTRIBUTE_KEYS.has(key),
				PushNotificationValidationErrorCode.InvalidUserProfile,
			);
			assert(
				key.length <= MAX_ATTRIBUTE_LENGTH,
				PushNotificationValidationErrorCode.InvalidUserProfile,
			);
			assert(
				typeof value === 'string' && value.length <= MAX_ATTRIBUTE_LENGTH,
				PushNotificationValidationErrorCode.InvalidUserProfile,
			);
		}
	}
};
