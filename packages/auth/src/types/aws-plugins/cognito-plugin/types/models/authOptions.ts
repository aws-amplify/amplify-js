// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ClientMetadata, ICognitoStorage, ICookieStorageData } from ".";

export type AuthOptions = {
	userPoolId?: string;
	userPoolWebClientId?: string;
	identityPoolId?: string;
	region?: string;
	mandatorySignIn?: boolean;
	cookieStorage?: ICookieStorageData;
	oauth?: any;
	refreshHandlers?: object;
	storage?: ICognitoStorage;
	authenticationFlowType?: string;
	identityPoolRegion?: string;
	clientMetaData?: ClientMetadata;
	endpoint?: string;
	signUpVerificationMethod?: 'code' | 'link';
}
