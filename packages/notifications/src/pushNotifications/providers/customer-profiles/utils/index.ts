// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { getDeviceId } from './getDeviceId';
export {
	getChannelType,
	getInflightDeviceRegistration,
	rejectInflightDeviceRegistration,
	resolveInflightDeviceRegistration,
} from '../../shared/utils';
export {
	DeviceRegistration,
	identifyUserInternal,
	registerDeviceInternal,
	removeDeviceInternal,
} from './identifyUserInternal';
export { signedFetch } from './signedFetch';
export {
	resolveConfig,
	IDENTIFY_USER_PATH,
	REGISTER_DEVICE_PATH,
	REMOVE_DEVICE_PATH,
} from './resolveConfig';
export { resolveCredentials } from './resolveCredentials';
