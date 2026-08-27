// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// The canonical `bridgeAmplifyClass` implementation was promoted into
// `@aws-amplify/core` (Phase C1) as the single shared source of truth. This
// local module re-exports it so existing intra-package imports keep working
// until the full server-wrapper collapse (Phase C4).
export { bridgeAmplifyClass } from '@aws-amplify/core/internals/utils';
