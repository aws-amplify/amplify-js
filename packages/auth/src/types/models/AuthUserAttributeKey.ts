// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnyAttribute, AuthStandardAttributeKey } from '..';

/**
 * A user attribute key type consisting of standard OIDC claims or custom attributes.
 */
export type AuthUserAttributeKey = AuthStandardAttributeKey | AnyAttribute;
