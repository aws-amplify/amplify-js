// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// No-op on web/Node, where `crypto.getRandomValues` is provided by the
// platform. The React Native implementation lives in
// `loadGetRandomValues.native.ts` and is selected automatically by Metro.
export const loadGetRandomValues = () => {};
