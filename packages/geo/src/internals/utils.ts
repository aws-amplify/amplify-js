// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Category, CustomUserAgentDetails, GeoAction } from '@aws-amplify/core';

export const getGeoUserAgentDetails = (
	action: GeoAction,
	customUserAgentDetails?: CustomUserAgentDetails
): CustomUserAgentDetails => {
	return {
		category: Category.Geo,
		action,
		...customUserAgentDetails,
	};
};
