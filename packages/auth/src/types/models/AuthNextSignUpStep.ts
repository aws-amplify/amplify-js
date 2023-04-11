// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AdditionalInfo,
	AuthCodeDeliveryDetails,
	AuthSignUpStep,
	AuthUserAttributeKey,
} from '..';

/**
 * Data encapsulating the next step in the Sign Up process
 */
export type AuthNextSignUpStep<UserAttributeKey extends AuthUserAttributeKey> =
	{
		signUpStep?: AuthSignUpStep;
		additionalInfo?: AdditionalInfo;
		codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
	};
