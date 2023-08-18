// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from 'uuid';
import { ClientDevice } from '../../..';
import {
	updateEndpoint as clientUpdateEndpoint,
	UpdateEndpointInput,
} from '../../../AwsClients/Pinpoint';
import { PinpointUpdateEndpointParameters } from '../types';
import { cacheEndpointId, getEndpointId } from '../utils';

/**
 * @internal
 */
export const updateEndpoint = async ({
	appId,
	category,
	channelType,
	credentials,
	identityId,
	region,
	userId,
	userProfile,
	userAgentValue,
}: PinpointUpdateEndpointParameters): Promise<void> => {
	const endpointId = await getEndpointId(appId, category);
	// only generate a new endpoint id if one was not found in cache
	const createdEndpointId = !endpointId ? uuidv4() : undefined;
	const { address, attributes, demographic, location, metrics, optOut } =
		userProfile ?? {};
	const clientInfo = ClientDevice.clientInfo();
	const mergedDemographic = {
		appVersion: clientInfo.appVersion,
		make: clientInfo.make,
		model: clientInfo.model,
		modelVersion: clientInfo.version,
		platform: clientInfo.platform,
		...demographic,
	};
	const input: UpdateEndpointInput = {
		ApplicationId: appId,
		EndpointId: endpointId ?? createdEndpointId,
		EndpointRequest: {
			RequestId: uuidv4(),
			EffectiveDate: new Date().toISOString(),
			ChannelType: channelType,
			Address: address,
			Attributes: attributes,
			Demographic: {
				AppVersion: mergedDemographic.appVersion,
				Locale: mergedDemographic.locale,
				Make: mergedDemographic.make,
				Model: mergedDemographic.model,
				ModelVersion: mergedDemographic.modelVersion,
				Platform: mergedDemographic.platform,
				PlatformVersion: mergedDemographic.platformVersion,
				Timezone: mergedDemographic.timezone,
			},
			Location: {
				City: location?.city,
				Country: location?.country,
				Latitude: location?.latitude,
				Longitude: location?.longitude,
				PostalCode: location?.postalCode,
				Region: location?.region,
			},
			Metrics: metrics,
			OptOut: optOut,
			User: {
				UserId: userId ?? identityId,
				UserAttributes: attributes,
			},
		},
	};
	await clientUpdateEndpoint({ credentials, region, userAgentValue }, input);
	// if we had to create an endpoint id, we need to now cache it
	if (!!createdEndpointId) {
		cacheEndpointId(appId, category, createdEndpointId);
	}
};
