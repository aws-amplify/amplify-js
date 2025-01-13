import { getRealtimeEndpointUrl } from '../src/Providers/AWSWebSocketProvider/appsyncUrl';

describe('getRealtimeEndpointUrl', () => {
	test('events', () => {
		const httpUrl =
			'https://abcdefghijklmnopqrstuvwxyz.appsync-api.us-east-1.amazonaws.com/event';

		const res = getRealtimeEndpointUrl(httpUrl).toString();

		expect(res).toEqual(
			'wss://abcdefghijklmnopqrstuvwxyz.appsync-realtime-api.us-east-1.amazonaws.com/event/realtime',
		);
	});
});
