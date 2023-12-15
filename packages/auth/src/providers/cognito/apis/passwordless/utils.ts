// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse, parseJsonError } from "@aws-amplify/core/internals/aws-client-utils";
import { AuthPasswordlessDeliveryDestination } from "../../types/models";
import { MetadataBearer } from "@aws-amplify/core/dist/esm/clients/types/aws";

export function getDeliveryMedium(destination: AuthPasswordlessDeliveryDestination) {
	const deliveryMediumMap: Record<AuthPasswordlessDeliveryDestination, string> =
		{
			EMAIL: 'EMAIL',
			PHONE: 'SMS',
		};
	return deliveryMediumMap[destination];
}

export const parseApiServiceError = async (
	response?: HttpResponse
): Promise<(Error & MetadataBearer) | undefined> => {
	const parsedError = await parseJsonError(response);
	if (!parsedError) {
		// Response is not an error.
		return;
	}
	return Object.assign(parsedError, {
		$metadata: parsedError.$metadata,
	});
};