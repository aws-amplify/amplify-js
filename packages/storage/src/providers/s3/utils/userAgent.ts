// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Category,
	StorageAction,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';

export function getStorageUserAgentValue(action: StorageAction) {
	return getAmplifyUserAgent({
		category: Category.Storage,
		action,
	});
}
