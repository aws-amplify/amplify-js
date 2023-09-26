// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateRandomString } from '@aws-amplify/core/internals/utils';

export const generateState = (): string => {
	return generateRandomString(32);
};
