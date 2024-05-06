// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDeviceName as getDeviceNameNative } from '@aws-amplify/react-native';

/**
 * Retrieves the device name using name in ios and model in android,
 *
 * @returns {Promise<string>} A promise that resolves with a string representing the device name.
 *
 * Example Output:
 * ios: 'iPhone' / 'user's iPhone'
 * android: 'sdk_gphone64_arm64'
 */
export const getDeviceName = async (): Promise<string> => getDeviceNameNative();
