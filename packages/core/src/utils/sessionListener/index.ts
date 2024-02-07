// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SessionListener } from './SessionListener';

export { SESSION_START_EVENT, SESSION_STOP_EVENT } from './constants';

export const sessionListener = new SessionListener();
