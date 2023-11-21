// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { nativeModule } from '~/src/nativeModule';
import { RTNCore } from '~/src/types';

export const computeModPow: RTNCore['computeModPow'] = payload =>
	nativeModule.computeModPow(payload);
