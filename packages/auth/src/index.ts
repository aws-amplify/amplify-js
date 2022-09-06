/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { CognitoHostedUIIdentityProvider } from './types/Auth';
import { AuthErrorStrings } from './common/AuthErrorStrings';

/**
 * @deprecated use named import
 */
export { CognitoHostedUIIdentityProvider, AuthErrorStrings };

export {
	CognitoProvider,
	CognitoUser,
	AWSCredentials,
} from './Providers/CognitoProvider';
export { AuthPluggable } from './AuthPluggable';
export {
	USER_PARAM_TYPE,
	SignInWithLink,
	SignInWithWebAuthn,
	SignInResult,
	SignInParams,
	isApiKey,
	isAuthorizationToken,
	GRAPHQL_AUTH_MODE,
} from './types';

export { Auth } from './Auth';
export { Auth as default } from './Auth';
export * from './types';
