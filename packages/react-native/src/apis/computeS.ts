// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isNativeModuleLinked, nativeModule } from '../nativeModule';
import { RTNCore } from '../types';
import { computeSInJs } from '../utils';

export const computeS: RTNCore['computeS'] = payload =>
	isNativeModuleLinked ? nativeModule.computeS(payload) : computeSInJs(payload);
