// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
This file maps top-level exports from `aws-amplify`.
*/
export { Amplify } from '@aws-amplify/core';
export { DefaultAmplifyV6 as AmplifyV6 } from './initSingleton';

// TODO(v6): Remove legacy SSR utility when new utilities available
export { withSSRContext } from './ssr/withSSRContext';

// TODO(v6): Remove these category exports as categories come on-line
export { Storage, StorageClass } from '@aws-amplify/storage';
