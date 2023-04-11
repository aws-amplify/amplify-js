// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CustomAttribute } from '../..';
import { AuthStandardAttributeKey } from '../../../../types';

/**
 * The user attribute types available for Cognito.
 */
export type CognitoUserAttributeKey =
	| AuthStandardAttributeKey
	| CustomAttribute;
