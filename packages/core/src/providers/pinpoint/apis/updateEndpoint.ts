// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	UpdateEndpointInput,
	updateEndpoint as clientUpdateEndpoint,
} from '../../../awsClients/pinpoint';
import { UserProfile } from '../../../types';
import { amplifyUuid } from '../../../utils/amplifyUuid';
import { getClientInfo } from '../../../utils/getClientInfo';
import { PinpointUpdateEndpointInput } from '../types';
import { cacheEndpointId } from '../utils/cacheEndpointId';
import {
	clearCreatedEndpointId,
	createEndpointId,
} from '../utils/createEndpointId';
import { getEndpointId } from '../utils/getEndpointId';

/**
 * @internal
 */
export const updateEndpoint = async ({
	address,
	appId,
	category,
	channelType,
	credentials,
	identityId,
	optOut,
	region,
	userAttributes,
	userId,
	userProfile,
	userAgentValue,
}: PinpointUpdateEndpointInput): Promise<void> => {
	const endpointId = await getEndpointId(appId, category);
	// only generate a new endpoint id if one was not found in cache
	const createdEndpointId = !endpointId
		? createEndpointId(appId, category)
		: undefined;
	const {
		customProperties,
		demographic,
		email,
		location,
		metrics,
		name,
		plan,
	} = userProfile ?? {};

	// only automatically populate the endpoint with client info and identity id upon endpoint creation to
	// avoid overwriting the endpoint with these values every time the endpoint is updated
	const demographicsFromClientInfo: UserProfile['demographic'] = {};
	const resolvedUserId = createdEndpointId ? (userId ?? identityId) : userId;
	if (createdEndpointId) {
		const clientInfo = getClientInfo();
		demographicsFromClientInfo.appVersion = clientInfo.appVersion;
		demographicsFromClientInfo.make = clientInfo.make;
		demographicsFromClientInfo.model = clientInfo.model;
		demographicsFromClientInfo.modelVersion = clientInfo.version;
		demographicsFromClientInfo.platform = clientInfo.platform;
	}
	const mergedDemographic = {
		...demographicsFromClientInfo,
		...demographic,
	};
	const attributes = {
		...(email && { email: [email] }),
		...(name && { name: [name] }),
		...(plan && { plan: [plan] }),
		...customProperties,
	};

	const shouldAddDemographics = createdEndpointId || demographic;
	const shouldAddAttributes = email || customProperties || name || plan;
	const shouldAddUser = resolvedUserId || userAttributes;

	const input: UpdateEndpointInput = {
		ApplicationId: appId,
		EndpointId: endpointId ?? createdEndpointId,
		EndpointRequest: {
			RequestId: amplifyUuid(),
			EffectiveDate: new Date().toISOString(),
			ChannelType: channelType,
			Address: address,
			...(shouldAddAttributes && { Attributes: attributes }),
			...(shouldAddDemographics && {
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
			}),
			...(location && {
				Location: {
					City: location.city,
					Country: location.country,
					Latitude: location.latitude,
					Longitude: location.longitude,
					PostalCode: location.postalCode,
					Region: location.region,
				},
			}),
			Metrics: metrics,
			OptOut: optOut,
			...(shouldAddUser && {
				User: {
					UserId: resolvedUserId,
					UserAttributes: userAttributes,
				},
			}),
		},
	};
	try {
		await clientUpdateEndpoint({ credentials, region, userAgentValue }, input);
		// if we had to create an endpoint id, we need to now cache it
		if (createdEndpointId) {
			await cacheEndpointId(appId, category, createdEndpointId);
		}
	} finally {
		// at this point, we completely reset the behavior so even if the update was unsuccessful
		// we can just start over with a newly created endpoint id
		if (createdEndpointId) {
			clearCreatedEndpointId(appId, category);
		}
	}
};
