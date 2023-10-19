// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { nativeModule } from '../nativeModule';

export const getBadgeCount = (): void | Promise<number | null> =>
	nativeModule.getBadgeCount?.();
