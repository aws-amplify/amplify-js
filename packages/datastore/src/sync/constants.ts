// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Category,
	CustomUserAgentDetails,
	DataStoreAction,
} from '@aws-amplify/core';

export const userAgentDetailsGraphQL: CustomUserAgentDetails = {
	category: Category.DataStore,
	action: DataStoreAction.GraphQl,
};

export const userAgentDetailsSubscribe: CustomUserAgentDetails = {
	category: Category.DataStore,
	action: DataStoreAction.Subscribe,
};
