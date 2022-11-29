// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStandardAttributeKey } from '../../../../models';

export type CognitoUserAttributeKey = 
	| AuthStandardAttributeKey
	| `custom:${string}`
