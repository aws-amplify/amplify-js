// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	appId,
	clientDemographic,
	endpointId as defaultEndpointId,
	uuid,
} from '../../testUtils/data';

export const getExpectedInput = ({
	address,
	attributes,
	channelType,
	demographic = clientDemographic as any,
	endpointId = defaultEndpointId,
	location,
	metrics,
	optOut,
	userAttributes,
	userId,
}: any) =>
	expect.objectContaining({
		ApplicationId: appId,
		EndpointId: endpointId,
		EndpointRequest: expect.objectContaining({
			RequestId: uuid,
			EffectiveDate: expect.any(String),
			ChannelType: channelType,
			Address: address,
			Attributes: attributes,
			Demographic: {
				AppVersion: demographic.appVersion,
				Locale: demographic.locale,
				Make: demographic.make,
				Model: demographic.model,
				ModelVersion: demographic.modelVersion ?? demographic.version,
				Platform: demographic.platform,
				PlatformVersion: demographic.platformVersion,
				Timezone: demographic.timezone,
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
				UserId: userId,
				UserAttributes: userAttributes,
			},
		}),
	});
