// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO Need to update types of data
export type AuthHubEventData =
	| { event: 'signIn'; data: any }
	| { event: 'signUp'; data: any }
	| { event: 'signUpFailure'; data: any }
	| { event: 'signIn_failure'; data: any }
	| { event: 'confirmSignUp'; data: any }
	| { event: 'signOut'; data: any }
	| { event: 'cognitoHostedUI'; data: any }
	| { event: 'tokenRefresh_failure'; data: Error | undefined }
	| { event: 'completeNewPassword_failure'; data: Error }
	| { event: 'userDeleted'; data: string }
	| { event: 'updateUserAttributes_failure'; data: Error }
	| { event: 'updateUserAttributes'; data: Record<string, string> }
	| { event: 'forgotPassword_failure'; data: Error }
	| { event: 'verify'; data: any }
	| { event: 'tokenRefresh'; data: undefined }
	| { event: 'configured'; data: null }
	| { event: 'autoSignIn'; data: any }
	| { event: 'forgotPassword'; data: any }
	| {
			event: 'parsingCallbackUrl';
			data: {
				url: string | undefined;
			};
	  }
	| { event: 'customOAuthState'; data: string }
	| { event: 'cognitoHostedUI_failure'; data: Error }
	| { event: 'customState_failure'; data: Error }
	| { event: 'forgotPasswordSubmit'; data: any }
	| { event: 'forgotPasswordSubmit_failure'; data: Error }
	| { event: 'autoSignIn_failure'; data: null };
