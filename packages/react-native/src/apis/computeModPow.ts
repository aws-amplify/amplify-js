// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isNativeModuleLinked, nativeModule } from '../nativeModule';
import { RTNCore } from '../types';
import { computeModPowInJs } from '../utils';

export const computeModPow: RTNCore['computeModPow'] = payload =>
	isNativeModuleLinked
		? nativeModule.computeModPow(payload)
		: computeModPowInJs(payload);
