// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * MSW server instance for mocking AWS Cognito API requests
 */
export const server = setupServer(...handlers);
