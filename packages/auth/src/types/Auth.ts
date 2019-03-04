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

 import { ICookieStorageData, ICognitoStorage, CognitoUserAttribute } from "amazon-cognito-identity-js";

/**
* Parameters for user sign up
*/
export interface SignUpParams {
    username: string,
    password: string,
    attributes?: object,
    validationData?: CognitoUserAttribute[],
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
    identityPoolId?: string,
    region?: string,
    mandatorySignIn?: boolean
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

/**
 * interface for federatedUser
 */
export interface FederatedUser {
    name: string,
    email?: string
}

export interface awsCognitoOAuthOpts {
    domain: string,
	scope: Array<string>,
	redirectSignIn: string,
	redirectSignOut: string,
    responseType: string,
    options?: object,
    urlOpener?: (url:string, redirectUrl: string) => Promise<any>
}

export interface OAuth {
    awsCognito?: awsCognitoOAuthOpts,
    auth0?: any
}

export interface ConfirmSignUpOptions {
    forceAliasCreation?: boolean
}

export interface SignOutOpts {
    global?: boolean
}

export interface CurrentUserOpts {
    bypassCache: boolean
}

export type UsernamePasswordOpts = {
    username: string,
    password: string,
    validationData?: {[key:string]: any}
};

// We can extend this in the future if needed
export type SignInOpts = UsernamePasswordOpts;

export function isUsernamePasswordOpts(obj: any): obj is UsernamePasswordOpts {
    return !!(obj as UsernamePasswordOpts).username;
}
