// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AdditionalInfo, AuthCodeDeliveryDetails, AuthSignInStep } from '.';
import { AuthUserAttributeKey } from './authUserAttributeKey';

export type AuthNextSignInStep<UserAttributeKey extends AuthUserAttributeKey> = {
	signInStep: AuthSignInStep;
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
	additionalInfo?: AdditionalInfo;
	totpCode?: string;
	missingAttributes?: UserAttributeKey[];
};
