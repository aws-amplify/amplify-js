// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthPasswordlessDeliveryDestination } from "../../types/models";

export function getDeliveryMedium(destination: AuthPasswordlessDeliveryDestination) {
	const deliveryMediumMap: Record<AuthPasswordlessDeliveryDestination, string> =
		{
			EMAIL: 'EMAIL',
			PHONE: 'SMS',
		};
	return deliveryMediumMap[destination];
}