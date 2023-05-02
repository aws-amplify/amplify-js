// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum AuthSignInStep {
	CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE = 'CONFIRM_SIGN_IN_SMS_MFA_CODE',
  
	CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE = 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE',
  
	CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
  
	CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_CODE = 'CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_CODE',

	CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_SETUP = 'CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_SETUP',
  
	CONFIRM_SIGN_IN_WITH_MFA_SELECTION = 'CONFIRM_SIGN_IN_WITH_MFA_SELECTION',
  
	CONFIRM_SIGN_UP = 'CONFIRM_SIGN_UP',
  
	RESET_PASSWORD = 'RESET_PASSWORD',
  
	DONE = 'DONE',
  }
  