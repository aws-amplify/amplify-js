import {
	AmazonPersonalizeProvider,
	AWSKinesisFirehoseProvider,
	AWSKinesisProvider,
	AWSPinpointProvider,
} from '../../src/Providers';

describe('Each provider client is configured with the custom user client', () => {
	describe('AmazonPersonalizeProvider', () => {
		test('received the custom user client', () => {
			const provider = new AmazonPersonalizeProvider();
			// Run init to setup the client
			provider['_init']({ region: 'us-east-1' }, {});

			expect(
				provider['_personalize']['config']['customUserAgent']
			).toMatchObject([
				['aws-amplify', expect.any(String)],
				['analytics', '1'],
				['framework', '0'],
			]);
		});
	});

	describe('AWSKinesisFirehoseProvider', () => {
		test('received the custom user client', () => {
			const provider = new AWSKinesisFirehoseProvider();
			// Run init to setup the client
			provider['_init']({ region: 'us-east-1' }, {});

			expect(
				provider['_kinesisFirehose']['config']['customUserAgent']
			).toMatchObject([
				['aws-amplify', expect.any(String)],
				['analytics', '1'],
				['framework', '0'],
			]);
		});
	});

	describe('AWSKinesisProvider', () => {
		test('received the custom user client', () => {
			const provider = new AWSKinesisProvider();
			// Run init to setup the client
			provider['_init']({ region: 'us-east-1' }, {});

			expect(provider['_kinesis']['config']['customUserAgent']).toMatchObject([
				['aws-amplify', expect.any(String)],
				['analytics', '1'],
				['framework', '0'],
			]);
		});
	});

	describe('AWSPinpointProvider', () => {
		test('received the custom user client', () => {
			const provider = new AWSPinpointProvider({ region: 'us-east-1' });
			// Run init to setup the client
			provider['_initClients']({});

			expect(
				provider['pinpointClient']['config']['customUserAgent']
			).toMatchObject([
				['aws-amplify', expect.any(String)],
				['analytics', '1'],
				['framework', '0'],
			]);
		});
	});
});
