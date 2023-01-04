// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthCodeDeliveryDetails, AuthResetPasswordStep, AuthUserAttributeKey } from '.';

export type AuthNextResetPasswordStep<UserAttributeKey extends AuthUserAttributeKey> = {
	resetPasswordStep: AuthResetPasswordStep;
	additionalInfo?: { [key: string]: string };
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
};
