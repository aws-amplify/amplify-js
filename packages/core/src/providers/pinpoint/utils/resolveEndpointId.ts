// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assert } from '../../../errors';
import { AmplifyErrorCode } from '../../../types';
import { updateEndpoint } from '../apis/updateEndpoint';
import { PinpointUpdateEndpointInput } from '../types';
import { getEndpointId } from './getEndpointId';

/**
 * Resolves an endpoint id from cache or prepare via updateEndpoint if one does not already exist,
 * which will generate and cache an endpoint id between calls.
 *
 * @internal
 */
export const resolveEndpointId = async ({
	address,
	appId,
	category,
	channelType,
	credentials,
	identityId,
	region,
	userAgentValue,
}: PinpointUpdateEndpointInput) => {
	let endpointId = await getEndpointId(appId, category);

	if (!endpointId) {
		await updateEndpoint({
			address,
			appId,
			category,
			channelType,
			credentials,
			identityId,
			region,
			userAgentValue,
		});

		endpointId = await getEndpointId(appId, category);
	}

	assert(!!endpointId, AmplifyErrorCode.NoEndpointId);

	return endpointId;
};
