// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { nativeModule } from '../nativeModule';
import { RTNCore } from '../types';

export const computeS: RTNCore['computeS'] = payload =>
	nativeModule.computeS(payload);
