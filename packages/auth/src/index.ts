// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Default provider APIs & enums
export * from './providers/cognito';
export * from './types/enums';

export { AuthError } from './errors/AuthError';

export { fetchAuthSession } from '@aws-amplify/core';
