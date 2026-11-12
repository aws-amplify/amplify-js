// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isNativeModuleLinked, nativeModule } from '../nativeModule';
import { RTNCore } from '../types';
import { getDeviceNameInJs } from '../utils';

export const getDeviceName: RTNCore['getDeviceName'] = () =>
	isNativeModuleLinked ? nativeModule.getDeviceName() : getDeviceNameInJs();
