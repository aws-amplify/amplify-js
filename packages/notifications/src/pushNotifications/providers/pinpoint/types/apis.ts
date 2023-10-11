// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { IdentifyUserInput } from './inputs';

export type IdentifyUser = (input: IdentifyUserInput) => Promise<void>;

export type InitializePushNotifications = () => void;
