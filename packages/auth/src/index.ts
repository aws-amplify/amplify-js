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

import { Auth } from './Auth';

// TODO: replace imports for appendToCognitoUserAgent, CookieStorage
import { AuthErrorStrings } from './constants/AuthErrorStrings';
import { GRAPHQL_AUTH_MODE } from './constants/GraphQLAuthMode';
import { CognitoHostedUIIdentityProvider } from './constants/CognitoHostedUIIdentityProvider';

/**
 * @deprecated use named import
 */
export default Auth;
export {
	Auth,
	CognitoHostedUIIdentityProvider,
	AuthErrorStrings,
	GRAPHQL_AUTH_MODE,
};
