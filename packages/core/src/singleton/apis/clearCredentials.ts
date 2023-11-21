// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '~/src/singleton/Amplify';

export function clearCredentials(): Promise<void> {
	return Amplify.Auth.clearCredentials();
}
