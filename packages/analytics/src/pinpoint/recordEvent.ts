import { parseAWSExports } from '@aws-amplify/core';
import { Amplify, httpClient } from '@aws-amplify/core';
import { StorageHelper } from '@aws-amplify/core';

import { v4 } from 'uuid';

const ENDPOINT_PREFIX = 'Amplify-pinpoint-endpoint';

type RecordContent = object;

export function record(content: RecordContent) {
	async function _record() {
		const user = Amplify.getUser();
		const userId = user.awsCreds?.identityId;
		const config = parseAWSExports(Amplify.getConfig());
		const {
			Analytics: {
				AWSPinpoint: { appId, region },
			},
		} = config;

		const id = await getEndpoint({ userId, region, appId });
		const eventId = v4();
		httpClient({
			authMode: 'SigV4',
			body: {
				BatchItem: {
					[id]: {
						Endpoint: {},
						Events: {
							[eventId]: {
								EventType: 'record_event',
								Attributes: content,
								Timestamp: new Date().toISOString(),
							},
						},
					},
				},
			},
			endpoint: `https://pinpoint.${region}.amazonaws.com/v1/apps/${appId}/events`,
			headers: {
				'x-amz-user-agent': 'amplify test',
			},
			method: 'POST',
			service: 'mobiletargeting',
			region,
		});
		console.log('recording event');
	}
	_record();
}

function readEndpointFromStorage({ userId }): string {
	const _storage = new StorageHelper().getStorage();
	const endpoint = _storage.getItem(`${ENDPOINT_PREFIX}-${userId}`);

	return endpoint;
}

function saveEndpointOnStorage({ userId, endpointId }) {
	const _storage = new StorageHelper().getStorage();
	_storage.setItem(`${ENDPOINT_PREFIX}-${userId}`, endpointId);
}

async function getEndpoint({ userId, region, appId }): Promise<string> {
	let endpointId = readEndpointFromStorage({ userId });

	if (!endpointId) {
		return createNewEndpoint({ userId, region, appId });
	} else {
		return endpointId;
	}
}

async function createNewEndpoint({ userId, region, appId }) {
	const endpointId = v4();

	const result = await httpClient({
		authMode: 'SigV4',
		body: {
			Attributes: {},
			Demographic: {
				AppVersion: 'Chrome/109.0.0.0',
				Make: 'Gecko',
				Model: 'Chrome',
				ModelVersion: '109.0.0.0',
				Platform: 'MacIntel',
			},
			EffectiveDate: '2023-01-26T19:59:44.844Z',
			Location: {},
			Metrics: {},
			RequestId: 'faa900c2-9db3-11ed-bfc6-eb768166315f',
			User: {
				UserAttributes: {},
				UserId: userId,
			},
		},
		endpoint: `https://pinpoint.${region}.amazonaws.com/v1/apps/${appId}/endpoints/${endpointId}`,
		headers: {},
		method: 'PUT',
		service: 'mobiletargeting',
		region,
	});

	if (result?.Message === 'Accepted') {
		saveEndpointOnStorage({ userId, endpointId });
		return endpointId;
	} else {
		throw new Error('Create endpoint fail...');
	}
}
