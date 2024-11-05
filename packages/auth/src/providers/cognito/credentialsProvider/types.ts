// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthConfig, Identity } from '@aws-amplify/core';

export const IdentityIdStorageKeys = {
	identityId: 'identityId',
};

export interface IdentityIdStore {
	setAuthConfig(authConfigParam: AuthConfig): void;
	loadIdentityId(): Promise<Identity | null>;
	storeIdentityId(identity: Identity): Promise<void>;
	clearIdentityId(): Promise<void>;
}
