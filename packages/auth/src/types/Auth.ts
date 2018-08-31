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

 import { ICookieStorageData, ICognitoStorage } from "amazon-cognito-identity-js";

/**
* Parameters for user sign up
*/
export interface SignUpParams {
    username: string;
    password: string;
    SignupAttributes?: Object;
}

export interface AuthCache {
    setItem(),
    getItem(),
    removeItem()
}

/**
 * Auth instance options
 */
export interface AuthOptions {
    userPoolId: string,
    userPoolWebClientId: string,
    identityPoolId: string,
    region?: string,
    mandatorySignIn: boolean
    cookieStorage?: ICookieStorageData,
    oauth?: OAuth,
    refreshHandlers?: object,
    storage?: ICognitoStorage,
    authenticationFlowType?: string,
    identityPoolRegion?: string
}

/**
 * Details for multi-factor authentication
 */
export interface MfaRequiredDetails {
    challengeName: any,
    challengeParameters: any
}

/**
 * interface for federatedResponse
 */
export interface FederatedResponse {
    // access token
    token: string,
    // identity id
    identity_id?: string,
    // the universal time when token expired
    expires_at: number
}

export interface OAuth {
    domain : string,
	scope : Array<string>,
	redirectSignIn : string,
	redirectSignOut : string,
    responseType: string,
    options?: object
}

export interface ConfirmSignUpOptions {
    forceAliasCreation?: boolean
}

export interface SignOutOpts {
    global?: boolean
}
