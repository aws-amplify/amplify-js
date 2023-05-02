// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AdditionalInfo } from './AdditionalInfo';
import { AuthCodeDeliveryDetails } from './AuthCodeDeliveryDetails';
import { AuthSignInStep } from './AuthSignInStep';
import { AuthUserAttributeKey } from './AuthUserAttributeKey';

export type AuthNextSignInStep<UserAttributeKey extends AuthUserAttributeKey> =
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE;
			additionalInfo?: AdditionalInfo;
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_MFA_SELECTION;
			additionalInfo?: AdditionalInfo;
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED;
			additionalInfo?: AdditionalInfo;
			missingAttributes?: UserAttributeKey[];
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE;
			additionalInfo?: AdditionalInfo;
			codeDeliveryDetails?: AuthCodeDeliveryDetails;
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_CODE;
			additionalInfo?: AdditionalInfo;
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_SETUP;
			additionalInfo?: AdditionalInfo;
			secretCode?: string;
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_UP;
	  }
	| {
			signInStep: AuthSignInStep.RESET_PASSWORD;
	  }
	| {
			signInStep: AuthSignInStep.DONE;
	  };
