// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';

import { DefaultOAuthStore } from '../signInWithRedirectStore';

export const oAuthStore = new DefaultOAuthStore(defaultStorage);
