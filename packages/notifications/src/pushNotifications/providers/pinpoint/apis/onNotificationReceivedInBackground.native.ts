// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../eventListeners';
import { OnNotificationReceivedInBackground } from '../types';

export const onNotificationReceivedInBackground: OnNotificationReceivedInBackground =
	input => addEventListener('backgroundMessageReceived', input);
