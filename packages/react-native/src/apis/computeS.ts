// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { nativeModule } from '~/src/nativeModule';
import { RTNCore } from '~/src/types';

export const computeS: RTNCore['computeS'] = payload =>
	nativeModule.computeS(payload);
