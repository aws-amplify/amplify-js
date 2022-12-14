// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ClientMetadata, CognitoStorage, CookieStorageData, OAuth } from '.';

export type AuthOptions = {
	userPoolId?: string;
	userPoolWebClientId?: string;
	identityPoolId?: string;
	region?: string;
	mandatorySignIn?: boolean;
	cookieStorage?: CookieStorageData;
	oauth?: OAuth;
	refreshHandlers?: object;
	storage?: CognitoStorage;
	authenticationFlowType?: string;
	identityPoolRegion?: string;
	clientMetaData?: ClientMetadata;
	endpoint?: string;
	signUpVerificationMethod?: 'code' | 'link';
};
