// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	ChannelType,
	InflightDeviceRegistration,
	InflightDeviceRegistrationResolver,
} from '../../shared/types';

/**
 * Geographic location associated with a Customer Profile. Mirrors the backend
 * `Address` block on the Amazon Connect Customer Profile.
 */
export interface UserProfileLocation {
	city?: string;
	country?: string;
	postalCode?: string;
	region?: string;
}

/**
 * Profile information sent to Amazon Connect Customer Profiles by `identifyUser`.
 *
 * This is a provider-scoped shape that intentionally does NOT reuse the shared
 * `@aws-amplify/core` (Pinpoint) `UserProfile`. It maps directly to the backend
 * Customer Profiles contract.
 */
export interface UserProfile {
	email?: string;
	name?: string;
	phone?: string;
	/**
	 * Each key and value must be ≤ 255 characters. 'principalId' is reserved
	 * and rejected.
	 */
	customAttributes?: Record<string, string>;
	location?: UserProfileLocation;
}
