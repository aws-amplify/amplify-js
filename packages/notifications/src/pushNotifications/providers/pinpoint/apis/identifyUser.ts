// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserInfo } from '../../../../types';
import { pushNotification } from '../../../pushNotificationsClass.native';

export function identifyUser(
	userId: string,
	userInfo: UserInfo
): Promise<void> {
	return pushNotification.identifyUser(userId, userInfo);
}
