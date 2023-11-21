// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { nativeModule } from '~/src/nativeModule';

export const completeNotification = (completionHandlerId: string): void =>
	nativeModule.completeNotification?.(completionHandlerId);
