// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { BrowserStorageCache } from './BrowserStorageCache';
import { InMemoryCache } from './InMemoryCache';
import { CacheConfig } from './types';

export { BrowserStorageCache, InMemoryCache, CacheConfig };

// Standard `Cache` export to maintain interoperability with React Native
export { BrowserStorageCache as Cache };

Amplify.register(BrowserStorageCache);
