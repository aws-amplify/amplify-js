import { InAppNotificationsResponse } from '../../types';

import PinpointMessagesClient from './pinpointClient';

// Gamma URL
// const url = 'https://714kasriok.execute-api.us-east-1.amazonaws.com';
// Prod
const url = 'https://pinpoint.us-east-1.amazonaws.com/';

export function getInAppMessages({ appId, credentials, endpointId, region }) {
	return getInAppCampaigns({
		appId,
		credentials,
		endpointId,
		region,
	});
}

export async function getInAppCampaigns({
	appId,
	credentials,
	endpointId,
	region,
}) {
	const options = {
		endpoint: url,
		region,
		...credentials,
	};
	const pinpointInternal = new PinpointMessagesClient(options);

	return pinpointInternal
		.getInAppMessages(getInAppMessagesRequest(appId, endpointId))
		.promise()
		.then(
			(response: InAppNotificationsResponse) =>
				response.InAppMessagesResponse.InAppMessageCampaigns
		)
		.catch(err => console.warn('Error: ' + err));
}

function getInAppMessagesRequest(appId: string, endpointId: string) {
	return {
		ApplicationId: appId,
		EndpointId: endpointId,
	};
}
