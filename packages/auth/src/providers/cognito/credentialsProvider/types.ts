// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthConfig } from '@aws-amplify/core';

export const IdentityIdStorageKeys = {
	identityId: 'identityId',
};

export interface IdentityIdStore {
	setAuthConfig(authConfigParam: AuthConfig): void;
	loadIdentityId(): Promise<string | null>;
	storeIdentityId(identity: string): Promise<void>;
	clearIdentityId(identityPoolId: string): Promise<void>;
}
