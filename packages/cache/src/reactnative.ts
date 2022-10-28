// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { Cache, AsyncStorageCache } from './AsyncStorageCache';

export { AsyncStorageCache };

// Standard `Cache` export to maintain interoperability with React Native
export { Cache };

Amplify.register(Cache);
