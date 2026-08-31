// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';
import NotificationClass from './PushNotification';

const _instance = new NotificationClass(null);
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export const PushNotification = _instance;
Amplify.register(PushNotification);

// chore: trigger v5-stable LTS release to complete partial publish (uuid-v11 RN fix, datastore). No functional change.
