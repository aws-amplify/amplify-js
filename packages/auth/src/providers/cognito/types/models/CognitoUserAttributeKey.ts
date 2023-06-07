// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStandardAttributeKey } from '../../../../types';
import { CustomAttribute } from './CustomAttribute';

/**
 * The user attribute types available for Cognito.
 */
export type CognitoUserAttributeKey =
	| AuthStandardAttributeKey
	| CustomAttribute;
