// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BrowserStorageCache } from './BrowserStorageCache';
import { InMemoryCache } from './InMemoryCache';
import { CacheConfig } from './types';

export { BrowserStorageCache, InMemoryCache, CacheConfig };

// Standard `Cache` export to maintain interoperability with React Native
export { BrowserStorageCache as Cache };

// chore: trigger v5-stable LTS release to complete partial publish (uuid-v11 RN fix, datastore). No functional change.
