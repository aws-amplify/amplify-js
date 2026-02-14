// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * Setup MSW server with request handlers
 */
export const server = setupServer(...handlers);
