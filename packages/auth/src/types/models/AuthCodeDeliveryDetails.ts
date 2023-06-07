// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthUserAttributeKey, DeliveryMedium, GetAttributeKey } from '..';

/**
 * Data describing the dispatch of a confirmation code.
 */
export type AuthCodeDeliveryDetails<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	destination?: string;
	deliveryMedium?: DeliveryMedium;
	attributeName?: GetAttributeKey<UserAttributeKey>;
};
