// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { 
	AdditionalInfo, 
	AuthCodeDeliveryDetails, 
	AuthResetPasswordStep, 
	AuthUserAttributeKey 
} from '..';

export type AuthNextResetPasswordStep<
	UserAttributeKey extends AuthUserAttributeKey
> = {
	resetPasswordStep: AuthResetPasswordStep;
	additionalInfo?: AdditionalInfo;
	codeDeliveryDetails: AuthCodeDeliveryDetails<UserAttributeKey>;
};
