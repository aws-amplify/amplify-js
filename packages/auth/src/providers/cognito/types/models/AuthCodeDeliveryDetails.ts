// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthUserAttributeKey, DeliveryMedium } from '../../../../types';

export type AuthCodeDeliveryDetails<
	UserAttributeKey extends AuthUserAttributeKey
> = {
	destination: string;
	deliveryMedium: DeliveryMedium;
	attributeName?: UserAttributeKey;
};
