// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { getChannelType } from './getChannelType';
export { getDeviceId } from './getDeviceId';
export {
	getInflightDeviceRegistration,
	rejectInflightDeviceRegistration,
	resolveInflightDeviceRegistration,
} from './inflightDeviceRegistration';
export { registerDeviceWithCustomerProfiles } from './registerDeviceWithCustomerProfiles';
export {
	resolveConfig,
	IDENTIFY_USER_PATH,
	GUEST_IDENTIFY_USER_PATH,
} from './resolveConfig';
export { resolveCredentials } from './resolveCredentials';
