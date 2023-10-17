// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../eventListeners';
import { OnNotificationOpened } from '../types';

export const onNotificationOpened: OnNotificationOpened = input =>
	addEventListener('notificationOpened', input);
