// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';
import NotificationClass from './PushNotification';

const _instance = new NotificationClass(null);
export const PushNotification = _instance;
Amplify.register(PushNotification);
