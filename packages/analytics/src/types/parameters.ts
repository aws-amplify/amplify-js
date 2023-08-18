// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserProfile } from '@aws-amplify/core';

export type IdentifyUserParameters<T extends UserProfile = UserProfile> = {
	/**
	 * A User ID associated to the current user/endpoint
	 */
	userId: string;

	/**
	 * A User Profile containing information about the user device as well as custom attributes
	 */
	userProfile: T;
};
