// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { nativeModule } from '../nativeModule';
import { NativeMessage } from '../types';

export const getLaunchNotification = async (): Promise<NativeMessage | null> =>
	nativeModule.getLaunchNotification();
